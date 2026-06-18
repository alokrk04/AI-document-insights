
Action: file_editor create /app/frontend/src/components/ResumeUpload.js --file-text "import React, { useState, useCallback } from \"react\";
import { Upload, FileText, X, CheckCircle } from \"lucide-react\";

export default function ResumeUpload({ onFileUpload }) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileSelect = useCallback((e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  }, []);

  const processFile = async (file) => {
    const ext = file.name.split('.').pop().toLowerCase();
    if (!['pdf', 'docx'].includes(ext)) {
      return;
    }
    setUploading(true);
    await onFileUpload(file);
    setUploading(false);
  };

  return (
    <div className=\"max-w-2xl mx-auto\">
      <div
        data-testid=\"resume-upload-dropzone\"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative border-2 border-dashed rounded-sm p-12 text-center cursor-pointer transition-all duration-300 ${
          isDragging
            ? 'border-[#00FF66] bg-[#00FF66]/5 shadow-[0_0_30px_rgba(0,255,102,0.15)_inset]'
            : 'border-[#27272a] bg-[#0a0a0a] hover:border-[#00FF66]/50 hover:shadow-[0_0_15px_rgba(0,255,102,0.1)]'
        }`}
      >
        <input
          data-testid=\"resume-file-input\"
          type=\"file\"
          accept=\".pdf,.docx\"
          onChange={handleFileSelect}
          className=\"absolute inset-0 w-full h-full opacity-0 cursor-pointer\"
        />

        {uploading ? (
          <div className=\"flex flex-col items-center gap-4\">
            <div className=\"w-12 h-12 border-2 border-[#00FF66] border-t-transparent rounded-sm animate-spin\" />
            <p className=\"font-mono text-[#00FF66] text-sm uppercase tracking-wider\">
              Parsing Resume...
            </p>
          </div>
        ) : (
          <div className=\"flex flex-col items-center gap-4\">
            <div className=\"w-16 h-16 bg-[#1a1a1a] border border-[#27272a] rounded-sm flex items-center justify-center\">
              <Upload className=\"w-8 h-8 text-[#00FF66]\" />
            </div>
            <div>
              <p className=\"font-heading text-lg font-bold uppercase tracking-tight text-white mb-1\">
                Drop your resume here
              </p>
              <p className=\"text-sm text-slate-400\">
                or click to browse
              </p>
            </div>
            <div className=\"flex gap-3 mt-2\">
              <span className=\"flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] border border-[#27272a] rounded-sm text-xs font-mono text-slate-400\">
                <FileText className=\"w-3 h-3\" /> PDF
              </span>
              <span className=\"flex items-center gap-1.5 px-3 py-1 bg-[#1a1a1a] border border-[#27272a] rounded-sm text-xs font-mono text-slate-400\">
                <FileText className=\"w-3 h-3\" /> DOCX
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
"
Observation: Create successful: /app/frontend/src/components/ResumeUpload.js