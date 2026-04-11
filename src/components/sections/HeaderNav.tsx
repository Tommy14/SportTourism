"use client";

import { useState } from "react";
import { InquiryButton } from "../ui/InquiryButton";

const links = [
  { href: "#home", label: "Home" },
  { href: "#what-we-do", label: "What We Do" },
  { href: "#what-we-have-done", label: "What We've Done" },
  { href: "#where-play", label: "Where You Play" },
  { href: "#gallery", label: "Gallery" },
  { href: "#packages", label: "Packages" },
  { href: "#testimonials", label: "Testimonials" },
  { href: "#faq", label: "FAQ" },
  { href: "#contact", label: "Contact" }
];

export function HeaderNav({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#0b1014]/90 backdrop-blur-md">
      <div className="section-shell flex h-16 items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-2">
          <span className="inline-block h-7 w-7 rounded-md bg-gradient-to-br from-accent to-accentSoft" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">{brand}</span>
        </a>
        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-x-4 overflow-x-auto overflow-y-hidden text-xs text-white/85 md:flex md:py-1 lg:text-sm">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="shrink-0 transition hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>
        <div className="hidden md:block">
          <InquiryButton />
        </div>
        <button
          onClick={() => setOpen((value) => !value)}
          className="rounded-lg border border-white/20 px-3 py-2 text-xs font-semibold md:hidden"
          aria-label="Toggle menu"
        >
          Menu
        </button>
      </div>
      {open && (
        <div className="section-shell pb-4 md:hidden">
          <nav className="panel-card flex flex-col gap-3 p-4 text-sm">
            {links.map((link) => (
              <a key={link.href} href={link.href} onClick={() => setOpen(false)} className="text-white/85">
                {link.label}
              </a>
            ))}
            <InquiryButton />
          </nav>
        </div>
      )}
      <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-accent/50 to-transparent opacity-60" />
    </header>
  );
}
