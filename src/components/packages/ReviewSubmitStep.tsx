"use client";

import { useState } from "react";
import type { CustomItineraryDay } from "@/types/package-itinerary";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import type { TourPreferences } from "@/components/packages/PreferencesStep";
import type { ItineraryGenerationSource } from "@/lib/generate-itinerary";

type ReviewSubmitStepProps = {
  pkg: PackageShowcaseItem;
  preferences: TourPreferences;
  itinerary: CustomItineraryDay[];
  generationSource: ItineraryGenerationSource | null;
  referenceHotelsShown: { city: string; name: string; stars: number }[];
  onBack: () => void;
};

export function ReviewSubmitStep({
  pkg,
  preferences,
  itinerary,
  generationSource,
  referenceHotelsShown,
  onBack
}: ReviewSubmitStepProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [teamName, setTeamName] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");

    const response = await fetch("/api/inquiries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: "package",
        name,
        email,
        phone,
        teamName: teamName || undefined,
        preferredPackage: pkg.title,
        packageId: pkg.id,
        opponentLevels: preferences.opponentLevels,
        cities: preferences.cities,
        hotelStars: preferences.hotelStars,
        travelStart: preferences.travelStart,
        generatedItinerary: itinerary,
        referenceHotelsShown,
        generationSource: generationSource ?? undefined
      })
    });

    if (response.ok) {
      setStatus("success");
    } else {
      setStatus("error");
    }
  }

  return (
    <div className="space-y-5">
      {generationSource ? (
        <span className="badge-chip text-[10px]">
          {generationSource === "llm" ? "AI-personalized itinerary" : "Template-based itinerary"}
        </span>
      ) : null}

      <div className="rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white/75">
        <p>
          <span className="text-white/50">Opponent:</span> {preferences.opponentLevels.join(", ")}
        </p>
        <p>
          <span className="text-white/50">Cities:</span> {preferences.cities.join(", ")}
        </p>
        <p>
          <span className="text-white/50">Hotel:</span> {preferences.hotelStars.join(", ")} stars
        </p>
        <p>
          <span className="text-white/50">Planning to visit:</span> {preferences.travelStart}
        </p>
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full min-w-[36rem] text-left text-sm">
          <thead className="bg-white/5 text-xs uppercase tracking-wide text-white/60">
            <tr>
              <th className="px-3 py-2">Day</th>
              <th className="px-3 py-2">Location</th>
              <th className="px-3 py-2">Activity</th>
              <th className="px-3 py-2">Hotel</th>
            </tr>
          </thead>
          <tbody>
            {itinerary.map((day) => (
              <tr key={day.day} className="border-t border-white/10">
                <td className="px-3 py-2 font-semibold text-accent">Day {day.day}</td>
                <td className="px-3 py-2 text-white/85">{day.location}</td>
                <td className="px-3 py-2 text-white/75">{day.activity}</td>
                <td className="px-3 py-2 text-white/75">
                  {day.hotelName}
                  <span className="block text-xs text-white/50">{day.hotelStars}★</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <p className="text-sm font-semibold text-white">Your contact details</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Name"
            className="input-dark"
          />
          <input
            required
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            className="input-dark"
          />
          <input
            required
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="Phone"
            className="input-dark"
          />
          <input
            value={teamName}
            onChange={(e) => setTeamName(e.target.value)}
            placeholder="Team name (optional)"
            className="input-dark"
          />
        </div>
        <div className="flex flex-wrap gap-3">
          <button type="button" className="ghost-button" onClick={onBack}>
            Back
          </button>
          <button type="submit" className="pill-button" disabled={status === "sending"}>
            {status === "sending" ? "Submitting..." : "Submit inquiry"}
          </button>
        </div>
        {status === "success" && (
          <p className="text-accent">Thank you! We&apos;ll be in touch shortly.</p>
        )}
        {status === "error" && (
          <p className="text-red-400">Could not submit. Please try again or contact us directly.</p>
        )}
      </form>
    </div>
  );
}
