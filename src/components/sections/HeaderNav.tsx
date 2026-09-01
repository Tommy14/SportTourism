"use client";

import { useState } from "react";

const links = [
  { href: "#home", label: "Home" },
  { href: "#what-we-do", label: "Services" },
  { href: "#gallery", label: "Gallery" },
  { href: "#packages", label: "Packages" },
  { href: "#faq", label: "FAQ" }
];

export function HeaderNav({ brand }: { brand: string }) {
  const [open, setOpen] = useState(false);

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-[#080b0d]/90 backdrop-blur-md">
      <div className="section-shell-wide flex h-16 items-center justify-between gap-4">
        <a href="#home" className="flex items-center gap-2.5 shrink-0">
          <img src="/logo.png" alt="Pitch to Paradise" className="h-8 w-8 rounded-md" />
          <span className="text-xs font-extrabold uppercase tracking-wider text-white">{brand}</span>
        </a>

        <nav className="hidden items-center gap-6 text-sm text-white/75 md:flex">
          {links.map((link) => (
            <a key={link.href} href={link.href} className="transition hover:text-accent">
              {link.label}
            </a>
          ))}
        </nav>

        <a href="#contact" className="pill-button max-md:hidden shrink-0 text-xs md:inline-flex">
          Contact Us
        </a>

        <button
          onClick={() => setOpen((v) => !v)}
          className="rounded-lg border border-white/20 p-2.5 text-white md:hidden"
          aria-label="Toggle menu"
          aria-expanded={open}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            aria-hidden="true"
          >
            {open ? (
              <>
                <line x1="6" y1="6" x2="18" y2="18" />
                <line x1="18" y1="6" x2="6" y2="18" />
              </>
            ) : (
              <>
                <line x1="4" y1="7" x2="20" y2="7" />
                <line x1="4" y1="12" x2="20" y2="12" />
                <line x1="4" y1="17" x2="20" y2="17" />
              </>
            )}
          </svg>
        </button>
      </div>

      {open && (
        <div className="section-shell-wide pb-4 md:hidden">
          <nav className="panel-card flex flex-col gap-3 p-4 text-sm">
            {links.map((link) => (
              <a
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className="text-white/80 transition hover:text-accent"
              >
                {link.label}
              </a>
            ))}
            <a
              href="#contact"
              onClick={() => setOpen(false)}
              className="pill-button mt-1 w-full text-center text-xs"
            >
              Contact Us
            </a>
          </nav>
        </div>
      )}

      <div className="h-px w-full bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
    </header>
  );
}
