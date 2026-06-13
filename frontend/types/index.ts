export interface DocumentStatus {
  status: "uploaded" | "parsing" | "embedding" | "indexed" | "failed";
}

export interface Document {
  id: string;
  filename: string;
  status: DocumentStatus["status"];
  upload_time: string;
  file_size: number;
  page_count: number | null;
  chunk_count: number | null;
}

export interface ChatRequest {
  document_id: string;
  question: string;
  conversation_id?: string;
}

export interface ChatResponse {
  answer: string;
  sources: Source[];
  conversation_id: string;
}

export interface Source {
  content: string;
  page_number: number;
  section: string;
  filename: string;
  score: number;
}

export interface InsightResponse {
  document_id: string;
  executive_summary: string;
  key_findings: string[];
  action_items: string[];
  risks: string[];
  highlighted_sections: HighlightedSection[];
}

export interface HighlightedSection {
  quote: string;
  explanation: string;
  source: string;
}

export interface OllamaStatus {
  available: boolean;
  chat_model: string;
  embedding_model: string;
  chat_model_ready: boolean;
  embedding_model_ready: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  sources?: Source[];
  timestamp: Date;
}
