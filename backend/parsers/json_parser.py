"""Parser for JSON files."""
from pathlib import Path
import json


def flatten_json(obj, parent_key="", sep="."):
    """Flatten nested JSON objects into readable text blocks."""
    items = []
    if isinstance(obj, dict):
        for k, v in obj.items():
            new_key = f"{parent_key}{sep}{k}" if parent_key else k
            if isinstance(v, (dict, list)):
                items.extend(flatten_json(v, new_key, sep))
            else:
                items.append({"path": new_key, "value": str(v)})
    elif isinstance(obj, list):
        for i, v in enumerate(obj):
            new_key = f"{parent_key}[{i}]"
            if isinstance(v, (dict, list)):
                items.extend(flatten_json(v, new_key, sep))
            else:
                items.append({"path": new_key, "value": str(v)})
    else:
        items.append({"path": parent_key, "value": str(obj)})
    return items


def parse_json(file_path: Path) -> dict:
    """Parse JSON file into readable text blocks."""
    with open(file_path, "r", encoding="utf-8") as f:
        data = json.load(f)

    items = flatten_json(data)
    sections = []
    full_text = ""

    for item in items:
        text = f"{item['path']}: {item['value']}"
        sections.append({
            "page_number": 1,
            "section": item["path"],
            "text": text,
            "source_type": "json",
        })
        full_text += text + "\n"

    return {
        "pages": sections,
        "full_text": full_text.strip(),
        "page_count": 1,
        "source_type": "json",
    }
