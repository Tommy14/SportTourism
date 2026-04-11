"use client";

import { useState } from "react";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(formData: FormData) {
    setStatus("sending");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    setStatus(response.ok ? "success" : "error");
  }

  return (
    <form id="inquiry" action={handleSubmit} className="rounded-2xl border border-white/15 bg-[#11181e] p-6 shadow-xl shadow-black/20">
      <h3 className="mb-1 text-2xl font-bold">Send an Inquiry</h3>
      <p className="mb-5 text-sm text-white/65">Share your team requirements and we will send the best itinerary.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input required name="name" placeholder="Name" className="input-dark" />
        <input required type="email" name="email" placeholder="Email" className="input-dark" />
        <input required name="phone" placeholder="Phone" className="input-dark md:col-span-2" />
        <textarea
          required
          name="message"
          placeholder="Tell us your tour requirements"
          className="input-dark min-h-32 md:col-span-2"
        />
      </div>
      <button type="submit" className="pill-button mt-5 min-w-44">
        {status === "sending" ? "Sending..." : "Submit inquiry"}
      </button>
      {status === "success" && <p className="mt-3 text-accent">Inquiry sent successfully.</p>}
      {status === "error" && <p className="mt-3 text-red-400">Could not send inquiry. Please try again.</p>}
    </form>
  );
}
