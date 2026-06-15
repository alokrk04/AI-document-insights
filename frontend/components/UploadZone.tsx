"use client";
import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";

interface UploadZoneProps {
  onUpload: (file: File) => void;
  uploading: boolean;
}

export default function UploadZone({ onUpload, uploading }: UploadZoneProps) {
  const [dragging, setDragging] = useState(false);
  const handleDrop = useCallback((e: DragEvent<HTMLDivElement>) => {
    e.preventDefault(); setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) onUpload(file);
  }, [onUpload]);
  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) onUpload(file);
  }, [onUpload]);
  return (
    <div
      onDragOver={(e: DragEvent<HTMLDivElement>) => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      className={"relative rounded-xl p-5 text-center transition-all duration-200 cursor-pointer border-2 border-dashed " + (
        dragging
          ? "border-accent-400 bg-accent-50 dark:bg-accent-900/20 scale-[1.02]"
          : "border-slate-200 dark:border-slate-700 hover:border-accent-300 dark:hover:border-accent-600 hover:bg-slate-50 dark:hover:bg-slate-800/50"
      )}
    >
      <input type="file" accept=".pdf,.docx,.csv,.json,.txt,.ppt,.pptx" onChange={handleChange} className="hidden" id="file-upload" />
      <label htmlFor="file-upload" className="cursor-pointer block">
        {uploading ? (
          <div className="flex flex-col items-center gap-2.5 py-1">
            <div className="w-9 h-9 border-[3px] border-accent-400 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 py-1">
            <div className={"w-10 h-10 rounded-xl flex items-center justify-center transition-colors " + (dragging ? "bg-accent-100 dark:bg-accent-900/30" : "bg-slate-100 dark:bg-slate-800")}>
              <svg className={"w-5 h-5 transition-colors " + (dragging ? "text-accent-500" : "text-slate-400")} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
            </div>
            <div>
              <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Drop file or click to upload</p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">PDF, DOCX, CSV, JSON, TXT, PPT</p>
            </div>
          </div>
        )}
      </label>
    </div>
  );
}
