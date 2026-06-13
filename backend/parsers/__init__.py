"""Document parser registry."""
from pathlib import Path
from parsers.pdf_parser import parse_pdf
from parsers.docx_parser import parse_docx
from parsers.csv_parser import parse_csv
from parsers.json_parser import parse_json
from parsers.txt_parser import parse_txt


PARSERS = {
    ".pdf": parse_pdf,
    ".docx": parse_docx,
    ".csv": parse_csv,
    ".json": parse_json,
    ".txt": parse_txt,
}


def parse_document(file_path: Path) -> dict:
    """Route to the correct parser based on file extension."""
    ext = file_path.suffix.lower()
    parser = PARSERS.get(ext)
    if not parser:
        raise ValueError(f"Unsupported file type: {ext}")
    return parser(file_path)
