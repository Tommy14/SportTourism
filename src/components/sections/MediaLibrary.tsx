"use client";

import { useRef, useState } from "react";

export interface MediaFileItem {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  alt: string | null;
  createdAt: string;
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

async function uploadFile(file: File): Promise<MediaFileItem> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error ?? "Upload failed");
  }
  const { url, id } = await res.json() as { url: string; id: string };
  return {
    id,
    filename: file.name,
    url,
    mimeType: file.type,
    size: file.size,
    alt: null,
    createdAt: new Date().toISOString()
  };
}

export function MediaLibrary({ initialFiles }: { initialFiles: MediaFileItem[] }) {
  const [files, setFiles] = useState<MediaFileItem[]>(initialFiles);
  const [status, setStatus] = useState("");
  const [uploading, setUploading] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  async function handleUpload(selected: FileList | null) {
    if (!selected?.length) return;
    setUploading(true);
    setStatus("");
    const uploaded: MediaFileItem[] = [];
    try {
      for (const file of Array.from(selected)) {
        const item = await uploadFile(file);
        uploaded.push(item);
      }
      setFiles((prev) => [...uploaded, ...prev]);
      setStatus(`Uploaded ${uploaded.length} file${uploaded.length !== 1 ? "s" : ""}.`);
    } catch (e) {
      setStatus((e as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  async function copyUrl(file: MediaFileItem) {
    try {
      await navigator.clipboard.writeText(file.url);
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      setStatus("Could not copy URL to clipboard.");
    }
  }

  async function updateAlt(id: string, alt: string) {
    try {
      const res = await fetch("/api/admin/media", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, alt })
      });
      if (!res.ok) throw new Error("Failed to update alt text");
      setFiles((prev) => prev.map((f) => (f.id === id ? { ...f, alt: alt.trim() || null } : f)));
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  async function deleteFile(id: string) {
    if (!confirm("Delete this image from the media library? Content that still references this URL may show a broken image.")) return;
    try {
      const res = await fetch("/api/admin/media", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id })
      });
      if (!res.ok) throw new Error("Failed to delete");
      setFiles((prev) => prev.filter((f) => f.id !== id));
      setStatus("Image deleted.");
    } catch (e) {
      setStatus((e as Error).message);
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-amber-500/20 bg-amber-500/5 px-4 py-3 text-xs text-amber-200/80">
        Images are stored in PostgreSQL. Deleting a file here does not remove references from packages, gallery, or other content — those URLs may break.
      </div>

      <div
        onClick={() => fileRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-white/20 bg-white/[0.02] py-12 text-white/40 transition hover:border-accent/40 hover:text-accent"
      >
        {uploading ? (
          <span className="text-sm">Uploading…</span>
        ) : (
          <>
            <span className="text-3xl">+</span>
            <span className="text-sm font-medium">Upload images</span>
            <span className="text-xs">Drag and drop or click — max 10 MB each</span>
          </>
        )}
      </div>
      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        multiple
        className="hidden"
        onChange={(e) => handleUpload(e.target.files)}
      />

      {status && <p className="text-sm text-white/60">{status}</p>}

      {files.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <span className="text-3xl opacity-30">🖼️</span>
          <p className="mt-3 text-sm text-white/40">No uploaded images yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {files.map((file) => (
            <div key={file.id} className="group flex flex-col gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-2">
              <div className="relative aspect-square overflow-hidden rounded-lg border border-white/10 bg-black/30">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={file.url} alt={file.alt ?? file.filename} className="h-full w-full object-cover" />
              </div>
              <p className="truncate text-[10px] text-white/50" title={file.filename}>{file.filename}</p>
              <p className="text-[10px] text-white/30">{formatSize(file.size)}</p>
              <input
                defaultValue={file.alt ?? ""}
                onBlur={(e) => {
                  const alt = e.currentTarget.value;
                  if (alt !== (file.alt ?? "")) updateAlt(file.id, alt);
                }}
                placeholder="Alt text"
                className="w-full rounded-lg border border-white/8 bg-transparent px-2 py-1 text-xs text-white/60 outline-none focus:border-accent/50 focus:text-white"
              />
              <div className="flex gap-1">
                <button
                  type="button"
                  onClick={() => copyUrl(file)}
                  className="flex-1 rounded-lg border border-white/10 px-2 py-1 text-[10px] font-semibold text-white/60 transition hover:border-accent/30 hover:text-accent"
                >
                  {copiedId === file.id ? "Copied!" : "Copy URL"}
                </button>
                <button
                  type="button"
                  onClick={() => deleteFile(file.id)}
                  className="rounded-lg border border-red-500/20 px-2 py-1 text-[10px] font-semibold text-red-400 transition hover:bg-red-500/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
