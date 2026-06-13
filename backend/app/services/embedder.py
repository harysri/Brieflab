import logging
from typing import List

import httpx

from app.core.config import settings

logger = logging.getLogger(__name__)

OLLAMA_EMBED_URL = f"{settings.OLLAMA_BASE_URL}/api/embed"


def _call_ollama_api(texts: List[str]) -> List[List[float]]:
    with httpx.Client(timeout=120.0) as client:
        response = client.post(
            OLLAMA_EMBED_URL,
            json={
                "model": settings.EMBEDDING_MODEL,
                "input": texts,
            },
        )
        response.raise_for_status()
        result = response.json()

    return result["embeddings"]


def embed_texts(texts: List[str]) -> List[List[float]]:
    if not texts:
        return []

    BATCH_SIZE = 32
    all_embeddings: List[List[float]] = []

    for i in range(0, len(texts), BATCH_SIZE):
        batch = texts[i : i + BATCH_SIZE]
        logger.info(f"Embedding batch {i // BATCH_SIZE + 1} ({len(batch)} texts)...")
        batch_embeddings = _call_ollama_api(batch)
        all_embeddings.extend(batch_embeddings)

    return all_embeddings


def embed_query(query: str) -> List[float]:
    return embed_texts([query])[0]
