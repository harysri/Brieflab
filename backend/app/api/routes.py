# routes.py
from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse

from app.core.schemas import AnalyzeRequest, AnalyzeResponse, QuestionRequest, AnswerResponse
from app.services import pipeline
from app.services.extractor import ExtractionError

router = APIRouter()


@router.post("/analyze", response_model=AnalyzeResponse, summary="Extract, index, and summarize URLs")
async def analyze(request: AnalyzeRequest):
    """
    Given one or more URLs (YouTube or article), this endpoint:
    - Extracts text/transcripts
    - Chunks and embeds the content
    - Stores embeddings in Qdrant
    - Returns a summary per URL
    """
    try:
        return await pipeline.analyze_urls(request.urls)
    except ExtractionError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Processing error: {str(e)}")


@router.post("/ask", response_model=AnswerResponse, summary="Ask a question about analyzed content")
async def ask(request: QuestionRequest):
    """
    Performs RAG Q&A over previously indexed content for the given URLs.
    Call /analyze first to index content before asking questions.
    """
    try:
        return await pipeline.answer(request.urls, request.question)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Q&A error: {str(e)}")


@router.post("/ask/stream", summary="Streaming RAG Q&A via SSE")
async def ask_stream(request: QuestionRequest):
    """
    Same as /ask but returns a Server-Sent Events stream.
    Events: token → citations → done
    """
    return StreamingResponse(
        pipeline.answer_stream(request.urls, request.question, request.history),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# routes.py  (testing  router)

@router.get("/test-fetch", summary="Debug: test trafilatura from Uvicorn")
async def test_fetch(url: str = "https://www.gsmarena.com/apple_wwdc_26_what_to_expect-news-73174.php"):
    import trafilatura
    try:
        downloaded = trafilatura.fetch_url(url)
        if not downloaded:
            return {"status": "failed", "reason": "fetch_url returned None / empty"}

        text = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=True,
            output_format="txt",
            with_metadata=False,
        )

        return {
            "status": "ok",
            "url": url,
            "text_length": len(text) if text else 0,
            "preview": (text[:500] + "...") if text and len(text) > 500 else text,
        }
    except Exception as e:
        return {"status": "error", "reason": str(e)}
