"use client";
import { useState, useEffect } from "react";
import Header from "@/components/Header";
import DocumentList from "@/components/DocumentList";
import UploadZone from "@/components/UploadZone";
import InsightsPanel from "@/components/InsightsPanel";
import ChatPanel, { type Message } from "@/components/ChatPanel";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

interface Doc {
  id: string;
  status: string;
  filename?: string;
  upload_time?: string;
  file_size?: number;
  page_count?: number;
  chunk_count?: number;
  file_path?: string;
  full_text?: string;
}

function Dashboard() {
  const [documents, setDocuments] = useState<Doc[]>([]);
  const [selectedDocumentId, selectDocument] = useState<string | null>(null);
  const [insights, setInsights] = useState<Record<string, unknown> | null>(null);
  const [isLoadingInsights, setIsLoadingInsights] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const toggleSidebar = () => setSidebarOpen(v => !v);
  const toggleDarkMode = () => setDarkMode(v => !v);

  useEffect(() => { document.documentElement.classList.toggle("dark", darkMode); }, [darkMode]);

  const fetchWithTimeout = (url: string, timeout = 5000): Promise<Response> => {
    return Promise.race([
      fetch(url),
      new Promise<Response>((_, reject) => setTimeout(() => reject(new Error("timeout")), timeout)),
    ]);
  };

  useEffect(() => {
    fetchWithTimeout(API + "/documents").then(r => r.json()).then(setDocuments).catch(() => {});
  }, []);

  useEffect(() => {
    const hasProcessing = documents.some(d => d.status === "uploaded" || d.status === "parsing" || d.status === "embedding");
    if (!hasProcessing) return;
    const interval = setInterval(() => fetchWithTimeout(API + "/documents").then(r => r.json()).then(setDocuments).catch(() => {}), 3000);
    return () => clearInterval(interval);
  }, [documents]);

  const selectedDoc = documents.find(d => d.id === selectedDocumentId);

  const deleteDoc = async (id: string) => {
    try {
      const resp = await fetch(API + "/documents/" + id, { method: "DELETE" });
      if (resp.ok) { setDocuments(prev => prev.filter(d => d.id !== id)); if (selectedDocumentId === id) selectDocument(null); }
    } catch { /* ignore */ }
  };

  const handleUpload = async (file: File) => {
    setUploading(true);
    try {
      const form = new FormData(); form.append("file", file);
      const resp = await fetch(API + "/upload", { method: "POST", body: form });
      const doc: Doc = await resp.json();
      setDocuments(prev => [doc, ...prev]);
      selectDocument(doc.id);
    } catch { /* ignore */ }
    setUploading(false);
  };

  const handleGenerateInsights = async () => {
    if (!selectedDocumentId) return;
    setIsLoadingInsights(true); setInsights(null);
    try {
      const resp = await fetch(API + "/insights/" + selectedDocumentId, { method: "POST" });
      setInsights(await resp.json() as Record<string, unknown>);
    } catch { /* ignore */ }
    setIsLoadingInsights(false);
  };

  const handleChat = async (question: string) => {
    if (!selectedDocumentId || !question.trim()) return;
    const userMsg = { id: Date.now()+"-u", role: "user", content: question, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    try {
      const resp = await fetch(API + "/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: selectedDocumentId, question, conversation_id: conversationId || undefined }),
      });
      const result = await resp.json() as { conversation_id: string; answer: string; sources: unknown };
      setConversationId(result.conversation_id);
      setMessages(prev => [...prev, { id: Date.now()+"-a", role: "assistant", content: result.answer, sources: result.sources as Message["sources"], timestamp: new Date() }]);
    } catch {
      setMessages(prev => [...prev, { id: Date.now()+"-e", role: "assistant", content: "Error: request failed", timestamp: new Date() }]);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      <Header darkMode={darkMode} toggleDarkMode={toggleDarkMode} toggleSidebar={toggleSidebar} />
      <div className="flex-1 flex overflow-hidden">
        {sidebarOpen && (
          <aside className="w-72 flex flex-col bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-sm">
            <div className="p-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-3 flex items-center gap-2">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                Documents
              </h2>
              <UploadZone onUpload={handleUpload} uploading={uploading} />
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <DocumentList documents={documents} selectedId={selectedDocumentId} onSelect={selectDocument} onDelete={deleteDoc} />
            </div>
          </aside>
        )}
        <main className="flex-1 flex overflow-hidden">
          {!selectedDocumentId ? (
            <div className="flex-1 flex items-center justify-center bg-white dark:bg-slate-900 m-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
              <div className="text-center max-w-md animate-fade-in px-8">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-accent-400 to-accent-600 flex items-center justify-center mx-auto mb-6 shadow-lg shadow-accent-500/20">
                  <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
                </div>
                <h2 className="text-2xl font-bold mb-2 text-slate-800 dark:text-slate-100">Smart AI Document Insights</h2>
                <p className="text-slate-500 dark:text-slate-400 mb-2">Upload a document to get started with AI-powered analysis</p>
                <p className="text-xs text-slate-400 dark:text-slate-500">Supports PDF, DOCX, CSV, JSON, TXT, PPT</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex gap-4 p-4 overflow-hidden">
              <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
                <InsightsPanel insights={insights} isLoading={isLoadingInsights} onGenerate={handleGenerateInsights} />
              </div>
              <div className="w-1/2 flex flex-col bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-card overflow-hidden">
                <ChatPanel messages={messages} onSend={handleChat} selectedDocumentId={selectedDocumentId} />
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Home() { return <Dashboard />; }
