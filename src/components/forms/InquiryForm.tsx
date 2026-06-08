"use client";

import { useState } from "react";

export function InquiryForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(formData: FormData) {
    setStatus("sending");
    setErrorMsg("");
    const payload = Object.fromEntries(formData.entries());
    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (response.ok) {
      setStatus("success");
    } else {
      const data = await response.json().catch(() => ({})) as { error?: string };
      setErrorMsg(data.error ?? "Something went wrong. Please try again.");
      setStatus("error");
    }
  }

  return (
    <form id="contact-form" action={handleSubmit} className="rounded-2xl border border-white/15 bg-[#11181e] p-6 shadow-xl shadow-black/20">
      <h3 className="mb-1 text-2xl font-bold">Contact Us</h3>
      <p className="mb-5 text-sm text-white/65">Have a question? Drop us a message and we&apos;ll get back to you soon.</p>
      <div className="grid gap-3 md:grid-cols-2">
        <input required name="name" placeholder="Name" className="input-dark" />
        <input required type="email" name="email" placeholder="Email" className="input-dark" />
        <input required name="phone" placeholder="Phone" className="input-dark md:col-span-2" />
        <textarea
          required
          name="message"
          placeholder="How can we help?"
          className="input-dark min-h-32 md:col-span-2"
        />
      </div>
      <button type="submit" className="pill-button mt-5 min-w-44">
        {status === "sending" ? "Sending..." : "Send message"}
      </button>
      {status === "success" && <p className="mt-3 text-accent">Message sent successfully.</p>}
      {status === "error" && (
        <p className="mt-3 text-sm text-red-400">{errorMsg || "Could not send your message. Please try again."}</p>
      )}
    </form>
  );
}
