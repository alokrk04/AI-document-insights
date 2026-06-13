import { create } from "zustand";
import type { Document, ChatMessage, InsightResponse } from "@/types";

interface AppState {
  // Documents
  documents: Document[];
  selectedDocumentId: string | null;
  setDocuments: (docs: Document[]) => void;
  addDocument: (doc: Document) => void;
  updateDocument: (id: string, updates: Partial<Document>) => void;
  removeDocument: (id: string) => void;
  selectDocument: (id: string | null) => void;

  // Chat
  messages: ChatMessage[];
  conversationId: string | null;
  isStreaming: boolean;
  addMessage: (msg: ChatMessage) => void;
  updateLastMessage: (content: string) => void;
  setLastMessageSources: (sources: ChatMessage["sources"]) => void;
  clearMessages: () => void;
  setConversationId: (id: string | null) => void;
  setIsStreaming: (streaming: boolean) => void;

  // Insights
  insights: InsightResponse | null;
  isLoadingInsights: boolean;
  setInsights: (insights: InsightResponse | null) => void;
  setIsLoadingInsights: (loading: boolean) => void;

  // UI
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
}

export const useAppStore = create<AppState>((set) => ({
  // Documents
  documents: [],
  selectedDocumentId: null,
  setDocuments: (docs) => {
    // Deduplicate documents by ID, keeping the latest version
    const seen = new Set<string>();
    const deduplicated = docs.filter((doc) => {
      if (seen.has(doc.id)) return false;
      seen.add(doc.id);
      return true;
    });
    set({ documents: deduplicated });
  },
  addDocument: (doc) =>
    set((state) => ({ documents: [doc, ...state.documents] })),
  updateDocument: (id, updates) =>
    set((state) => ({
      documents: state.documents.map((d) =>
        d.id === id ? { ...d, ...updates } : d
      ),
    })),
  removeDocument: (id) =>
    set((state) => ({
      documents: state.documents.filter((d) => d.id !== id),
      selectedDocumentId:
        state.selectedDocumentId === id ? null : state.selectedDocumentId,
    })),
  selectDocument: (id) => set({ selectedDocumentId: id }),

  // Chat
  messages: [],
  conversationId: null,
  isStreaming: false,
  addMessage: (msg) =>
    set((state) => ({ messages: [...state.messages, msg] })),
  updateLastMessage: (content) =>
    set((state) => ({
      messages: state.messages.map((m, i) =>
        i === state.messages.length - 1 ? { ...m, content } : m
      ),
    })),
  setLastMessageSources: (sources) =>
    set((state) => ({
      messages: state.messages.map((m, i) =>
        i === state.messages.length - 1 ? { ...m, sources } : m
      ),
    })),
  clearMessages: () => set({ messages: [], conversationId: null }),
  setConversationId: (id) => set({ conversationId: id }),
  setIsStreaming: (streaming) => set({ isStreaming: streaming }),

  // Insights
  insights: null,
  isLoadingInsights: false,
  setInsights: (insights) => set({ insights }),
  setIsLoadingInsights: (loading) => set({ isLoadingInsights: loading }),

  // UI
  sidebarOpen: true,
  darkMode: false,
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
}));
