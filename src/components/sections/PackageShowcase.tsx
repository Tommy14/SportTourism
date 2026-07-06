"use client";

import { PackageBookingFlow } from "@/components/packages/PackageBookingFlow";
import type { PackageItinerary } from "@/types/package-itinerary";
import Image from "next/image";
import { useState } from "react";

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
  const [openPackage, setOpenPackage] = useState<PackageShowcaseItem | null>(null);

  return (
    <div className="flex min-h-0 flex-col md:flex-1 md:justify-center">
      {/* ── Mobile: vertical stack ── */}
      <div className="flex min-h-0 flex-1 flex-col gap-2 overflow-hidden md:hidden">
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
                "flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border shadow-lg",
                featured
                  ? "border-accent/50 bg-panel shadow-accent/10"
                  : "border-white/10 bg-[#0e1318]"
              ].join(" ")}
            >
              {/* Image */}
              <div className="relative h-[22%] min-h-[3.5rem] max-h-[5rem] w-full flex-shrink-0 overflow-hidden">
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
              <div className="flex min-h-0 flex-1 flex-col p-3">
                <h3 className={`shrink-0 font-bold leading-snug ${featured ? "text-base" : "text-sm"}`}>
                  {item.title}
                </h3>
                <ul className="mt-1 flex min-h-0 flex-1 flex-col justify-center gap-0.5 overflow-hidden">
                  {highlights.map((highlight, i) => (
                    <li key={i} className="flex items-start gap-1.5 text-[10px] text-white/75">
                      <span className="mt-[2px] shrink-0 text-[8px] text-accent">✦</span>
                      <span className="line-clamp-1">{highlight}</span>
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  className="ghost-button mt-1 shrink-0 w-full py-1.5 text-[10px]"
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
      <div className="relative hidden min-h-0 flex-1 md:flex md:flex-col md:justify-center">
        <div className="packages-scroll overflow-x-auto overflow-y-hidden scroll-smooth">
          <div className="mx-auto flex w-max max-w-full items-stretch gap-3 px-2 lg:gap-4 lg:px-4">
          {cards.map((item, idx) => {
            const featured = idx === featuredIndex;
            const highlights = item.inclusions
              .split(",")
              .map((s) => s.trim())
              .filter(Boolean)
              .slice(0, 4);

            return (
              <article
                key={item.id}
                style={featured ? undefined : { animationDelay: `${idx * 90}ms` }}
                className={[
                  "flex flex-col overflow-hidden rounded-2xl border shadow-lg transition-[transform,box-shadow] duration-300",
                  featured
                    ? "animate-package-feature relative z-[1] w-[19rem] max-w-[28vw] border-accent/50 bg-panel shadow-accent/15"
                    : "animate-package-in w-[16rem] max-w-[24vw] border-white/10 bg-[#0e1318] hover:-translate-y-0.5 hover:border-white/20",
                  "hover:shadow-xl"
                ].join(" ")}
              >
                {/* Image */}
                <div className="relative h-24 w-full flex-shrink-0 overflow-hidden lg:h-28">
                  {item.imageUrl ? (
                    <Image src={item.imageUrl} alt={item.title} fill sizes="(max-width: 768px) 100vw, 33vw" className="object-cover" unoptimized />
                  ) : (
                    <div className={`flex h-full w-full items-center justify-center ${featured ? "bg-gradient-to-br from-accent/20 to-accentSoft/10" : "bg-gradient-to-br from-white/5 to-white/[0.02]"}`}>
                      <svg viewBox="0 0 64 64" className="h-12 w-12 opacity-15" fill="none">
                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="2" className="text-accent" />
                        <path d="M20 32 Q32 20 44 32 Q32 44 20 32Z" stroke="currentColor" strokeWidth="2" fill="none" className="text-accent" />
                        <line x1="32" y1="4" x2="32" y2="60" stroke="currentColor" strokeWidth="1.5" className="text-accent/60" />
                      </svg>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080B0D] via-[#080B0D]/20 to-transparent" />
                  {featured && (
                    <span className="absolute left-1/2 top-2 -translate-x-1/2 rounded-full bg-accent px-3 py-0.5 text-[9px] font-bold uppercase tracking-widest text-ink shadow-lg">
                      Most Popular
                    </span>
                  )}
                  <div className="absolute bottom-2 left-3">
                    <span className="rounded-full border border-accent/35 bg-black/70 px-2.5 py-0.5 text-[10px] font-semibold text-accent backdrop-blur-sm">
                      {item.duration}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col p-3 lg:p-4">
                  <h3 className={`shrink-0 font-bold leading-snug ${featured ? "text-base lg:text-lg" : "text-sm lg:text-base"}`}>
                    {item.title}
                  </h3>
                  <ul className="mt-1.5 flex flex-col gap-1 overflow-hidden">
                    {highlights.map((highlight, i) => (
                      <li key={i} className="flex items-start gap-1.5 text-[11px] text-white/75 lg:text-xs">
                        <span className="mt-[2px] shrink-0 text-[8px] text-accent">✦</span>
                        <span className="line-clamp-2">{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <p className="mt-1.5 shrink-0 text-[10px] text-white/35">Pricing available on enquiry — fully custom quotes</p>
                  <button
                    type="button"
                    className="ghost-button mt-1.5 shrink-0 w-full py-1.5 text-xs"
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
      </div>

      {openPackage ? (
        <PackageBookingFlow pkg={openPackage} onClose={() => setOpenPackage(null)} />
      ) : null}
    </div>
  );
}
