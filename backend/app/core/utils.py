import re
from urllib.parse import urlparse, parse_qs


YOUTUBE_PATTERNS = [
    r"(?:https?://)?(?:www\.)?youtube\.com/watch\?.*v=([A-Za-z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtu\.be/([A-Za-z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/embed/([A-Za-z0-9_-]{11})",
    r"(?:https?://)?(?:www\.)?youtube\.com/shorts/([A-Za-z0-9_-]{11})(?:[?&].*)?",
]


def extract_youtube_id(url: str) -> str | None:
    """Return YouTube video ID if URL is a YouTube link, else None."""
    for pattern in YOUTUBE_PATTERNS:
        match = re.search(pattern, url)
        if match:
            return match.group(1)
    return None


def is_youtube_url(url: str) -> bool:
    return extract_youtube_id(url) is not None


def make_doc_id(url: str) -> str:
    """Stable, filesystem-safe identifier derived from a URL."""
    import hashlib
    return hashlib.sha256(url.encode()).hexdigest()[:16]