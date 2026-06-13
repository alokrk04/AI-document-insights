"""Parser for PDF files using PyMuPDF."""
from pathlib import Path
from typing import Optional


def parse_pdf(file_path: Path) -> dict:
    """Extract text from PDF with page numbers and metadata."""
    import fitz

    doc = fitz.open(str(file_path))
    pages = []
    full_text = ""

    for page_num in range(len(doc)):
        page = doc[page_num]
        text = page.get_text()
        if text.strip():
            pages.append({
                "page_number": page_num + 1,
                "text": text.strip(),
                "source_type": "pdf",
            })
            full_text += text.strip() + "\n\n"

    doc.close()
    return {
        "pages": pages,
        "full_text": full_text.strip(),
        "page_count": len(pages),
        "source_type": "pdf",
    }
