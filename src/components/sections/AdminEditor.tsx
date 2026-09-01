"use client";

import { useState } from "react";
import { imagePositionStyle } from "@/lib/image-position";
import { getPickerAspectRatio, ImageFitPicker } from "@/components/sections/ImageFitPicker";

type Item = Record<string, string | number | null>;

const PAYLOAD_SKIP  = new Set(["id", "key", "groupKey", "createdAt", "updatedAt", "draftKey"]);
const DISPLAY_SKIP  = new Set(["id", "groupKey", "createdAt", "updatedAt", "draftKey", "imagePosition"]);
const TEXTAREA_FIELDS = new Set(["body", "quote", "answer", "inclusions", "caption"]);
const CREATABLE_TYPES = new Set(["package", "faq", "testimonial", "gallery"]);
const DELETABLE_TYPES = new Set(["package", "faq", "testimonial"]);

const TYPE_HIDDEN_FIELDS: Partial<Record<string, Set<string>>> = {
  package:  new Set(["pricingNote"]),
  settings: new Set(["inquiryLabel"])
};

const FIELD_LABELS: Record<string, string> = {
  title:        "Title",
  subtitle:     "Subtitle",
  body:         "Body Text",
  imageUrl:     "Image URL",
  duration:     "Duration",
  inclusions:   "What's Included",
  pricingNote:  "Pricing Note",
  sortOrder:    "Sort Order",
  question:     "Question",
  answer:       "Answer",
  name:         "Name",
  team:         "Team / Club",
  quote:        "Quote",
  caption:      "Caption",
  brandName:    "Brand Name",
  contactPhone: "Phone Number",
  contactEmail: "Email Address",
  footerAddress:"Footer Address",
  inquiryLabel: "Button Label",
  key:          "Section Key",
};

function fieldLabel(key: string): string {
  return FIELD_LABELS[key] ?? key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase());
}

