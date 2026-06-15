import type { ReactNode } from "react";

interface Doc {
  id: string;
  status: string;
  filename?: string;
  page_count?: number;
}

interface DocumentListProps {
  documents: Doc[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function DocumentList({ documents, selectedId, onSelect, onDelete }: DocumentListProps) {
  const statusColors: Record<string, string> = {
    uploaded: "bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border-blue-200 dark:border-blue-800",
    parsing: "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300 border-amber-200 dark:border-amber-800",
    embedding: "bg-purple-50 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300 border-purple-200 dark:border-purple-800",
    indexed: "bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800",
    failed: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300 border-red-200 dark:border-red-800",
  };
  const statusLabels: Record<string, string> = {
    uploaded: "Uploaded",
    parsing: "Parsing",
    embedding: "Embedding",
    indexed: "Uploaded",
    failed: "Failed",
  };
  const statusIcons: Record<string, ReactNode> = {
    uploaded: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>,
    parsing: <svg className="w-3 h-3 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>,
    embedding: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>,
    indexed: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>,
    failed: <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" /></svg>,
  };
  const fileIcons: Record<string, ReactNode> = {
    pdf: <span className="text-red-500">📕</span>,
    docx: <span className="text-blue-500">📘</span>,
    csv: <span className="text-emerald-500">📗</span>,
    json: <span className="text-amber-500">📙</span>,
    txt: <span className="text-slate-500">📄</span>,
    ppt: <span className="text-orange-500">📊</span>,
    pptx: <span className="text-orange-500">📊</span>,
  };
  const getFileIcon = (filename?: string): ReactNode => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    return (ext && fileIcons[ext]) || fileIcons.txt;
  };
  const unique = Array.from(new Map(documents.map((d: Doc) => [d.id, d])).values());
  if (!unique.length) return (
    <div className="flex flex-col items-center justify-center py-12 text-slate-400">
      <svg className="w-12 h-12 mb-3 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
      <p className="text-sm">No documents yet</p>
    </div>
  );
  return (
    <div className="space-y-1.5">
      {unique.map((doc: Doc, idx: number) => (
        <div key={doc.id}
          onClick={() => onSelect(doc.id)}
          className={"group relative p-3 rounded-xl cursor-pointer transition-all duration-150 border " + (
            selectedId === doc.id
              ? "bg-accent-50 dark:bg-accent-900/20 border-accent-200 dark:border-accent-800 shadow-sm"
              : "hover:bg-slate-50 dark:hover:bg-slate-800/50 border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          )}
          style={{ animationDelay: `${idx * 30}ms` }}
        >
          <div className="flex items-start gap-3">
            <div className="text-lg flex-shrink-0 mt-0.5">{getFileIcon(doc.filename)}</div>
            <div className="flex-1 min-w-0">
              <p className={"text-sm font-medium truncate " + (selectedId === doc.id ? "text-accent-700 dark:text-accent-300" : "text-slate-800 dark:text-slate-200")}>{doc.filename}</p>
              <p className="text-xs text-slate-400 dark:text-slate-500 mt-0.5">
                {doc.page_count ? doc.page_count + " pages" : ""}
              </p>
              <div className="mt-1.5 flex items-center gap-2">
                <span className={"inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border " + (statusColors[doc.status] || "")}>
                  {statusIcons[doc.status]}
                  {statusLabels[doc.status] || doc.status}
                </span>
              </div>
            </div>
            <button
              onClick={(e: React.MouseEvent) => { e.stopPropagation(); onDelete(doc.id); }}
              className="absolute top-2 right-2 text-slate-300 dark:text-slate-600 opacity-0 group-hover:opacity-100 hover:text-red-500 dark:hover:text-red-400 p-1 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              title="Delete"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
