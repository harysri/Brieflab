from pydantic import BaseModel, HttpUrl, field_validator
from typing import List, Optional
from enum import Enum


class SourceType(str, Enum):
    youtube = "youtube"
    article = "article"


# ── Request models ────────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    urls: List[str]

    @field_validator("urls")
    @classmethod
    def urls_not_empty(cls, v):
        if not v:
            raise ValueError("At least one URL is required.")
        urls = [u.strip() for u in v if u.strip()]
        if not urls:
            raise ValueError("At least one URL is required after removing empty entries.")
        if len(urls) > 10:
            raise ValueError("Maximum 10 URLs per request.")
        return urls


class QuestionRequest(BaseModel):
    urls: List[str]
    question: str

    @field_validator("urls")
    @classmethod
    def urls_not_empty(cls, v):
        if not v:
            raise ValueError("At least one URL is required.")
        urls = [u.strip() for u in v if u.strip()]
        if not urls:
            raise ValueError("At least one URL is required after removing empty entries.")
        return urls

    @field_validator("question")
    @classmethod
    def question_not_empty(cls, v):
        v = v.strip()
        if not v:
            raise ValueError("Question cannot be empty.")
        return v


# ── Response models ───────────────────────────────────────────────────────────

class SourceSummary(BaseModel):
    url: str
    source_type: SourceType
    title: Optional[str] = None
    summary: str
    chunk_count: int


class AnalyzeResponse(BaseModel):
    sources: List[SourceSummary]


class Citation(BaseModel):
    url: str
    source_type: SourceType
    title: Optional[str] = None
    excerpt: str          # The retrieved chunk snippet shown to user
    score: float          # Similarity score


class AnswerResponse(BaseModel):
    answer: str
    citations: List[Citation]