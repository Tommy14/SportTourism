"use client";

import { useState } from "react";

type Item = Record<string, string | number | null>;

const PAYLOAD_SKIP = new Set(["id", "key", "groupKey", "createdAt", "updatedAt", "draftKey"]);
const DISPLAY_SKIP = new Set(["id", "groupKey", "createdAt", "updatedAt", "draftKey"]);

const CREATABLE_TYPES = new Set(["package", "faq", "testimonial", "gallery"]);

export function AdminEditor({
  title,
  type,
  items,
  keyField = "id"
}: {
  title: string;
  type: "package" | "faq" | "testimonial" | "gallery" | "settings" | "section" | "topicTile";
  items: Item[];
  keyField?: string;
}) {
  const [rows, setRows] = useState(items);
  const [statuses, setStatuses] = useState<Record<string, string>>({});
  const [uploadingRows, setUploadingRows] = useState<Set<number>>(new Set());

  function getRowKey(row: Item): string {
    return String((row as Item & { draftKey?: string }).draftKey ?? row[keyField]);
  }

  function setRowStatus(row: Item, msg: string) {
    setStatuses((prev) => ({ ...prev, [getRowKey(row)]: msg }));
  }

  function nextSortOrder(r: Item[]) {
    return Math.max(0, ...r.map((x) => Number(x.sortOrder) || 0)) + 1;
  }

  function addPackageRow() {
    setRows((r) => [
      ...r,
      {
        id: 0,
        title: "",
        duration: "",
        inclusions: "",
        pricingNote: "",
        imageUrl: null,
        itineraryJson: null,
        sortOrder: nextSortOrder(r),
        draftKey: crypto.randomUUID()
      }
    ]);
  }

  function addFaqRow() {
    setRows((r) => [
      ...r,
      {
        id: 0,
        question: "",
        answer: "",
        sortOrder: nextSortOrder(r),
        draftKey: crypto.randomUUID()
      }
    ]);
  }

  function addTestimonialRow() {
    setRows((r) => [
      ...r,
      {
        id: 0,
        name: "",
        team: "",
        quote: "",
        imageUrl: null,
        sortOrder: nextSortOrder(r),
        draftKey: crypto.randomUUID()
      }
    ]);
  }

  function addGalleryRow() {
    setRows((r) => [
      ...r,
      {
        id: 0,
        imageUrl: "",
        caption: "",
        sortOrder: nextSortOrder(r),
        draftKey: crypto.randomUUID()
      }
    ]);
  }

  function newRowHint(): string | null {
    if (type === "package") return "New package — fill in the fields below, then Save.";
    if (type === "faq") return "New FAQ — add question and answer, then Save.";
    if (type === "testimonial") return "New testimonial — add quote and details, upload a photo if needed, then Save.";
    if (type === "gallery") return "New gallery item — upload an image (or set image URL), add caption, then Save.";
    return null;
  }

  function parseItineraryJson(raw: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
    if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
    if (typeof raw === "object") return { ok: true, value: raw };
    if (typeof raw !== "string") return { ok: false, error: "Itinerary must be valid JSON." };
    try {
      return { ok: true, value: JSON.parse(raw) };
    } catch {
      return { ok: false, error: "Itinerary JSON is invalid. Fix the JSON before saving." };
    }
  }

  async function saveRow(row: Item, index: number) {
    setRowStatus(row, "Saving...");
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (PAYLOAD_SKIP.has(key)) continue;
      if (key === "itineraryJson") {
        const parsed = parseItineraryJson(value);
        if (!parsed.ok) {
          setRowStatus(row, parsed.error);
          return;
        }
        payload[key] = parsed.value;
        continue;
      }
      payload[key] = value;
    }

    const isNew = CREATABLE_TYPES.has(type) && Number(row.id) === 0;
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        id: isNew ? undefined : row.id,
        create: isNew,
        key: row.key,
        payload
      })
    });
    const result = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: number; error?: string };

    if (response.ok && isNew && typeof result.id === "number") {
      setRows((prev) => {
        const next = [...prev];
        const cur = next[index];
        if (!cur) return prev;
        const { draftKey: _draftKey, ...rest } = cur as Item & { draftKey?: string };
        void _draftKey;
        next[index] = { ...rest, id: result.id as number };
        return next;
      });
      setRowStatus(row, "Saved");
      return;
    }

    setRowStatus(row, response.ok ? "Saved" : result.error || "Failed");
  }

  async function onUpload(index: number, file: File) {
    setUploadingRows((prev) => new Set(prev).add(index));
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    setUploadingRows((prev) => {
      const s = new Set(prev);
      s.delete(index);
      return s;
    });
    if (!response.ok) return;
    const data = (await response.json()) as { url: string };
    const next = [...rows];
    next[index] = { ...next[index], imageUrl: data.url };
    setRows(next);
  }

  const hint = newRowHint();

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {type === "package" ? (
          <button type="button" className="ghost-button text-sm" onClick={addPackageRow}>
            Add package
          </button>
        ) : null}
        {type === "faq" ? (
          <button type="button" className="ghost-button text-sm" onClick={addFaqRow}>
            Add FAQ
          </button>
        ) : null}
        {type === "testimonial" ? (
          <button type="button" className="ghost-button text-sm" onClick={addTestimonialRow}>
            Add testimonial
          </button>
        ) : null}
        {type === "gallery" ? (
          <button type="button" className="ghost-button text-sm" onClick={addGalleryRow}>
            Add gallery item
          </button>
        ) : null}
      </div>
      <div className="space-y-4">
        {rows.map((row, index) => {
          const rk = getRowKey(row);
          return (
            <article
              key={rk}
              className="rounded-lg border border-white/10 p-4"
            >
              {Number(row.id) === 0 && hint ? <p className="mb-3 text-sm text-accent">{hint}</p> : null}
              <div className="grid gap-2 md:grid-cols-2">
                {Object.entries(row).map(([key, value]) => {
                  if (DISPLAY_SKIP.has(key)) return null;
                  if (key === "itineraryJson") {
                    const display =
                      value === null || value === undefined
                        ? ""
                        : typeof value === "string"
                          ? value
                          : JSON.stringify(value, null, 2);
                    return (
                      <label key={key} className="text-sm md:col-span-2">
                        <span className="mb-1 block text-white/70">itineraryJson</span>
                        <textarea
                          rows={12}
                          value={display}
                          placeholder='{"summary":"...","days":[{"day":1,"location":"...","activity":"..."}]}'
                          onChange={(event) => {
                            const next = [...rows];
                            next[index] = { ...next[index], [key]: event.target.value };
                            setRows(next);
                          }}
                          className="w-full rounded-md bg-ink/70 p-2 font-mono text-xs"
                        />
                      </label>
                    );
                  }
                  return (
                    <label key={key} className="text-sm">
                      <span className="mb-1 block text-white/70">{key}</span>
                      <input
                        value={value === null ? "" : String(value)}
                        onChange={(event) => {
                          const next = [...rows];
                          next[index] = { ...next[index], [key]: event.target.value };
                          setRows(next);
                        }}
                        className="w-full rounded-md bg-ink/70 p-2"
                      />
                    </label>
                  );
                })}
              </div>
              {"imageUrl" in row && (
                <div className="mt-3">
                  {row.imageUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={String(row.imageUrl)}
                      alt="preview"
                      className="mb-2 h-24 w-40 rounded-lg border border-white/10 object-cover"
                    />
                  ) : null}
                  <input
                    type="file"
                    accept="image/*"
                    className="text-sm"
                    onChange={(event) => {
                      const file = event.target.files?.[0];
                      if (file) void onUpload(index, file);
                    }}
                  />
                  {uploadingRows.has(index) ? (
                    <p className="mt-1 text-xs text-white/50">Uploading…</p>
                  ) : null}
                </div>
              )}
              <div className="mt-3 flex items-center gap-3">
                <button type="button" className="pill-button" onClick={() => void saveRow(row, index)}>
                  Save
                </button>
                {statuses[rk] ? (
                  <p className="text-xs text-white/60">{statuses[rk]}</p>
                ) : null}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
