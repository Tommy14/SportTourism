"use client";

import { PackageBookingFlow } from "@/components/packages/PackageBookingFlow";
import { InquiryButton } from "@/components/ui/InquiryButton";
import type { PackageItinerary } from "@/types/package-itinerary";
import { useLayoutEffect, useRef, useState } from "react";

export type PackageShowcaseItem = {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  pricingNote: string;
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
    const featuredEl = root?.children[featuredIndex] as HTMLElement | undefined;
    if (!root || !featuredEl) return;
    const target =
      featuredEl.offsetLeft - (root.clientWidth - featuredEl.getBoundingClientRect().width) / 2;
    root.scrollTo({ left: Math.max(0, target), behavior: "instant" });
  }, [cards.length, featuredIndex]);

  return (
    <div className="relative">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 z-10 w-8 bg-gradient-to-r from-[#0b0f12] to-transparent sm:w-12"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-y-0 right-0 z-10 w-8 bg-gradient-to-l from-[#0b0f12] to-transparent sm:w-12"
      />
      <div
        ref={scrollRef}
        className="packages-scroll flex snap-x snap-mandatory gap-4 overflow-x-auto overflow-y-visible scroll-smooth px-3 pb-4 pt-3 [-webkit-overflow-scrolling:touch] sm:gap-5 sm:px-4 md:gap-6 md:pb-5 md:pt-4"
      >
        {cards.map((item, idx) => {
          const featured = idx === featuredIndex;
          return (
            <article
              key={item.id}
              style={featured ? undefined : { animationDelay: `${idx * 90}ms` }}
              className={[
                "flex snap-center snap-always flex-col rounded-2xl border p-6 shadow-lg transition-[transform,box-shadow] duration-300 will-change-transform",
                featured
                  ? "animate-package-feature relative z-[1] w-[min(22rem,88vw)] scale-[1.02] border-accent/55 bg-[#0d1419] shadow-accent/15 md:w-[min(24rem,31%)] md:min-h-[28rem] md:scale-105 md:py-8"
                  : "animate-package-in w-[min(19rem,82vw)] border-white/10 bg-[#121a20] md:w-[min(20rem,29%)] md:min-h-[24rem] md:py-6",
                "hover:shadow-xl",
                featured ? "hover:scale-[1.06] md:hover:scale-110" : "hover:-translate-y-0.5 hover:border-white/20"
              ].join(" ")}
            >
              {featured ? (
                <span className="absolute -top-px left-1/2 -translate-x-1/2 rounded-b-lg bg-accent/90 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-[#0c1216]">
                  Popular
                </span>
              ) : null}
              <h3
                className={`font-semibold ${featured ? "text-xl md:text-2xl" : "text-lg md:text-xl"}`}
              >
                {item.title}
              </h3>
              <p className={`mt-2 text-sm text-accent ${featured ? "md:text-base" : ""}`}>
                {item.duration}
              </p>
              <p
                className={`mt-3 font-extrabold text-accent ${featured ? "text-3xl md:text-4xl" : "text-2xl md:text-3xl"}`}
              >
                {item.pricingNote.replace("From ", "")}
              </p>
              <p className={`mt-3 text-sm text-white/70 ${featured ? "md:text-base" : ""}`}>
                {item.inclusions}
              </p>
              <ul className="mt-4 flex flex-1 flex-col space-y-2 text-sm text-white/80">
                {item.inclusions.split(",").slice(0, 4).map((feature, featureIndex) => (
                  <li key={featureIndex}>✓ {feature.trim()}</li>
                ))}
              </ul>
              <button
                type="button"
                className="ghost-button mt-4 w-full text-sm"
                onClick={() => setOpenPackage(item)}
              >
                View itinerary
              </button>
              <InquiryButton className="mt-3 w-full" label="Get Started" />
            </article>
          );
        })}
      </div>
      {openPackage ? (
        <PackageBookingFlow pkg={openPackage} onClose={() => setOpenPackage(null)} />
      ) : null}
    </div>
  );
}
