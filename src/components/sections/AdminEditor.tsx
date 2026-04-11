"use client";

import { useState } from "react";

type Item = Record<string, string | number | null>;

const PAYLOAD_SKIP = new Set(["id", "key", "createdAt", "updatedAt", "draftKey"]);

export function AdminEditor({
  title,
  type,
  items,
  keyField = "id"
}: {
  title: string;
  type: "section" | "topicTile" | "package" | "faq" | "testimonial" | "gallery" | "settings";
  items: Item[];
  keyField?: string;
}) {
  const [rows, setRows] = useState(items);
  const [status, setStatus] = useState("");

  function addPackageRow() {
    setRows((r) => {
      const nextOrder = Math.max(0, ...r.map((x) => Number(x.sortOrder) || 0)) + 1;
      return [
        ...r,
        {
          id: 0,
          title: "",
          duration: "",
          inclusions: "",
          pricingNote: "",
          imageUrl: null,
          sortOrder: nextOrder,
          draftKey: crypto.randomUUID()
        }
      ];
    });
    setStatus("");
  }

  async function saveRow(row: Item, index: number) {
    setStatus("Saving...");
    const payload: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (!PAYLOAD_SKIP.has(key)) payload[key] = value;
    });

    const isNewPackage = type === "package" && Number(row.id) === 0;
    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type,
        id: isNewPackage ? undefined : row.id,
        create: isNewPackage,
        key: row.key,
        payload
      })
    });
    const result = (await response.json().catch(() => ({}))) as { ok?: boolean; id?: number; error?: string };

    if (response.ok && isNewPackage && typeof result.id === "number") {
      setRows((prev) => {
        const next = [...prev];
        const cur = next[index];
        if (!cur) return prev;
        const { draftKey: _draftKey, ...rest } = cur as Item & { draftKey?: string };
        void _draftKey;
        next[index] = { ...rest, id: result.id as number };
        return next;
      });
      setStatus("Saved");
      return;
    }

    setStatus(response.ok ? "Saved" : result.error || "Failed");
  }

  async function onUpload(index: number, file: File) {
    const form = new FormData();
    form.append("file", file);
    const response = await fetch("/api/admin/upload", { method: "POST", body: form });
    if (!response.ok) return;
    const data = await response.json();
    const next = [...rows];
    next[index] = { ...next[index], imageUrl: data.url };
    setRows(next);
  }

  return (
    <section className="rounded-xl border border-white/10 bg-panel p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-bold">{title}</h2>
        {type === "package" ? (
          <button type="button" className="ghost-button text-sm" onClick={addPackageRow}>
            Add package
          </button>
        ) : null}
      </div>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <article
            key={String((row as Item & { draftKey?: string }).draftKey ?? row[keyField])}
            className="rounded-lg border border-white/10 p-4"
          >
            {Number(row.id) === 0 ? (
              <p className="mb-3 text-sm text-accent">New package — fill in the fields below, then Save.</p>
            ) : null}
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(row).map(([key, value]) => {
                if (key === "id" || key === "createdAt" || key === "updatedAt" || key === "draftKey")
                  return null;
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
              <input
                type="file"
                accept="image/*"
                className="mt-3"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) onUpload(index, file);
                }}
              />
            )}
            <button type="button" className="pill-button mt-3" onClick={() => saveRow(row, index)}>
              Save
            </button>
          </article>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/70">{status}</p>
    </section>
  );
}
