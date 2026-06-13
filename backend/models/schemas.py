from pydantic import BaseModel
from typing import Optional
from datetime import datetime
from enum import Enum


class DocumentStatus(str, Enum):
    UPLOADED = "uploaded"
    PARSING = "parsing"
    EMBEDDING = "embedding"
    INDEXED = "indexed"
    FAILED = "failed"


class DocumentResponse(BaseModel):
    id: str
    filename: str
    status: DocumentStatus
    upload_time: datetime
    file_size: int
    page_count: Optional[int] = None
    chunk_count: Optional[int] = None


class ChatRequest(BaseModel):
    document_id: str
    question: str
    conversation_id: Optional[str] = None


class ChatMessage(BaseModel):
    role: str  # "user" or "assistant"
    content: str
    sources: Optional[list[dict]] = None
    timestamp: datetime


class ChatResponse(BaseModel):
    answer: str
    sources: list[dict]
    conversation_id: str


class InsightResponse(BaseModel):
    document_id: str
    executive_summary: str
    key_findings: list[str]
    action_items: list[str]
    risks: list[str]
    highlighted_sections: list[dict]


class OllamaStatus(BaseModel):
    available: bool
    chat_model: str
    embedding_model: str
    chat_model_ready: bool
    embedding_model_ready: bool
