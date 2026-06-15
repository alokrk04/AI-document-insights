import os
import uuid
import aiofiles
from pathlib import Path
from fastapi import UploadFile
from config import UPLOAD_DIR, MAX_FILE_SIZE, ALLOWED_EXTENSIONS


def validate_file_type(filename: str) -> bool:
    ext = Path(filename).suffix.lower()
    return ext in ALLOWED_EXTENSIONS


def validate_file_size(size: int) -> bool:
    return size <= MAX_FILE_SIZE


def generate_id() -> str:
    return str(uuid.uuid4())


async def save_upload_file(filename: str, content: bytes, doc_id: str) -> Path:
    ext = Path(filename).suffix.lower()
    file_path = UPLOAD_DIR / f"{doc_id}{ext}"
    async with aiofiles.open(file_path, "wb") as out_file:
        await out_file.write(content)
    return file_path


def sanitize_filename(filename: str) -> str:
    return os.path.basename(filename)

