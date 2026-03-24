"use client";

import { useState } from "react";

type Item = Record<string, string | number | null>;

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

  async function saveRow(row: Item) {
    setStatus("Saving...");
    const payload: Record<string, unknown> = {};
    Object.entries(row).forEach(([key, value]) => {
      if (key !== "id" && key !== "key" && key !== "createdAt" && key !== "updatedAt") payload[key] = value;
    });

    const response = await fetch("/api/admin/content", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ type, id: row.id, key: row.key, payload })
    });
    setStatus(response.ok ? "Saved" : "Failed");
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
      <h2 className="mb-4 text-xl font-bold">{title}</h2>
      <div className="space-y-4">
        {rows.map((row, index) => (
          <article key={String(row[keyField])} className="rounded-lg border border-white/10 p-4">
            <div className="grid gap-2 md:grid-cols-2">
              {Object.entries(row).map(([key, value]) => {
                if (key === "id" || key === "createdAt" || key === "updatedAt") return null;
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
            <button className="pill-button mt-3" onClick={() => saveRow(row)}>
              Save
            </button>
          </article>
        ))}
      </div>
      <p className="mt-3 text-sm text-white/70">{status}</p>
    </section>
  );
}
