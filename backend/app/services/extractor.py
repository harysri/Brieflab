# # extractor.py
# """
# Content extraction service.

# YouTube  → youtube-transcript-api  (fetches captions/auto-generated transcript)
# Articles → Trafilatura              (newspaper-grade boilerplate removal)
# """

# import logging
# from dataclasses import dataclass
# from typing import Optional
# import os, sys
# print(f"[EXTRACTOR] Python: {sys.executable}")
# print(f"[EXTRACTOR] HTTPS_PROXY: {os.environ.get('HTTPS_PROXY')}")
# print(f"[EXTRACTOR] HTTP_PROXY: {os.environ.get('HTTP_PROXY')}")

# import httpx
# import trafilatura
# from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

# from app.core.utils import extract_youtube_id, is_youtube_url
# from app.core.schemas import SourceType

# logger = logging.getLogger(__name__)


# @dataclass
# class ExtractedContent:
#     url: str
#     source_type: SourceType
#     title: Optional[str]
#     text: str            # Raw cleaned text, ready for chunking


# class ExtractionError(Exception):
#     pass


# # ── YouTube ───────────────────────────────────────────────────────────────────

# def _clean_youtube_url(url: str, video_id: str) -> str:
#     """Return a clean YouTube URL with only the video ID, no tracking params."""
#     if "shorts" in url:
#         return f"https://www.youtube.com/shorts/{video_id}"
#     return f"https://www.youtube.com/watch?v={video_id}"


# def _extract_youtube(url: str) -> ExtractedContent:
#     video_id = extract_youtube_id(url)
#     if not video_id:
#         raise ExtractionError(f"Cannot parse YouTube video ID from: {url}")

#     clean_url = _clean_youtube_url(url, video_id)

#     try:
#         transcript_list = YouTubeTranscriptApi().list(video_id)

#         # Prefer manually created; fall back to auto-generated; try any language
#         try:
#             transcript = transcript_list.find_manually_created_transcript(["en"])
#         except NoTranscriptFound:
#             try:
#                 transcript = transcript_list.find_generated_transcript(["en"])
#             except NoTranscriptFound:
#                 transcript = next(iter(transcript_list))

#         entries = transcript.fetch()
#         full_text = " ".join(entry.text.strip() for entry in entries)
#         title = f"YouTube Video ({video_id})"

#     except TranscriptsDisabled:
#         raise ExtractionError(f"Transcripts are disabled for video: {video_id}")
#     except OSError as e:
#         raise ExtractionError(
#             f"Network error reaching YouTube — check your internet connection. "
#             f"If you are behind a firewall or need a proxy, set HTTPS_PROXY in your .env. "
#             f"Details: {e}"
#         ) from e
#     except Exception as e:
#         raise ExtractionError(f"Failed to fetch YouTube transcript: {e}") from e

#     if not full_text.strip():
#         raise ExtractionError(f"Empty transcript for YouTube video: {video_id}")

#     return ExtractedContent(
#         url=url,
#         source_type=SourceType.youtube,
#         title=title,
#         text=full_text,
#     )


# # ── Article ───────────────────────────────────────────────────────────────────

# def _extract_article(url: str) -> ExtractedContent:
#     try:
#         # Use httpx instead of trafilatura.fetch_url() — works reliably on Windows
#         headers = {
#             "User-Agent": (
#                 "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
#                 "AppleWebKit/537.36 (KHTML, like Gecko) "
#                 "Chrome/124.0.0.0 Safari/537.36"
#             )
#         }
#         with httpx.Client(timeout=30.0, follow_redirects=True, headers=headers) as client:
#             response = client.get(url)
#             response.raise_for_status()
#             downloaded = response.text

#         if not downloaded:
#             raise ExtractionError(f"Could not download URL: {url}")

#         metadata = trafilatura.extract_metadata(downloaded)
#         title = metadata.title if metadata and metadata.title else None

#         text_result = trafilatura.extract(
#             downloaded,
#             include_comments=False,
#             include_tables=True,
#             output_format="txt",
#             with_metadata=False,
#         )

#         if not text_result or not text_result.strip():
#             raise ExtractionError(f"No readable text found at: {url}")

#     except ExtractionError:
#         raise
#     except httpx.HTTPStatusError as e:
#         raise ExtractionError(f"HTTP {e.response.status_code} fetching {url}") from e
#     except httpx.RequestError as e:
#         raise ExtractionError(f"Network error fetching {url}: {e}") from e
#     except Exception as e:
#         raise ExtractionError(f"Article extraction failed for {url}: {e}") from e

#     return ExtractedContent(
#         url=url,
#         source_type=SourceType.article,
#         title=title,
#         text=text_result,
#     )


