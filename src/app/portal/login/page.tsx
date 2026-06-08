"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    const formData = new FormData(event.currentTarget);
    const payload = Object.fromEntries(formData.entries());
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (!response.ok) {
        const data = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(data?.error || "Invalid username or password");
        return;
      }
      router.push("/portal/dashboard");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen bg-ink">
      {/* Left branding panel */}
      <div className="relative hidden flex-col justify-between overflow-hidden border-r border-white/10 bg-[#060a0c] p-10 lg:flex lg:w-[42%]">
        {/* Background pattern */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{ backgroundImage: "radial-gradient(circle, #64D38A 1px, transparent 1px)", backgroundSize: "28px 28px" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#060a0c]" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accentSoft">
            <svg viewBox="0 0 20 20" className="h-5 w-5 text-ink" fill="currentColor">
              <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
              <path d="M4 10 Q10 4 16 10 Q10 16 4 10Z" fill="currentColor" opacity="0.8" />
            </svg>
          </span>
          <span className="text-sm font-extrabold uppercase tracking-widest text-white">Pitch to Paradise</span>
        </div>

        {/* Hero text */}
        <div className="relative">
          <p className="text-4xl font-bold leading-snug text-white xl:text-5xl">
            Manage your<br />
            <span className="text-accent">cricket tours</span><br />
            with ease.
          </p>
          <p className="mt-5 text-sm leading-relaxed text-white/45">
            Update tour packages, gallery, testimonials, FAQ content and site settings — all from one place.
          </p>

          <div className="mt-8 flex flex-col gap-3">
            {["Edit tour packages & itineraries", "Upload gallery photos", "Manage testimonials & FAQs", "Update site content & settings"].map((item) => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/60">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-accent/15 text-[10px] text-accent">✓</span>
                {item}
              </div>
            ))}
          </div>
        </div>

        <p className="relative text-xs text-white/25">© {new Date().getFullYear()} Pitch to Paradise</p>
      </div>

      {/* Right login panel */}
      <div className="flex flex-1 items-center justify-center px-6 py-12">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accentSoft">
              <svg viewBox="0 0 20 20" className="h-4 w-4 text-ink" fill="currentColor">
                <circle cx="10" cy="10" r="8" stroke="currentColor" strokeWidth="1.5" fill="none" />
                <path d="M4 10 Q10 4 16 10 Q10 16 4 10Z" fill="currentColor" opacity="0.8" />
              </svg>
            </span>
            <span className="text-sm font-extrabold uppercase tracking-widest">Pitch to Paradise</span>
          </div>

          <h1 className="text-2xl font-bold text-white">Welcome back</h1>
          <p className="mt-1 text-sm text-white/45">Sign in to the admin portal</p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                Username
              </label>
              <input
                name="username"
                required
                autoComplete="username"
                placeholder="admin"
                className="input-dark"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-white/50">
                Password
              </label>
              <input
                name="password"
                required
                type="password"
                autoComplete="current-password"
                placeholder="••••••••"
                className="input-dark"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                <span>⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="pill-button mt-2 w-full disabled:opacity-60"
            >
              {loading ? "Signing in…" : "Sign In →"}
            </button>
          </form>

          <a
            href="/"
            className="mt-8 flex items-center justify-center gap-1.5 text-xs text-white/30 transition hover:text-white/60"
          >
            <span>←</span> Back to website
          </a>
        </div>
      </div>
    </main>
  );
}
