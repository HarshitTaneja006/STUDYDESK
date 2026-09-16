"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { X, Download, Upload, FileText, AlertTriangle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ExportImportModalProps {
  open: boolean;
  onClose: () => void;
  onChanged: () => void;
}

interface ImportResult {
  imported: number;
  skipped: number;
  total: number;
  errors: { row: number; error: string }[];
}

export function ExportImportModal({
  open,
  onClose,
  onChanged,
}: ExportImportModalProps) {
  const { toast } = useToast();
  const [mode, setMode] = useState<"export" | "import">("export");
  const [importMode, setImportMode] = useState<"merge" | "replace">("merge");
  const [csvText, setCsvText] = useState("");
  const [busy, setBusy] = useState(false);
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busy) {
        e.preventDefault();
        onClose();
      }
    },
    [onClose, busy]
  );

  useEffect(() => {
    if (!open) return;
    document.addEventListener("keydown", handleKeyDown);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prev;
    };
  }, [open, handleKeyDown]);

  useEffect(() => {
    if (open) {
      setImportResult(null);
      setCsvText("");
      setImportMode("merge");
    }
  }, [open]);

  if (!open) return null;

  async function handleExport() {
    setBusy(true);
    try {
      const res = await fetch("/api/tasks/export");
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || "Export failed");
      }
      const text = await res.text();
      // trigger download
      const blob = new Blob([text], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      const dateStr = new Date().toISOString().slice(0, 10);
      a.download = `studydesk-tasks-${dateStr}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast({
        title: "Export ready",
        description: "Your tasks have been downloaded as a CSV file.",
      });
      onClose();
    } catch (e) {
      toast({
        title: "Export failed",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  async function handleImport() {
    if (!csvText.trim()) {
      toast({
        title: "Nothing to import",
        description: "Paste CSV content or upload a file first.",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
      return;
    }
    setBusy(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/tasks/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csv: csvText, mode: importMode }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Import failed");
      }
      setImportResult(data);
      toast({
        title: "Import complete",
        description: `Imported ${data.imported} task${
          data.imported === 1 ? "" : "s"
        }, skipped ${data.skipped}.`,
      });
      onChanged();
    } catch (e) {
      toast({
        title: "Import failed",
        description: e instanceof Error ? e.message : "Unknown error",
        // @ts-expect-error custom variant
        variant: "destructive",
      });
    } finally {
      setBusy(false);
    }
  }

  function handleFile(file: File) {
    const reader = new FileReader();
    reader.onload = (ev) => {
      const text = String(ev.target?.result || "");
      setCsvText(text);
      setImportResult(null);
    };
    reader.readAsText(file);
  }

  function onFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  }

  function onDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Export or import tasks"
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(20,18,15,0.55)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "1rem",
        zIndex: 70,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && !busy) onClose();
      }}
    >
      <div
        className="paper-pop"
        style={{
          width: "100%",
          maxWidth: "560px",
          maxHeight: "92vh",
          overflowY: "auto",
          background: "#fffdf7",
          border: "3px solid #41403e",
          boxShadow: "6px 6px 0 rgba(0,0,0,0.18)",
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "0.85rem 1.25rem",
            borderBottom: "2px dashed #c1bdb4",
            background:
              "repeating-linear-gradient(45deg, transparent, transparent 6px, rgba(0,0,0,0.025) 6px, rgba(0,0,0,0.025) 12px)",
          }}
        >
          <h3
            style={{
              fontFamily: "'Patrick Hand SC', cursive",
              fontSize: "1.5rem",
              margin: 0,
              color: "#1a1a1a",
              display: "inline-flex",
              alignItems: "center",
              gap: "0.5rem",
            }}
          >
            <FileText size={22} /> Export / Import
          </h3>
          <button
            type="button"
            onClick={onClose}
            disabled={busy}
            aria-label="Close"
            style={{
              background: "transparent",
              border: "none",
              cursor: busy ? "not-allowed" : "pointer",
              padding: "0.3rem",
              color: "#868e96",
              display: "flex",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "1.25rem" }}>
          {/* Tab switch */}
          <div
            role="tablist"
            aria-label="Mode"
            style={{
              display: "inline-flex",
              border: "2px solid #41403e",
              background: "#f4f1ea",
              padding: "2px",
              marginBottom: "1.1rem",
            }}
          >
            <button
              type="button"
              role="tab"
              aria-selected={mode === "export"}
              onClick={() => setMode("export")}
              style={{
                padding: "0.4rem 1rem",
                background: mode === "export" ? "#41403e" : "transparent",
                color: mode === "export" ? "#fffdf7" : "#41403e",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Download size={15} /> Export
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === "import"}
              onClick={() => setMode("import")}
              style={{
                padding: "0.4rem 1rem",
                background: mode === "import" ? "#41403e" : "transparent",
                color: mode === "import" ? "#fffdf7" : "#41403e",
                border: "none",
                cursor: "pointer",
                fontFamily: "'Patrick Hand SC', cursive",
                fontSize: "0.95rem",
                display: "inline-flex",
                alignItems: "center",
                gap: "0.3rem",
              }}
            >
              <Upload size={15} /> Import
            </button>
          </div>

          {mode === "export" ? (
            <div>
              <p
                style={{
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.95rem",
                  color: "#41403e",
                  margin: "0 0 0.85rem",
                  lineHeight: 1.5,
                }}
              >
                Download all your tasks as a CSV file. Perfect for backups or moving to another tool.
                The file includes title, description, priority, status, category, due date, and timestamps.
              </p>
              <div
                style={{
                  border: "2px dashed #868e96",
                  background: "#f9f7f0",
                  padding: "1rem",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.82rem",
                  color: "#868e96",
                  marginBottom: "1rem",
                }}
              >
                <strong style={{ color: "#41403e" }}>CSV columns:</strong> id, title,
                description, priority, status, category, dueDate, createdAt, updatedAt
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={busy}
                style={{
                  width: "100%",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.05rem",
                  padding: "0.7rem",
                  background: "#41403e",
                  color: "#fffdf7",
                  border: "2px solid #41403e",
                  cursor: busy ? "wait" : "pointer",
                  boxShadow: busy ? "none" : "2px 2px 0 rgba(0,0,0,0.2)",
                }}
              >
                <Download size={18} />
                {busy ? "Preparing..." : "Download CSV"}
              </button>
            </div>
          ) : (
            <div>
              <p
                style={{
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.95rem",
                  color: "#41403e",
                  margin: "0 0 0.85rem",
                  lineHeight: 1.5,
                }}
              >
                Paste CSV content or upload a file. The CSV must include a header row with at least a{" "}
                <code style={{ background: "#f4f1ea", padding: "0 0.3rem" }}>title</code> column.
              </p>

              {/* Import mode */}
              <div
                style={{
                  display: "flex",
                  gap: "0.75rem",
                  marginBottom: "0.75rem",
                  flexWrap: "wrap",
                }}
              >
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.9rem",
                    color: "#41403e",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === "merge"}
                    onChange={() => setImportMode("merge")}
                  />
                  Merge (add to existing)
                </label>
                <label
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "0.3rem",
                    fontFamily: "'Patrick Hand SC', cursive",
                    fontSize: "0.9rem",
                    color: "#a7342d",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="radio"
                    name="import-mode"
                    checked={importMode === "replace"}
                    onChange={() => setImportMode("replace")}
                  />
                  Replace (delete all first)
                </label>
              </div>

              {importMode === "replace" && (
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.4rem",
                    padding: "0.5rem 0.7rem",
                    background: "#f3d8d5",
                    border: "1px solid #a7342d",
                    marginBottom: "0.75rem",
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.85rem",
                    color: "#7a2118",
                  }}
                >
                  <AlertTriangle size={15} />
                  Replace mode will permanently delete ALL existing tasks before importing.
                </div>
              )}

              {/* File drop zone */}
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver(true);
                }}
                onDragLeave={() => setDragOver(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                style={{
                  border: `2px dashed ${dragOver ? "#0b74d5" : "#868e96"}`,
                  background: dragOver ? "#eef4fc" : "#f9f7f0",
                  padding: "1rem",
                  textAlign: "center",
                  cursor: "pointer",
                  marginBottom: "0.6rem",
                  fontFamily: "'Neucha', cursive",
                  fontSize: "0.85rem",
                  color: "#868e96",
                }}
              >
                <Upload size={22} style={{ marginBottom: "0.3rem" }} />
                <div>
                  <strong style={{ color: "#41403e" }}>Click to browse</strong> or drag a .csv file here
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".csv,text/csv,text/plain"
                  onChange={onFileInput}
                  style={{ display: "none" }}
                />
              </div>

              {/* CSV textarea */}
              <textarea
                value={csvText}
                onChange={(e) => {
                  setCsvText(e.target.value);
                  setImportResult(null);
                }}
                placeholder={`title,priority,status,category,dueDate,description\n"Read Chapter 8",low,pending,Reading,,\n"Math Problem Set",high,pending,Homework,2026-09-20T09:00:00.000Z,"Show all work"`}
                rows={6}
                disabled={busy}
                style={{
                  width: "100%",
                  fontFamily: "monospace",
                  fontSize: "0.8rem",
                  resize: "vertical",
                }}
              />

              {/* Import result */}
              {importResult && (
                <div
                  style={{
                    marginTop: "0.75rem",
                    padding: "0.6rem 0.8rem",
                    border: `2px solid ${
                      importResult.imported > 0 ? "#86a361" : "#a7342d"
                    }`,
                    background:
                      importResult.imported > 0 ? "#e6eedb" : "#f3d8d5",
                    fontFamily: "'Neucha', cursive",
                    fontSize: "0.85rem",
                    color: "#1a1a1a",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.4rem",
                      fontWeight: 700,
                      marginBottom: "0.3rem",
                    }}
                  >
                    {importResult.imported > 0 ? (
                      <CheckCircle2 size={16} color="#5e7a44" />
                    ) : (
                      <AlertTriangle size={16} color="#a7342d" />
                    )}
                    {importResult.imported} imported · {importResult.skipped} skipped ·{" "}
                    {importResult.total} total
                  </div>
                  {importResult.errors.length > 0 && (
                    <ul
                      style={{
                        margin: 0,
                        paddingLeft: "1.2rem",
                        fontSize: "0.78rem",
                        color: "#7a2118",
                        maxHeight: "120px",
                        overflowY: "auto",
                      }}
                    >
                      {importResult.errors.map((er, i) => (
                        <li key={i}>
                          Row {er.row}: {er.error}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              <button
                type="button"
                onClick={handleImport}
                disabled={busy || !csvText.trim()}
                style={{
                  width: "100%",
                  marginTop: "0.85rem",
                  display: "inline-flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "0.5rem",
                  fontFamily: "'Patrick Hand SC', cursive",
                  fontSize: "1.05rem",
                  padding: "0.7rem",
                  background: busy || !csvText.trim() ? "#868e96" : "#41403e",
                  color: "#fffdf7",
                  border: "2px solid #41403e",
                  cursor: busy || !csvText.trim() ? "not-allowed" : "pointer",
                  boxShadow: busy ? "none" : "2px 2px 0 rgba(0,0,0,0.2)",
                }}
              >
                <Upload size={18} />
                {busy ? "Importing..." : `Import (${importMode})`}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