# # ── Public API ────────────────────────────────────────────────────────────────

# def extract(url: str) -> ExtractedContent:
#     """Auto-detect URL type and extract content."""
#     if is_youtube_url(url):
#         return _extract_youtube(url)
#     return _extract_article(url)

# extractor.py
"""
Content extraction service.

YouTube  → youtube-transcript-api  (fetches captions/auto-generated transcript)
Articles → Trafilatura              (native fetcher — avoids bot blocks)
"""

import logging
from dataclasses import dataclass
from typing import Optional

import httpx
import trafilatura
from youtube_transcript_api import YouTubeTranscriptApi, TranscriptsDisabled, NoTranscriptFound

from app.core.utils import extract_youtube_id, is_youtube_url
from app.core.schemas import SourceType

logger = logging.getLogger(__name__)


@dataclass
class ExtractedContent:
    url: str
    source_type: SourceType
    title: Optional[str]
    text: str            # Raw cleaned text, ready for chunking


class ExtractionError(Exception):
    pass


# ── YouTube ───────────────────────────────────────────────────────────────────

def _clean_youtube_url(url: str, video_id: str) -> str:
    """Return a clean YouTube URL with only the video ID, no tracking params."""
    if "shorts" in url:
        return f"https://www.youtube.com/shorts/{video_id}"
    return f"https://www.youtube.com/watch?v={video_id}"


def _extract_youtube(url: str) -> ExtractedContent:
    video_id = extract_youtube_id(url)
    if not video_id:
        raise ExtractionError(f"Cannot parse YouTube video ID from: {url}")

    clean_url = _clean_youtube_url(url, video_id)

    try:
        transcript_list = YouTubeTranscriptApi().list(video_id)

        # Prefer manually created; fall back to auto-generated; try any language
        try:
            transcript = transcript_list.find_manually_created_transcript(["en"])
        except NoTranscriptFound:
            try:
                transcript = transcript_list.find_generated_transcript(["en"])
            except NoTranscriptFound:
                transcript = next(iter(transcript_list))

        entries = transcript.fetch()
        full_text = " ".join(entry.text.strip() for entry in entries)
        title = f"YouTube Video ({video_id})"

    except TranscriptsDisabled:
        raise ExtractionError(f"Transcripts are disabled for video: {video_id}")
    except NoTranscriptFound:
        raise ExtractionError(f"No transcript found for YouTube video: {video_id}")
    except OSError as e:
        raise ExtractionError(
            f"Network error reaching YouTube — check your internet connection. "
            f"If you are behind a firewall or need a proxy, set HTTPS_PROXY in your .env. "
            f"Details: {e}"
        ) from e
    except Exception as e:
        raise ExtractionError(f"Failed to fetch YouTube transcript: {e}") from e

    if not full_text.strip():
        raise ExtractionError(f"Empty transcript for YouTube video: {video_id}")

    return ExtractedContent(
        url=clean_url,
        source_type=SourceType.youtube,
        title=title,
        text=full_text,
    )


# ── Article ───────────────────────────────────────────────────────────────────

def _extract_article(url: str) -> ExtractedContent:
    try:
        headers = {
            "User-Agent": (
                "Mozilla/5.0 (Windows NT 10.0; Win64; x64) "
                "AppleWebKit/537.36 (KHTML, like Gecko) "
                "Chrome/124.0.0.0 Safari/537.36"
            )
        }
        with httpx.Client(timeout=30.0, follow_redirects=True, headers=headers) as client:
            response = client.get(url)
            response.raise_for_status()
            downloaded = response.text

        if not downloaded:
            raise ExtractionError(f"Could not download URL: {url}")

        metadata = trafilatura.extract_metadata(downloaded)
        title = metadata.title if metadata and metadata.title else None

        text_result = trafilatura.extract(
            downloaded,
            include_comments=False,
            include_tables=True,
            output_format="txt",
            with_metadata=False,
        )

        if not text_result or not text_result.strip():
            raise ExtractionError(f"No readable text found at: {url}")

    except ExtractionError:
        raise
    except httpx.HTTPStatusError as e:
        raise ExtractionError(f"HTTP {e.response.status_code} fetching {url}") from e
    except httpx.RequestError as e:
        raise ExtractionError(f"Network error fetching {url}: {e}") from e
    except Exception as e:
        raise ExtractionError(f"Article extraction failed for {url}: {e}") from e

    return ExtractedContent(
        url=url,
        source_type=SourceType.article,
        title=title,
        text=text_result,
    )


# ── Public API ────────────────────────────────────────────────────────────────

def extract(url: str) -> ExtractedContent:
    """Auto-detect URL type and extract content."""
    if is_youtube_url(url):
        return _extract_youtube(url)
    return _extract_article(url)