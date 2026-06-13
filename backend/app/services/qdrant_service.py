"""
Qdrant vector store service.

Handles collection setup, upserting chunks, and semantic search.
"""

import logging
from typing import List, Optional
from dataclasses import dataclass

from qdrant_client import AsyncQdrantClient
from qdrant_client.models import (
    Distance,
    VectorParams,
    PointStruct,
    Filter,
    FieldCondition,
    MatchAny,
    ScoredPoint,
    PayloadSchemaType,
)

from app.core.config import settings
from app.core.schemas import SourceType
from app.services.chunker import TextChunk

logger = logging.getLogger(__name__)


@dataclass
class RetrievedChunk:
    chunk_id: str
    doc_id: str
    url: str
    source_type: SourceType
    title: Optional[str]
    text: str
    score: float


class QdrantService:
    def __init__(self):
        self._client: Optional[AsyncQdrantClient] = None

    @property
    def client(self) -> AsyncQdrantClient:
        if self._client is None:
            raise RuntimeError("QdrantService not initialized. Call initialize() first.")
        return self._client

    async def initialize(self):
        """Connect to Qdrant Cloud and ensure collection exists."""
        self._client = AsyncQdrantClient(
            url=settings.QDRANT_URL,
            api_key=settings.QDRANT_API_KEY,
        )

        collections = await self._client.get_collections()
        existing = [c.name for c in collections.collections]

        if settings.QDRANT_COLLECTION not in existing:
            logger.info(f"Creating Qdrant collection: {settings.QDRANT_COLLECTION}")
            await self._client.create_collection(
                collection_name=settings.QDRANT_COLLECTION,
                vectors_config=VectorParams(
                    size=settings.EMBEDDING_DIMENSION,
                    distance=Distance.COSINE,
                ),
            )

        # Ensure a keyword index on doc_id so filtered searches work
        await self._client.create_payload_index(
            collection_name=settings.QDRANT_COLLECTION,
            field_name="doc_id",
            field_schema=PayloadSchemaType.KEYWORD,
        )

    async def upsert_chunks(
        self,
        chunks: List[TextChunk],
        embeddings: List[List[float]],
    ):
        """Store chunks with their embeddings into Qdrant."""
        points = []
        for chunk, vector in zip(chunks, embeddings):
            points.append(
                PointStruct(
                    id=abs(hash(chunk.chunk_id)) % (2**63),   # Qdrant needs uint64
                    vector=vector,
                    payload={
                        "chunk_id": chunk.chunk_id,
                        "doc_id": chunk.doc_id,
                        "url": chunk.url,
                        "source_type": chunk.source_type.value,
                        "title": chunk.title,
                        "text": chunk.text,
                        "chunk_index": chunk.chunk_index,
                    },
                )
            )

        await self.client.upsert(
            collection_name=settings.QDRANT_COLLECTION,
            points=points,
        )
        logger.info(f"Upserted {len(points)} chunks into Qdrant.")

    async def search(
        self,
        query_vector: List[float],
        doc_ids: Optional[List[str]] = None,
        top_k: int = settings.TOP_K,
    ) -> List[RetrievedChunk]:
        """
        Semantic search. Optionally filter to specific doc_ids
        (i.e., only retrieve from user-supplied URLs).
        """
        query_filter = None
        if doc_ids:
            query_filter = Filter(
                must=[
                    FieldCondition(
                        key="doc_id",
                        match=MatchAny(any=doc_ids),
                    )
                ]
            )

        response = await self.client.query_points(
            collection_name=settings.QDRANT_COLLECTION,
            query=query_vector,
            query_filter=query_filter,
            limit=top_k,
            with_payload=True,
        )
        results: List[ScoredPoint] = response.points

        retrieved = []
        for hit in results:
            p = hit.payload
            retrieved.append(
                RetrievedChunk(
                    chunk_id=p["chunk_id"],
                    doc_id=p["doc_id"],
                    url=p["url"],
                    source_type=SourceType(p["source_type"]),
                    title=p.get("title"),
                    text=p["text"],
                    score=hit.score,
                )
            )

        return retrieved

    async def doc_exists(self, doc_id: str) -> bool:
        """Check if any chunks for a doc_id already exist (avoid re-indexing)."""
        results = await self.client.scroll(
            collection_name=settings.QDRANT_COLLECTION,
            scroll_filter=Filter(
                must=[FieldCondition(key="doc_id", match=MatchAny(any=[doc_id]))]
            ),
            limit=1,
            with_payload=False,
            with_vectors=False,
        )
        points, _ = results
        return len(points) > 0


qdrant_service = QdrantService()