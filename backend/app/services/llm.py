"""
LLM service — Llama 3.2 via Ollama using LangChain's Ollama integration.

Two tasks:
  1. summarize(text)         → concise bullet-point summary
  2. answer(question, chunks) → grounded answer with source attribution
"""

import logging
from typing import List

from langchain_ollama import OllamaLLM
from langchain_core.prompts import PromptTemplate

from app.core.config import settings
from app.services.qdrant_service import RetrievedChunk

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

Context (retrieved excerpts):
{context}

---
Question: {question}

Answer (be concise and direct, cite the source URL when relevant):"""
)


def answer_question(question: str, chunks: List[RetrievedChunk]) -> str:
    """Generate a grounded answer from retrieved chunks."""
    if not chunks:
        return "No relevant content was found in the provided sources to answer your question."

    # Build context block — number each excerpt and include its source URL
    context_parts = []
    for i, chunk in enumerate(chunks, 1):
        source_label = chunk.title or chunk.url
        context_parts.append(f"[{i}] Source: {source_label}\n{chunk.text}")

    context = "\n\n".join(context_parts)

    llm = _get_llm()
    chain = QA_PROMPT | llm

    result = chain.invoke({"context": context, "question": question})
    return result.strip()