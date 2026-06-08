"use client";

import { PackageBookingFlow } from "@/components/packages/PackageBookingFlow";
import type { PackageItinerary } from "@/types/package-itinerary";
import Image from "next/image";
import { useLayoutEffect, useRef, useState } from "react";

export type PackageShowcaseItem = {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  pricingNote: string;
  imageUrl: string | null;
  itineraryJson: PackageItinerary | null;
};

type PackageShowcaseProps = {
  packages: PackageShowcaseItem[];
};

export function PackageShowcase({ packages }: PackageShowcaseProps) {
  const cards = packages;
  const featuredIndex = cards.length > 0 ? Math.floor((cards.length - 1) / 2) : 0;
  const scrollRef = useRef<HTMLDivElement>(null);
  const [openPackage, setOpenPackage] = useState<PackageShowcaseItem | null>(null);

  useLayoutEffect(() => {
    const root = scrollRef.current;
    if (!root) return;
    const featuredEl = root.children[featuredIndex] as HTMLElement | undefined;
    if (!featuredEl) return;
    const target =
      featuredEl.offsetLeft - (root.clientWidth - featuredEl.getBoundingClientRect().width) / 2;
    root.scrollTo({ left: Math.max(0, target), behavior: "instant" });
  }, [cards.length, featuredIndex]);

  return (
    <div className="flex flex-1 flex-col min-h-0">
      {/* ── Mobile: vertical stack ── */}
      <div className="flex flex-1 flex-col gap-4 md:hidden overflow-y-auto">
        {cards.map((item, idx) => {
          const featured = idx === featuredIndex;
          const highlights = item.inclusions
            .split(",")
            .map((s) => s.trim())
            .filter(Boolean)
            .slice(0, 5);

          return (
            <article
              key={item.id}
              className={[
                "flex flex-col overflow-hidden rounded-2xl border shadow-none",
                featured
                  ? "border-accent/30 bg-[var(--panel)]"
                  : "border-white/10 bg-[var(--panel)]"
              ].join(" ")}
            >
              {/* Image */}
              <div className="relative w-full flex-shrink-0 overflow-hidden" style={{height:"clamp(8rem,18vh,12rem)"}}>
                {item.imageUrl ? (
                  <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
                ) : (
                  <div className={`flex h-full w-full items-center justify-center ${featured ? "bg-gradient-to-br from-accent/20 to-accentSoft/10" : "bg-gradient-to-br from-white/5 to-white/[0.02]"}`}>
                    <svg viewBox="0 0 64 64" className="h-16 w-16 opacity-15" fill="none">
                      <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" className="text-accent" />
                      <path d="M20 32 Q32 20 44 32 Q32 44 20 32Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
                      <line x1="32" y1="4" x2="32" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-accent/60" />
                    </svg>
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-[#080B0D] via-[#080B0D]/20 to-transparent" />
                {featured && (
                  <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-accent px-4 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink shadow-lg">
                    Most Popular
                  </span>
                )}
                <div className="absolute bottom-3 left-4">
                  <span className="rounded-full border border-accent/35 bg-black/70 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
                    {item.duration}
                  </span>
                </div>
              </div>

              {/* Body */}
              <div className="flex flex-1 flex-col p-5">
                <h3 className={`font-bold leading-snug ${featured ? "text-xl" : "text-lg"}`}>
                  {item.title}
                </h3>
                <ul className="mt-4 flex flex-col gap-2.5">
                  {highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                      <span className="mt-[3px] shrink-0 text-[10px] text-accent">✦</span>
                      <span>{highlight}</span>
                    </li>
                  ))}
                </ul>
                <p className="mt-5 text-xs text-white/35">Pricing available on enquiry — fully custom quotes</p>
                <button
                  type="button"
                  className="ghost-button mt-3 w-full text-sm"
                  onClick={() => setOpenPackage(item)}
                >
                  View Itinerary
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {/* ── Desktop: horizontal carousel ── */}
      <div className="relative hidden flex-1 min-h-0 md:flex flex-col">
        <div aria-hidden className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-ink to-transparent" />
        <div aria-hidden className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-ink to-transparent" />
        <div
          ref={scrollRef}
          className="packages-scroll flex flex-1 min-h-0 snap-x snap-mandatory gap-6 overflow-x-auto scroll-smooth px-4 pb-4 pt-2 items-stretch"
        >
          {cards.map((item, idx) => {
            const featured = idx === featuredIndex;
            const highlights = item.inclusions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 5);

            return (
              <article
                key={item.id}
                style={featured ? undefined : { animationDelay: `${idx * 90}ms` }}
                className={[
                  "flex snap-center snap-always flex-col overflow-hidden rounded-2xl border transition-[transform] duration-300 will-change-transform self-stretch",
                  featured
                    ? "animate-package-feature relative z-[1] w-[min(24rem,31%)] scale-105 border-accent/35 bg-[var(--panel)]"
                    : "animate-package-in w-[min(20rem,29%)] border-white/10 bg-[var(--panel)] hover:-translate-y-0.5 hover:border-white/20",
                  ""
                ].join(" ")}
              >
                {/* Image */}
                <div className="relative w-full flex-shrink-0 overflow-hidden" style={{height:"clamp(7rem,15vh,11rem)"}}>
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${featured ? "bg-gradient-to-br from-accent/20 to-accentSoft/10" : "bg-gradient-to-br from-white/5 to-white/[0.02]"}`}>
                      <svg viewBox="0 0 64 64" className="h-16 w-16 opacity-15" fill="none">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" className="text-accent" />
                        <path d="M20 32 Q32 20 44 32 Q32 44 20 32Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
                        <line x1="32" y1="4" x2="32" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-accent/60" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B0D] via-[#080B0D]/20 to-transparent" />
                  {featured && (
                    <span className="absolute left-1/2 top-3 -translate-x-1/2 rounded-full bg-accent px-4 py-0.5 text-[10px] font-bold uppercase tracking-widest text-ink shadow-lg">
                      Most Popular
                    </span>
                  )}
                  <div className="absolute bottom-3 left-4">
                    <span className="rounded-full border border-accent/35 bg-black/70 px-3 py-1 text-xs font-semibold text-accent backdrop-blur-sm">
                      {item.duration}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-1 flex-col p-4 md:p-5">
                  <h3 className={`font-bold leading-snug ${featured ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}>
                    {item.title}
                  </h3>
                  <ul className="mt-4 flex flex-1 flex-col gap-2.5">
                    {highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm text-white/75">
                        <span className="mt-[3px] shrink-0 text-[10px] text-accent">✦</span>
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-5 text-xs text-white/35">Pricing available on enquiry — fully custom quotes</p>
                  <button
                    type="button"
                    className="ghost-button mt-3 w-full text-sm"
                    onClick={() => setOpenPackage(item)}
                  >
                    View Itinerary
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {openPackage ? (
        <PackageBookingFlow pkg={openPackage} onClose={() => setOpenPackage(null)} />
      ) : null}
    </div>
  );
}
