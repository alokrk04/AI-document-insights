"""Parser for plain text files."""
from pathlib import Path


def parse_txt(file_path: Path) -> dict:
    """Parse text file with UTF-8 support."""
    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        text = f.read()

    # Split by paragraphs for sectioning
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
    sections = []

    for i, para in enumerate(paragraphs):
        sections.append({
            "page_number": 1,
            "section": f"Paragraph {i + 1}",
            "text": para,
            "source_type": "txt",
        })

    return {
        "pages": sections,
        "full_text": text.strip(),
        "page_count": 1,
        "source_type": "txt",
    }
