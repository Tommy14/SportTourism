"use client";

import { useState } from "react";
import { AdminEditor } from "./AdminEditor";

type Item = Record<string, string | number | null>;

interface AdminDashboardProps {
  username: string;
  brandName: string;
  packages: Item[];
  faqs: Item[];
  testimonials: Item[];
  gallery: Item[];
  settings: Item | null;
  sections: Item[];
  tileGroups: {
    "what-we-do": Item[];
    "what-we-have-done": Item[];
    "where-play": Item[];
  };
}

const TABS = [
  { id: "packages",    label: "Packages",     icon: "🏏", desc: "Tour packages displayed on the website" },
  { id: "gallery",     label: "Gallery",      icon: "📸", desc: "Photos shown in the gallery section" },
  { id: "testimonials",label: "Testimonials", icon: "💬", desc: "Customer reviews and quotes" },
  { id: "faqs",        label: "FAQs",         icon: "❓", desc: "Frequently asked questions" },
  { id: "content",     label: "Page Content", icon: "📄", desc: "Hero and section headings & text" },
  { id: "tiles",       label: "Topic Tiles",  icon: "🗂️", desc: "Service, track record and venue tiles" },
  { id: "settings",    label: "Settings",     icon: "⚙️", desc: "Brand name, contact details, email" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminDashboard({
  username, brandName,
  packages, faqs, testimonials, gallery, settings, sections, tileGroups
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState<TabId>("packages");

  const counts: Record<TabId, number> = {
    packages:     packages.length,
    gallery:      gallery.length,
    testimonials: testimonials.length,
    faqs:         faqs.length,
    content:      sections.length,
    tiles:        tileGroups["what-we-do"].length + tileGroups["what-we-have-done"].length + tileGroups["where-play"].length,
    settings:     settings ? 1 : 0
  };

  const activeTabMeta = TABS.find((t) => t.id === activeTab)!;

  return (
    <div className="min-h-screen bg-ink">

      {/* ── Top header ── */}
      <header className="sticky top-0 z-40 border-b border-white/10 bg-[#07090c]/95 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-4 px-4 md:px-6">
          {/* Brand */}
          <div className="flex items-center gap-2.5">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-gradient-to-br from-accent to-accentSoft">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-ink" fill="currentColor">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M4 10 Q10 4 16 10 Q10 16 4 10Z" fill="currentColor" opacity="0.8" />
              </svg>
            </span>
            <span className="hidden text-xs font-extrabold uppercase tracking-wider text-white sm:block">{brandName}</span>
            <span className="hidden text-white/20 sm:block">|</span>
            <span className="text-xs text-white/40 hidden sm:block">Admin Portal</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-white/50 sm:flex">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" />
              {username}
            </div>
            <a
              href="/"
              target="_blank"
              rel="noopener"
              className="ghost-button hidden text-xs sm:inline-flex"
            >
              View Site ↗
            </a>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/70 transition hover:border-red-500/40 hover:bg-red-500/10 hover:text-red-400"
              >
                Logout
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Tab bar ── */}
      <div className="border-b border-white/10 bg-[#090d10]">
        <div className="mx-auto max-w-7xl overflow-x-auto px-4 md:px-6">
          <div className="flex gap-1 py-2">
            {TABS.map((tab) => {
              const active = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id)}
                  className={[
                    "flex shrink-0 items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all",
                    active
                      ? "bg-accent/15 text-accent"
                      : "text-white/50 hover:bg-white/5 hover:text-white/80"
                  ].join(" ")}
                >
                  <span className="text-base leading-none">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {counts[tab.id] > 0 && (
                    <span className={[
                      "rounded-full px-1.5 py-0.5 text-[10px] font-bold leading-none",
                      active ? "bg-accent/25 text-accent" : "bg-white/10 text-white/40"
                    ].join(" ")}>
                      {counts[tab.id]}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── Page title strip ── */}
      <div className="border-b border-white/8 bg-[#0a0e11] py-4">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <p className="text-lg font-semibold">
            {activeTabMeta.icon} {activeTabMeta.label}
          </p>
          <p className="mt-0.5 text-xs text-white/40">{activeTabMeta.desc}</p>
        </div>
      </div>

      {/* ── Content area ── */}
      <main className="mx-auto max-w-7xl px-4 py-8 md:px-6">

        {activeTab === "packages" && (
          <AdminEditor
            title="Tour Packages"
            type="package"
            items={packages as never[]}
          />
        )}

        {activeTab === "gallery" && (
          <AdminEditor
            title="Gallery Photos"
            type="gallery"
            items={gallery as never[]}
          />
        )}

        {activeTab === "testimonials" && (
          <AdminEditor
            title="Testimonials"
            type="testimonial"
            items={testimonials as never[]}
          />
        )}

        {activeTab === "faqs" && (
          <AdminEditor
            title="FAQ Items"
            type="faq"
            items={faqs as never[]}
          />
        )}

        {activeTab === "content" && (
          sections.length > 0 ? (
            <AdminEditor
              title="Page Sections"
              type="section"
              items={sections as never[]}
              keyField="key"
            />
          ) : (
            <EmptyState message="No page sections found in the database. Run the seed script to populate them." />
          )
        )}

        {activeTab === "tiles" && (
          <div className="space-y-8">
            {tileGroups["what-we-do"].length > 0 && (
              <AdminEditor
                title="What We Do — Tiles"
                type="topicTile"
                items={tileGroups["what-we-do"] as never[]}
              />
            )}
            {tileGroups["what-we-have-done"].length > 0 && (
              <AdminEditor
                title="What We Have Done — Tiles"
                type="topicTile"
                items={tileGroups["what-we-have-done"] as never[]}
              />
            )}
            {tileGroups["where-play"].length > 0 && (
              <AdminEditor
                title="Where To Play — Tiles"
                type="topicTile"
                items={tileGroups["where-play"] as never[]}
              />
            )}
            {tileGroups["what-we-do"].length === 0 && tileGroups["what-we-have-done"].length === 0 && tileGroups["where-play"].length === 0 && (
              <EmptyState message="No topic tiles found. Run the seed script to populate them." />
            )}
          </div>
        )}

        {activeTab === "settings" && (
          settings ? (
            <AdminEditor
              title="Site Settings"
              type="settings"
              items={[settings] as never[]}
            />
          ) : (
            <EmptyState message="Site settings record not found. Run the seed script to create it." />
          )
        )}

      </main>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-white/15 bg-white/[0.02] py-20 text-center">
      <span className="text-4xl opacity-40">📭</span>
      <p className="mt-4 text-sm text-white/40">{message}</p>
    </div>
  );
}
