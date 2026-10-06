"""
LLM service — Llama 3.2 via Ollama using LangChain's Ollama integration.

Two tasks:
  1. summarize(text)         → concise bullet-point summary
  2. answer(question, chunks) → grounded answer with source attribution
"""

import json
import logging
import re
from dataclasses import dataclass, field
from typing import List

from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

from app.core.config import settings
from app.services.qdrant_service import RetrievedChunk

MAX_HISTORY_TURNS = 3
HISTORY_CHAR_LIMIT = 2000

logger = logging.getLogger(__name__)


def _get_llm() -> OllamaLLM:
    return OllamaLLM(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.LLM_MODEL,
        temperature=settings.LLM_TEMPERATURE,
        num_predict=settings.LLM_MAX_TOKENS,
    )


# ── Summarization ─────────────────────────────────────────────────────────────

SUMMARY_PROMPT = PromptTemplate.from_template(
    """You are BriefLab, an expert content summarizer.

Summarize the following content concisely. Focus on:
- Main topic and purpose
- Key findings, arguments, or events (3-7 bullet points)
- Any notable conclusions

Content:
{text}

---
Provide a clear, structured summary (2-3 sentences intro + bullet points). Do not add commentary outside the summary."""
)


def summarize(text: str) -> str:
    """Generate a concise summary of the provided text."""
    llm = _get_llm()
    chain = SUMMARY_PROMPT | llm

    # Truncate very long texts to fit context window (~12k chars ≈ safe for most models)
    MAX_CHARS = 12_000
    truncated = text[:MAX_CHARS] + ("\n\n[Content truncated for brevity...]" if len(text) > MAX_CHARS else "")

    result = chain.invoke({"text": truncated})
    return result.strip()


# ── Question Answering ────────────────────────────────────────────────────────

QA_PROMPT = PromptTemplate.from_template(
    """You are BriefLab, a precise question-answering assistant.

Answer the user's question using ONLY the context provided below.
If the answer is not present in the context, say "The provided content does not contain enough information to answer this question."
Do not invent facts. Do not reference external knowledge.

{history}Context (retrieved excerpts):
{context}

---
Question: {question}

Answer (be concise and direct, cite the source URL when relevant):"""
)


def _format_history(history: list) -> str:
    """Format conversation history, keeping last N exchanges within a char limit."""
    if not history:
        return ""

    tail = history[-MAX_HISTORY_TURNS * 2:]

    lines = []
    total_chars = 0
    for entry in tail:
        if isinstance(entry, dict):
            role = entry.get("role", "unknown").capitalize()
            content = entry.get("content", "")
        else:
            role = getattr(entry, "role", "unknown").capitalize()
            content = getattr(entry, "content", "")
        line = f"{role}: {content}"
        total_chars += len(line)
        if total_chars > HISTORY_CHAR_LIMIT:
            break
        lines.append(line)

    if not lines:
        return ""

    return "Previous conversation:\n" + "\n".join(lines) + "\n\n"


def answer_question(question: str, chunks: List[RetrievedChunk], history: list = None) -> str:
    """Generate a grounded answer from retrieved chunks."""
    if not chunks:
        return "No relevant content was found in the provided sources to answer your question."

    history_block = _format_history(history or [])

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source_label = chunk.title or chunk.url
        context_parts.append(f"[{i}] Source: {source_label}\n{chunk.text}")

    context = "\n\n".join(context_parts)

    llm = _get_llm()
    chain = QA_PROMPT | llm

    result = chain.invoke({"context": context, "question": question, "history": history_block})
    return result.strip()


async def answer_question_stream(question: str, chunks: List[RetrievedChunk], history: list = None):
    """Async generator that streams LLM answer tokens one by one."""
    if not chunks:
        yield "No relevant content was found in the provided sources to answer your question."
        return

    history_block = _format_history(history or [])

    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source_label = chunk.title or chunk.url
        context_parts.append(f"[{i}] Source: {source_label}\n{chunk.text}")

    context = "\n\n".join(context_parts)

    llm = _get_llm()

    try:
        async for token in llm.astream(
            QA_PROMPT.format(context=context, question=question, history=history_block)
        ):
            yield token
    except Exception as e:
        logger.error(f"LLM streaming error: {e}")
        yield f"\n\n[Error during generation: {e}]"


# ── Sentiment & topic detection ───────────────────────────────────────────────

ANALYTICS_MAX_CHARS = 8_000

_VALID_SENTIMENTS = {"positive", "negative", "neutral", "mixed"}

ANALYTICS_PROMPT = PromptTemplate.from_template(
    """You are BriefLab's content analyst. Analyze the content below and respond with ONLY a JSON object — no markdown, no code fences, no explanation.

The JSON must have exactly these keys:
{{
  "sentiment": "positive" | "negative" | "neutral" | "mixed",
  "sentiment_score": <float from -1.0 (very negative) to 1.0 (very positive)>,
  "topics": ["topic 1", "topic 2", "topic 3"]
}}

Rules:
- "sentiment" must be one of: positive, negative, neutral, mixed.
- "sentiment_score" reflects the overall tone; 0.0 is neutral.
- "topics" must contain 3 to 6 short labels (1-3 words each), most important first.
- Base everything strictly on the content provided.

Content:
{text}"""
)


@dataclass
class ContentAnalytics:
    sentiment: str = "neutral"
    sentiment_score: float = 0.0
    topics: List[str] = field(default_factory=list)


def _get_json_llm() -> OllamaLLM:
    """LLM instance constrained to emit valid JSON."""
    return OllamaLLM(
        base_url=settings.OLLAMA_BASE_URL,
        model=settings.LLM_MODEL,
        temperature=0,
        num_predict=512,
        format="json",
    )


def _parse_analytics(raw: str) -> ContentAnalytics:
    """Parse the LLM's JSON reply defensively, never raising."""
    if not raw or not raw.strip():
        return ContentAnalytics()

    text = re.sub(r"```(?:json)?", "", raw, flags=re.IGNORECASE).strip()
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1 or end < start:
        return ContentAnalytics()

    try:
        data = json.loads(text[start : end + 1])
    except (json.JSONDecodeError, ValueError):
        return ContentAnalytics()

    if not isinstance(data, dict):
        return ContentAnalytics()

    sentiment = str(data.get("sentiment", "")).strip().lower()
    if sentiment not in _VALID_SENTIMENTS:
        sentiment = "neutral"

    try:
        score = float(data.get("sentiment_score", 0.0))
    except (TypeError, ValueError):
        score = 0.0
    score = max(-1.0, min(1.0, score))

    topics: List[str] = []
    raw_topics = data.get("topics", [])
    if isinstance(raw_topics, list):
        for item in raw_topics:
            label = str(item).strip()
            if label and label not in topics:
                topics.append(label)

    return ContentAnalytics(
        sentiment=sentiment,
        sentiment_score=round(score, 3),
        topics=topics[:6],
    )


def analyze_content(text: str) -> ContentAnalytics:
    """Detect the overall sentiment, tone score, and key topics of a piece of content."""
    if not text or not text.strip():
        return ContentAnalytics()

    truncated = text[:ANALYTICS_MAX_CHARS]
    if len(text) > ANALYTICS_MAX_CHARS:
        truncated += "\n\n[Content truncated for brevity...]"

    try:
        chain = ANALYTICS_PROMPT | _get_json_llm()
        raw = chain.invoke({"text": truncated})
    except Exception as e:
        logger.error(f"Content analytics failed: {e}")
        return ContentAnalytics()

    return _parse_analytics(raw)
