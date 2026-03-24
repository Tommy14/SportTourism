"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function PortalLoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");

  async function handleSubmit(formData: FormData) {
    setError("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!response.ok) {
      const data = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(data?.error || "Login failed");
      return;
    }
    router.push("/portal/dashboard");
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-ink px-4">
      <form action={handleSubmit} className="w-full max-w-md rounded-2xl border border-white/15 bg-panel p-6">
        <h1 className="mb-4 text-2xl font-bold">Portal Login</h1>
        <div className="space-y-3">
          <input name="username" required placeholder="Username" className="w-full rounded-lg bg-ink/70 p-3" />
          <input name="password" required type="password" placeholder="Password" className="w-full rounded-lg bg-ink/70 p-3" />
        </div>
        <button type="submit" className="pill-button mt-4 w-full">
          Login
        </button>
        {error && <p className="mt-3 text-sm text-red-400">{error}</p>}
      </form>
    </main>
  );
}
