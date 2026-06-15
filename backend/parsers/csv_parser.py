"""Parser for CSV files."""
from pathlib import Path
import csv

from config import CHUNK_SIZE


def parse_csv(file_path: Path) -> dict:
    """Convert CSV rows into chunks grouped by content size."""
    sections = []
    full_text = ""
    headers = None

    with open(file_path, "r", encoding="utf-8", errors="replace") as f:
        reader = csv.reader(f)
        headers = next(reader, None)

        if headers:
            header_text = "Columns: " + " | ".join(h.strip() for h in headers)
            sections.append({
                "page_number": 1,
                "section": "Headers",
                "text": header_text,
                "source_type": "csv",
                "row_number": 0,
            })
            full_text += header_text + "\n\n"

        batch_rows = []
        batch_start = 1
        batch_size = 0
        for row_num, row in enumerate(reader, start=1):
            if not row:
                continue
            row_text = " | ".join(cell.strip() for cell in row)
            batch_rows.append(row_text)
            batch_size += len(row_text) + 1
            full_text += row_text + "\n"

            if batch_size >= CHUNK_SIZE:
                sections.append({
                    "page_number": 1,
                    "section": "Data",
                    "text": "\n".join(batch_rows),
                    "source_type": "csv",
                    "row_number": batch_start,
                })
                batch_rows = []
                batch_start = row_num + 1
                batch_size = 0

        if batch_rows:
            sections.append({
                "page_number": 1,
                "section": "Data",
                "text": "\n".join(batch_rows),
                "source_type": "csv",
                "row_number": batch_start,
            })

    summary = f"CSV file with {len(sections)} sections."
    if headers:
        summary += " Columns: " + " | ".join(h.strip() for h in headers)

    return {
        "pages": sections,
        "full_text": full_text.strip(),
        "page_count": 1,
        "source_type": "csv",
        "summary": summary,
    }
