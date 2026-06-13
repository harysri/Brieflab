from pydantic_settings import BaseSettings
from typing import List, Optional

class Settings(BaseSettings):
    # CORS
    CORS_ORIGINS: List[str] = ["http://localhost:3000", "http://localhost:5173"]

    # Qdrant
    QDRANT_URL: str = ""
    QDRANT_API_KEY: str = ""
    QDRANT_COLLECTION: str = "brieflab_docs"

    # Ollama / LLM 
    OLLAMA_BASE_URL: str = "http://localhost:11434"
    LLM_MODEL: str = "llama3.2:3b-instruct-q4_K_M"
    LLM_TEMPERATURE: float = 0.1
    LLM_MAX_TOKENS: int = 1024

    # Embeddings
    EMBEDDING_MODEL: str = "bge-m3"
    EMBEDDING_DIMENSION: int = 1024

    # Chunking
    CHUNK_SIZE: int = 800
    CHUNK_OVERLAP: int = 100

    # Retrieval
    TOP_K: int = 5

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
