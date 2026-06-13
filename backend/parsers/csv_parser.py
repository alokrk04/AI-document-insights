"""Parser for CSV files."""
from pathlib import Path
import csv
import io


def parse_csv(file_path: Path) -> dict:
    """Convert CSV rows into semantic chunks with row references."""
    sections = []
    full_text = ""

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

        for row_num, row in enumerate(reader, start=1):
            if row:
                row_text = " | ".join(cell.strip() for cell in row)
                sections.append({
                    "page_number": 1,
                    "section": "Data",
                    "text": row_text,
                    "source_type": "csv",
                    "row_number": row_num,
                })
                full_text += row_text + "\n"

    # Generate summary
    summary = f"CSV file with {len(sections)} rows of data."
    if sections and sections[0].get("text", "").startswith("Columns:"):
        summary += f" Columns: {sections[0]['text']}"

    return {
        "pages": sections,
        "full_text": full_text.strip(),
        "page_count": 1,
        "source_type": "csv",
        "summary": summary,
    }
