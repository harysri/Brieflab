"""
Text chunking — splits extracted content into overlapping chunks
suitable for embedding and retrieval.
"""

from dataclasses import dataclass, field
from typing import List, Optional
from langchain_text_splitters import RecursiveCharacterTextSplitter

from app.core.config import settings
from app.core.schemas import SourceType
from app.core.utils import make_doc_id


@dataclass
class TextChunk:
    chunk_id: str          # unique: doc_id + "_" + index
    doc_id: str            # derived from URL
    url: str
    source_type: SourceType
    title: Optional[str]
    text: str
    chunk_index: int


def chunk_content(
    url: str,
    source_type: SourceType,
    title: Optional[str],
    text: str,
) -> List[TextChunk]:
    """Split text into overlapping chunks and attach metadata."""

    splitter = RecursiveCharacterTextSplitter(
        chunk_size=settings.CHUNK_SIZE,
        chunk_overlap=settings.CHUNK_OVERLAP,
        separators=["\n\n", "\n", ". ", " ", ""],
        length_function=len,
    )

    raw_chunks = splitter.split_text(text)
    doc_id = make_doc_id(url)

    chunks: List[TextChunk] = []
    for i, chunk_text in enumerate(raw_chunks):
        chunk_text = chunk_text.strip()
        if not chunk_text:
            continue
        chunks.append(
            TextChunk(
                chunk_id=f"{doc_id}_{i}",
                doc_id=doc_id,
                url=url,
                source_type=source_type,
                title=title,
                text=chunk_text,
                chunk_index=i,
            )
        )

    return chunks