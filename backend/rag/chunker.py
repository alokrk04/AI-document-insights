"""Text chunking with RecursiveCharacterTextSplitter."""
import uuid
from config import CHUNK_SIZE, CHUNK_OVERLAP


def chunk_text(pages: list[dict], filename: str) -> list[dict]:
    """Split document pages into chunks with source metadata."""
    chunks = []

    for page in pages:
        text = page.get("text", "")
        if not text:
            continue

        page_chunks = recursive_split(text, CHUNK_SIZE, CHUNK_OVERLAP)

        for chunk_text in page_chunks:
            chunk_id = str(uuid.uuid4())
            chunks.append({
                "id": chunk_id,
                "content": chunk_text,
                "metadata": {
                    "filename": filename,
                    "page_number": page.get("page_number", 1),
                    "section": page.get("section", ""),
                    "source_type": page.get("source_type", ""),
                    "row_number": page.get("row_number"),
                },
            })

    return chunks


def recursive_split(text: str, chunk_size: int, chunk_overlap: int, separators=None) -> list[str]:
    """Recursively split text using multiple separators."""
    if separators is None:
        separators = ["\n\n", "\n", ". ", " ", ""]

    final_chunks = []
    separator = separators[0] if separators else ""

    if len(text) <= chunk_size:
        return [text] if text.strip() else []

    splits = text.split(separator) if separator else list(text)

    current_chunk = ""
    for split in splits:
        if len(current_chunk) + len(split) + len(separator) > chunk_size:
            if current_chunk:
                final_chunks.append(current_chunk.strip())
                # Keep overlap
                if chunk_overlap > 0:
                    words = current_chunk.split()
                    overlap_words = []
                    overlap_len = 0
                    for w in reversed(words):
                        if overlap_len + len(w) + 1 > chunk_overlap:
                            break
                        overlap_words.insert(0, w)
                        overlap_len += len(w) + 1
                    current_chunk = " ".join(overlap_words) + separator + split if overlap_words else split
                else:
                    current_chunk = split
            else:
                # Split is larger than chunk_size
                if len(separators) > 1:
                    sub_chunks = recursive_split(split, chunk_size, chunk_overlap, separators[1:])
                    final_chunks.extend(sub_chunks)
                    current_chunk = ""
                else:
                    current_chunk = split
        else:
            current_chunk = current_chunk + separator + split if current_chunk else split

    if current_chunk.strip():
        final_chunks.append(current_chunk.strip())

    return final_chunks
