# pipeline.py

"""
BriefLab RAG pipeline.

analyze_urls  → extract → chunk → embed → upsert → summarize
answer_question → embed query → retrieve → generate answer
"""

import asyncio
import logging
from typing import List

from app.core.schemas import SourceSummary, AnalyzeResponse, AnswerResponse, Citation
from app.core.utils import make_doc_id
from app.services import extractor, chunker, embedder, llm
from app.services.extractor import ExtractionError
from app.services.qdrant_service import qdrant_service

logger = logging.getLogger(__name__)


# ── Helpers ───────────────────────────────────────────────────────────────────

def _run_in_executor(func, *args):
    """Run a blocking function in the default thread pool."""
    loop = asyncio.get_event_loop()
    return loop.run_in_executor(None, func, *args)


async def _process_single_url(url: str) -> SourceSummary:
    """Extract, chunk, embed, index, and summarize one URL."""

    doc_id = make_doc_id(url)

    # ── 1. Extract ────────────────────────────────────────────────────────────
    logger.info(f"Extracting content from: {url}")
    content = await _run_in_executor(extractor.extract, url)

    # ── 2. Chunk ──────────────────────────────────────────────────────────────
    chunks = chunker.chunk_content(
        url=content.url,
        source_type=content.source_type,
        title=content.title,
        text=content.text,
    )
    logger.info(f"Created {len(chunks)} chunks for {url}")

    # ── 3. Embed ──────────────────────────────────────────────────────────────
    texts = [c.text for c in chunks]
    embeddings = await _run_in_executor(embedder.embed_texts, texts)

    # ── 4. Upsert into Qdrant ─────────────────────────────────────────────────
    await qdrant_service.upsert_chunks(chunks, embeddings)

    # ── 5. Summarize ──────────────────────────────────────────────────────────
    # Use the full text (not chunks) for a coherent summary
    logger.info(f"Summarizing content for: {url}")
    summary = await _run_in_executor(llm.summarize, content.text)

    return SourceSummary(
        url=url,
        source_type=content.source_type,
        title=content.title,
        summary=summary,
        chunk_count=len(chunks),
    )


# ── Public pipeline functions ─────────────────────────────────────────────────

async def analyze_urls(urls: List[str]) -> AnalyzeResponse:
    """
    Process a list of URLs: extract → chunk → embed → index → summarize.
    URLs are processed concurrently.
    """
    tasks = [_process_single_url(url) for url in urls]
    results = await asyncio.gather(*tasks, return_exceptions=True)

    sources: List[SourceSummary] = []
    errors: List[str] = []

    for url, result in zip(urls, results):
        if isinstance(result, Exception):
            logger.error(f"Failed to process {url}: {result}")
            errors.append(f"{url}: {str(result)}")
        else:
            sources.append(result)

    if errors and not sources:
        raise ExtractionError("All URLs failed to process:\n" + "\n".join(errors))

    return AnalyzeResponse(sources=sources)


async def answer(urls: List[str], question: str) -> AnswerResponse:
    """
    RAG Q&A pipeline:
      1. Embed the question
      2. Retrieve top-K chunks from the given URLs
      3. Generate a grounded answer
      4. Return answer + citations
    """
    # Map URLs to doc_ids for Qdrant filtering
    doc_ids = [make_doc_id(url) for url in urls]

    # ── 1. Embed question ─────────────────────────────────────────────────────
    query_vector = await _run_in_executor(embedder.embed_query, question)

    # ── 2. Retrieve ───────────────────────────────────────────────────────────
    retrieved_chunks = await qdrant_service.search(
        query_vector=query_vector,
        doc_ids=doc_ids,
    )

    if not retrieved_chunks:
        # Content may not have been analyzed yet — attempt on-the-fly indexing
        logger.warning("No indexed content found for provided URLs. Run /analyze first.")
        return AnswerResponse(
            answer="The content has not been analyzed yet. Please call /api/analyze first.",
            citations=[],
        )

    # ── 3. Generate answer ────────────────────────────────────────────────────
    answer_text = await _run_in_executor(llm.answer_question, question, retrieved_chunks)

    # ── 4. Build citations ────────────────────────────────────────────────────
    citations = [
        Citation(
            url=chunk.url,
            source_type=chunk.source_type,
            title=chunk.title,
            excerpt=chunk.text[:300] + ("..." if len(chunk.text) > 300 else ""),
            score=round(chunk.score, 4),
        )
        for chunk in retrieved_chunks
    ]

    return AnswerResponse(answer=answer_text, citations=citations)