function getCardSummary(row: Item): string {
  const v = row.title ?? row.question ?? row.name ?? row.key ?? row.caption;
  if (v && String(v).trim()) return String(v).trim();
  if (Number(row.id) === 0) return "New item";
  return `Item #${String(row.id)}`;
}

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

  const typeHidden = TYPE_HIDDEN_FIELDS[type] ?? new Set<string>();

  function getRowKey(row: Item): string {
    return String((row as Item & { draftKey?: string }).draftKey ?? row[keyField]);
  }

  function setRowStatus(row: Item, msg: string) {
    setStatuses((prev) => ({ ...prev, [getRowKey(row)]: msg }));
  }

  function nextSortOrder(r: Item[]) {
    return Math.max(0, ...r.map((x) => Number(x.sortOrder) || 0)) + 1;
  }

  function addRow() {
    const base = { id: 0, sortOrder: nextSortOrder(rows), draftKey: crypto.randomUUID() };
    const templates: Record<string, Item> = {
      package:     { ...base, title: "", duration: "", inclusions: "", pricingNote: "", imageUrl: null, imagePosition: null, itineraryJson: null },
      faq:         { ...base, question: "", answer: "" },
      testimonial: { ...base, name: "", team: "", quote: "", imageUrl: null, imagePosition: null },
      gallery:     { ...base, imageUrl: "", caption: "", imagePosition: null }
    };
    if (templates[type]) setRows((r) => [...r, templates[type]]);
  }

  function parseItineraryJson(raw: unknown): { ok: true; value: unknown } | { ok: false; error: string } {
    if (raw === null || raw === undefined || raw === "") return { ok: true, value: null };
    if (typeof raw === "object") return { ok: true, value: raw };
    if (typeof raw !== "string") return { ok: false, error: "Itinerary must be valid JSON." };
    try { return { ok: true, value: JSON.parse(raw) }; }
    catch { return { ok: false, error: "Itinerary JSON is invalid — fix before saving." }; }
  }

  async function saveRow(row: Item, index: number) {
    setRowStatus(row, "saving");
    const payload: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(row)) {
      if (PAYLOAD_SKIP.has(key)) continue;
      if (key === "itineraryJson") {
        const parsed = parseItineraryJson(value);
        if (!parsed.ok) { setRowStatus(row, `error:${parsed.error}`); return; }
        payload[key] = parsed.value;
        continue;
      }
      payload[key] = value;
    }
    const isNew = CREATABLE_TYPES.has(type) && Number(row.id) === 0;
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id: isNew ? undefined : row.id, create: isNew, key: row.key, payload })
    });
    const result = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: number; error?: string };
    if (response.ok && isNew && typeof result.id === "number") {
      setRows((prev) => {
        const next = [...prev];
        const cur = next[index];
        if (!cur) return prev;
        const { draftKey: _dk, ...rest } = cur as Item & { draftKey?: string };
        void _dk;
        next[index] = { ...rest, id: result.id as number };
        return next;
      });
      setRowStatus(row, "saved");
      return;
    }
    setRowStatus(row, response.ok ? "saved" : `error:${result.error || "Save failed"}`);
  }

  async function deleteRow(row: Item, index: number) {
    const isNew = Number(row.id) === 0;
    if (isNew) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    if (!window.confirm("Delete this item permanently?")) return;
    setRowStatus(row, "saving");
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, delete: true, id: row.id, payload: {} })
    });
    const result = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string };
    if (response.ok) {
      setRows((prev) => prev.filter((_, i) => i !== index));
      return;
    }
    setRowStatus(row, `error:${result.error || "Delete failed"}`);
  }

  async function onUpload(index: number, file: File) {
    setUploadingRows((prev) => new Set(prev).add(index));
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    setUploadingRows((prev) => { const s = new Set(prev); s.delete(index); return s; });
    if (!response.ok) return;
    const data = (await response.json()) as { url: string };
    const next = [...rows];
    next[index] = { ...next[index], imageUrl: data.url };
    setRows(next);
  }

  const canAdd = CREATABLE_TYPES.has(type);
  const canDelete = DELETABLE_TYPES.has(type);

  return (
    <div>
      {/* Section header */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-white">{title}</h2>
          <p className="text-xs text-white/40">{rows.length} item{rows.length !== 1 ? "s" : ""}</p>
        </div>
        {canAdd && (
          <button
            type="button"
            onClick={addRow}
            className="flex items-center gap-2 rounded-xl border border-accent/30 bg-accent/10 px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/20"
          >
            <span className="text-base leading-none">+</span>
            Add {type === "faq" ? "FAQ" : type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        )}
      </div>

      {rows.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/10 bg-white/[0.02] py-16 text-center">
          <span className="text-3xl opacity-30">📋</span>
          <p className="mt-3 text-sm text-white/40">No items yet.</p>
          {canAdd && (
            <button type="button" onClick={addRow} className="mt-4 text-sm text-accent underline underline-offset-2">
              Add the first one
            </button>
          )}
        </div>
      )}

      <div className="space-y-4">
        {rows.map((row, index) => {
          const rk = getRowKey(row);
          const status = statuses[rk] ?? "";
          const isSaving  = status === "saving";
          const isSaved   = status === "saved";
          const isError   = status.startsWith("error:");
          const errorMsg  = isError ? status.slice(6) : "";
          const isNew     = Number(row.id) === 0;
          const uploading = uploadingRows.has(index);

          return (
            <article key={rk} className="overflow-hidden rounded-2xl border border-white/10 bg-[#0d1318]">
              {/* Card header */}
              <div className="flex items-center justify-between border-b border-white/8 bg-[#0a1015] px-5 py-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  {isNew && (
                    <span className="shrink-0 rounded-full bg-accent/20 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                      New
                    </span>
                  )}
                  <span className="truncate text-sm font-medium text-white/70">{getCardSummary(row)}</span>
                </div>
                <div className="shrink-0 ml-3">
                  {isSaved  && <span className="text-xs font-semibold text-accent">✓ Saved</span>}
                  {isSaving && <span className="text-xs text-white/40">Saving…</span>}
                  {isError  && <span className="text-xs text-red-400">⚠ Error</span>}
                </div>
              </div>

              {/* Fields */}
              <div className="p-5">
                {isNew && (
                  <p className="mb-4 rounded-lg border border-accent/20 bg-accent/8 px-3 py-2 text-xs text-accent/80">
                    Fill in the fields below, then click Save to create this item.
                  </p>
                )}

                <div className="grid gap-4 md:grid-cols-2">
                  {Object.entries(row).map(([key, value]) => {
                    if (DISPLAY_SKIP.has(key) || typeHidden.has(key)) return null;
                  if (key === "imageUrl" && type === "section" && row.key !== "hero" && row.key !== "what-we-do") return null;

                    /* Section key — read-only badge */
                    if (key === "key") {
                      return (
                        <label key={key} className="text-sm">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                            Section Key
                          </span>
                          <span className="block rounded-lg border border-white/8 bg-white/5 px-3 py-2 font-mono text-xs text-white/50">
                            {String(value)}
                          </span>
                        </label>
                      );
                    }

                    /* Itinerary JSON — tall monospace textarea */
                    if (key === "itineraryJson") {
                      const display =
                        value === null || value === undefined ? ""
                        : typeof value === "string" ? value
                        : JSON.stringify(value, null, 2);
                      return (
                        <label key={key} className="text-sm md:col-span-2">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                            Itinerary JSON
                          </span>
                          <textarea
                            rows={10}
                            value={display}
                            placeholder={'{\n  "summary": "...",\n  "days": [\n    { "day": 1, "location": "...", "activity": "..." }\n  ]\n}'}
                            onChange={(e) => {
                              const next = [...rows];
                              next[index] = { ...next[index], [key]: e.target.value };
                              setRows(next);
                            }}
                            className="w-full rounded-xl border border-white/10 bg-ink/60 p-3 font-mono text-xs text-white/80 outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                          />
                        </label>
                      );
                    }

                    /* Long text — textarea */
                    if (TEXTAREA_FIELDS.has(key)) {
                      return (
                        <label key={key} className="text-sm md:col-span-2">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                            {fieldLabel(key)}
                          </span>
                          <textarea
                            rows={3}
                            value={value === null ? "" : String(value)}
                            onChange={(e) => {
                              const next = [...rows];
                              next[index] = { ...next[index], [key]: e.target.value };
                              setRows(next);
                            }}
                            className="w-full rounded-xl border border-white/10 bg-ink/60 p-3 text-sm text-white outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                          />
                        </label>
                      );
                    }

                    /* sortOrder — compact number input */
                    if (key === "sortOrder") {
                      return (
                        <label key={key} className="text-sm">
                          <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                            Sort Order
                          </span>
                          <input
                            type="number"
                            value={value === null ? "" : String(value)}
                            onChange={(e) => {
                              const next = [...rows];
                              next[index] = { ...next[index], [key]: e.target.value };
                              setRows(next);
                            }}
                            className="w-24 rounded-xl border border-white/10 bg-ink/60 p-3 text-sm text-white outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                          />
                        </label>
                      );
                    }

                    /* Default text input */
                    return (
                      <label key={key} className="text-sm">
                        <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/40">
                          {fieldLabel(key)}
                        </span>
                        <input
                          value={value === null ? "" : String(value)}
                          onChange={(e) => {
                            const next = [...rows];
                            next[index] = { ...next[index], [key]: e.target.value };
                            setRows(next);
                          }}
                          className="w-full rounded-xl border border-white/10 bg-ink/60 p-3 text-sm text-white outline-none transition focus:border-accent/40 focus:ring-1 focus:ring-accent/20"
                        />
                      </label>
                    );
                  })}
                </div>

                {/* Image section */}
                {"imageUrl" in row && !(type === "section" && row.key !== "hero" && row.key !== "what-we-do") && (
                  <div className="mt-5 rounded-xl border border-white/10 bg-black/20 p-4">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-white/40">
                      {row.key === "hero" ? "Cover Photo — appears in the hero collage"
                        : row.key === "what-we-do" ? "Banner Photo — appears in the What We Do banner"
                        : "Image"}
                    </p>
                    <div className="flex flex-wrap items-start gap-4">
                      {/* Preview */}
                      {row.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={String(row.imageUrl)}
                          alt="preview"
                          className="h-24 w-36 shrink-0 rounded-lg border border-white/10 object-cover"
                          style={imagePositionStyle(typeof row.imagePosition === "string" ? row.imagePosition : null)}
                        />
                      ) : (
                        <div className="flex h-24 w-36 shrink-0 items-center justify-center rounded-lg border border-dashed border-white/15 bg-white/5 text-3xl opacity-30">
                          🖼️
                        </div>
                      )}

                      <div className="flex flex-col gap-2">
                        {/* Upload button */}
                        <label className={[
                          "flex cursor-pointer items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition",
                          uploading
                            ? "border-accent/30 bg-accent/10 text-accent/60"
                            : "border-white/15 bg-white/5 text-white/70 hover:border-accent/40 hover:bg-accent/10 hover:text-accent"
                        ].join(" ")}>
                          <span>{uploading ? "⏳" : "📤"}</span>
                          <span>{uploading ? "Uploading…" : "Upload photo"}</span>
                          <input
                            type="file"
                            accept="image/*"
                            className="sr-only"
                            disabled={uploading}
                            onChange={(e) => {
                              const file = e.target.files?.[0];
                              if (file) void onUpload(index, file);
                            }}
                          />
                        </label>
                        <p className="text-xs text-white/35">Or paste a URL in the Image URL field above</p>
                      </div>
                    </div>
                    {row.imageUrl ? (
                      <ImageFitPicker
                        imageUrl={String(row.imageUrl)}
                        value={typeof row.imagePosition === "string" ? row.imagePosition : null}
                        aspectRatio={getPickerAspectRatio(type, row)}
                        onChange={(imagePosition) => {
                          const next = [...rows];
                          next[index] = { ...next[index], imagePosition };
                          setRows(next);
                        }}
                      />
                    ) : null}
                  </div>
                )}

                {/* Error message */}
                {isError && (
                  <div className="mt-4 rounded-xl border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-400">
                    ⚠ {errorMsg}
                  </div>
                )}

                {/* Save / Delete */}
                <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-white/8 pt-5">
                  <button
                    type="button"
                    disabled={isSaving}
                    onClick={() => void saveRow(row, index)}
                    className="pill-button disabled:opacity-50"
                  >
                    {isSaving ? "Saving…" : isNew ? "Create" : "Save Changes"}
                  </button>
                  {canDelete && (
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => void deleteRow(row, index)}
                      className="rounded-full border border-red-500/30 bg-red-500/10 px-5 py-2 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  )}
                  {isSaved && (
                    <span className="flex items-center gap-1.5 text-sm text-accent">
                      <span className="flex h-5 w-5 items-center justify-center rounded-full bg-accent/20 text-xs">✓</span>
                      Saved successfully
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
