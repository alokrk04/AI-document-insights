const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${endpoint}`, options);
  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: response.statusText }));
    throw new Error(error.detail || "API Error");
  }
  return response.json();
}

export const api = {
  // Health
  health: () => fetchAPI<{ status: string }>("/health"),
  ollamaStatus: () => fetchAPI<import("@/types").OllamaStatus>("/ollama/status"),

  // Documents
  upload: async (file: File): Promise<import("@/types").Document> => {
    const formData = new FormData();
    formData.append("file", file);
    return fetchAPI<import("@/types").Document>("/upload", {
      method: "POST",
      body: formData,
    });
  },
  getDocuments: () => fetchAPI<import("@/types").Document[]>("/documents"),
  getDocument: (id: string) => fetchAPI<import("@/types").Document>(`/documents/${id}`),
  deleteDocument: (id: string) =>
    fetchAPI<{ message: string }>(`/documents/${id}`, { method: "DELETE" }),
  reprocess: (id: string) =>
    fetchAPI<{ message: string }>(`/process/${id}`, { method: "POST" }),

  // Insights
  getInsights: (docId: string) =>
    fetchAPI<import("@/types").InsightResponse>(`/insights/${docId}`, { method: "POST" }),

  // Chat
  chat: (request: import("@/types").ChatRequest) =>
    fetchAPI<import("@/types").ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    }),

  chatStream: async (
    request: import("@/types").ChatRequest,
    onChunk: (chunk: string) => void,
    onSources: (sources: import("@/types").Source[]) => void,
    onDone: (conversationId: string) => void,
    onError: (error: string) => void,
  ) => {
    try {
      const response = await fetch(`${API_BASE}/chat/stream`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(request),
      });

      if (!response.ok || !response.body) {
        onError("Failed to connect to streaming endpoint");
        return;
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.error) {
                onError(data.error);
                return;
              }
              if (data.chunk) {
                onChunk(data.chunk);
              }
              if (data.sources) {
                onSources(data.sources);
              }
              if (data.done && data.conversation_id) {
                onDone(data.conversation_id);
              }
            } catch {
              // skip invalid JSON
            }
          }
        }
      }
    } catch (err) {
      onError(err instanceof Error ? err.message : "Stream error");
    }
  },
};
