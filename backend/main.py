from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.api.routes import router
from app.core.config import settings
from app.services.qdrant_service import qdrant_service


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Initialize services on startup."""
    await qdrant_service.initialize()
    yield
    # Cleanup on shutdown (if needed)


app = FastAPI(
    title="BriefLab API",
    description="AI-powered summarization and Q&A from YouTube videos and articles",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api")


@app.get("/health")
async def health_check():
    return {"status": "ok", "service": "BriefLab API"}