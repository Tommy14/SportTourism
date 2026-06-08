"use client";

import { useRef, useState } from "react";

interface GalleryImage {
  id: number;
  imageUrl: string;
  caption: string;
  sortOrder: number;
}

interface GallerySectionData {
  id: number;
  title: string;
  sortOrder: number;
  items: GalleryImage[];
}

interface GalleryManagerProps {
  initialSections: GallerySectionData[];
}

async function uploadFile(file: File): Promise<string> {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/admin/upload", { method: "POST", body: fd });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json() as { url: string };
  return url;
}

async function apiFetch(payload: Record<string, unknown>) {
  const res = await fetch("/api/admin/content", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  if (!res.ok) {
    const json = await res.json().catch(() => ({})) as { error?: string };
    throw new Error(json.error ?? "Request failed");
  }
  return res.json() as Promise<{ ok: boolean; id?: number }>;
}

export function GalleryManager({ initialSections }: GalleryManagerProps) {
  const [sections, setSections] = useState<GallerySectionData[]>(initialSections);
  const [newSectionTitle, setNewSectionTitle] = useState("");
  const [creating, setCreating] = useState(false);
  const [status, setStatus] = useState("");
  const [uploadingFor, setUploadingFor] = useState<number | null>(null);
  const fileRefs = useRef<Record<number, HTMLInputElement | null>>({});

  const canAddSection = sections.length < 2;

  async function createSection() {
    const title = newSectionTitle.trim();
    if (!title) return;
    setCreating(true);
    setStatus("");
    try {
      const res = await apiFetch({ type: "gallerySection", create: true, payload: { title } });
      const newSection: GallerySectionData = { id: res.id!, title, sortOrder: sections.length + 1, items: [] };
      setSections((prev) => [...prev, newSection]);
      setNewSectionTitle("");
      setStatus("Section created.");
    } catch (e) { setStatus((e as Error).message); }
    finally { setCreating(false); }
  }

  async function deleteSection(sectionId: number) {
    if (!confirm("Delete this section and all its images?")) return;
    try {
      await apiFetch({ type: "gallerySection", delete: true, id: sectionId, payload: {} });
      setSections((prev) => prev.filter((s) => s.id !== sectionId));
    } catch (e) { setStatus((e as Error).message); }
  }

  async function updateSectionTitle(sectionId: number, title: string) {
    try {
      await apiFetch({ type: "gallerySection", id: sectionId, payload: { title } });
      setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, title } : s));
    } catch (e) { setStatus((e as Error).message); }
  }

  async function handleImageUpload(sectionId: number, files: FileList | null) {
    if (!files || files.length === 0) return;
    const section = sections.find((s) => s.id === sectionId)!;
    if (section.items.length >= 10) { setStatus("Maximum 10 images per section."); return; }
    setUploadingFor(sectionId);
    setStatus("");
    try {
      const file = files[0];
      const imageUrl = await uploadFile(file);
      const res = await apiFetch({
        type: "gallery", create: true,
        payload: { sectionId, imageUrl, caption: "" }
      });
      const newImg: GalleryImage = { id: res.id!, imageUrl, caption: "", sortOrder: section.items.length + 1 };
      setSections((prev) => prev.map((s) => s.id === sectionId ? { ...s, items: [...s.items, newImg] } : s));
    } catch (e) { setStatus((e as Error).message); }
    finally {
      setUploadingFor(null);
      if (fileRefs.current[sectionId]) fileRefs.current[sectionId]!.value = "";
    }
  }

  async function updateCaption(sectionId: number, imageId: number, caption: string) {
    try {
      await apiFetch({ type: "gallery", id: imageId, payload: { caption } });
      setSections((prev) => prev.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.map((i) => i.id === imageId ? { ...i, caption } : i) } : s
      ));
    } catch (e) { setStatus((e as Error).message); }
  }

  async function deleteImage(sectionId: number, imageId: number) {
    try {
      await apiFetch({ type: "gallery", delete: true, id: imageId, payload: {} });
      setSections((prev) => prev.map((s) =>
        s.id === sectionId ? { ...s, items: s.items.filter((i) => i.id !== imageId) } : s
      ));
    } catch (e) { setStatus((e as Error).message); }
  }

  return (
    <div className="space-y-8">
      {status && (
        <p className="rounded-lg border border-accent/30 bg-accent/8 px-4 py-2 text-sm text-accent">{status}</p>
      )}

      {canAddSection && (
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/[0.03] p-4">
          <input
            type="text"
            value={newSectionTitle}
            onChange={(e) => setNewSectionTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && createSection()}
            placeholder="New section name (e.g. Tour Highlights)"
            className="input-dark flex-1"
          />
          <button onClick={createSection} disabled={creating || !newSectionTitle.trim()} className="pill-button shrink-0 disabled:opacity-40">
            {creating ? "Creating…" : "+ Add Section"}
          </button>
        </div>
      )}

      {sections.length === 0 && (
        <p className="py-12 text-center text-sm text-white/40">No sections yet. Create up to 2 gallery sections above.</p>
      )}

      {sections.map((section) => (
        <div key={section.id} className="rounded-2xl border border-white/10 bg-white/[0.02]">
          <div className="flex items-center gap-3 border-b border-white/8 px-5 py-4">
            <input
              defaultValue={section.title}
              onBlur={(e) => { const t = e.currentTarget.value.trim(); if (t && t !== section.title) updateSectionTitle(section.id, t); }}
              className="flex-1 bg-transparent text-base font-semibold text-white outline-none focus:underline focus:decoration-accent"
            />
            <span className="shrink-0 text-xs text-white/40">{section.items.length}/10 images</span>
            <button onClick={() => deleteSection(section.id)} className="shrink-0 rounded-lg border border-red-500/20 px-3 py-1 text-xs font-semibold text-red-400 transition hover:bg-red-500/10">
              Delete Section
            </button>
          </div>

          <div className="p-5">
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {section.items.map((img) => (
                <div key={img.id} className="group relative flex flex-col gap-2">
                  <div className="relative aspect-video overflow-hidden rounded-xl border border-white/10 bg-black/30">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={img.imageUrl} alt={img.caption} className="h-full w-full object-cover" />
                    <button
                      onClick={() => deleteImage(section.id, img.id)}
                      className="absolute right-1.5 top-1.5 rounded-full bg-black/70 p-1 text-[10px] leading-none text-red-400 opacity-0 transition group-hover:opacity-100"
                    >✕</button>
                  </div>
                  <input
                    defaultValue={img.caption}
                    onBlur={(e) => { const c = e.currentTarget.value.trim(); if (c !== img.caption) updateCaption(section.id, img.id, c); }}
                    placeholder="Caption"
                    className="w-full rounded-lg border border-white/8 bg-transparent px-2 py-1 text-xs text-white/60 outline-none focus:border-accent/50 focus:text-white"
                  />
                </div>
              ))}

              {section.items.length < 10 && (
                <div
                  onClick={() => fileRefs.current[section.id]?.click()}
                  className="flex aspect-video cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 bg-white/[0.02] text-white/30 transition hover:border-accent/40 hover:text-accent"
                >
                  {uploadingFor === section.id ? (
                    <span className="text-xs">Uploading…</span>
                  ) : (
                    <><span className="text-2xl">+</span><span className="text-[10px]">Add Image</span></>
                  )}
                </div>
              )}
            </div>
            <input
              ref={(el) => { fileRefs.current[section.id] = el; }}
              type="file" accept="image/*" className="hidden"
              onChange={(e) => handleImageUpload(section.id, e.target.files)}
            />
          </div>
        </div>
      ))}

      {!canAddSection && sections.length > 0 && (
        <p className="text-center text-xs text-white/30">Maximum of 2 sections reached.</p>
      )}
    </div>
  );
}
