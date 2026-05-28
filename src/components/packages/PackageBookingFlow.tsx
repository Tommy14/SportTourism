"use client";

import { useMemo, useState } from "react";
import { ModalShell } from "@/components/packages/ModalShell";
import { ItineraryDetailStep } from "@/components/packages/ItineraryDetailStep";
import { PreferencesStep, type TourPreferences } from "@/components/packages/PreferencesStep";
import { ReviewSubmitStep } from "@/components/packages/ReviewSubmitStep";
import { getReferenceHotels } from "@/data/reference-hotels";
import type { ItineraryGenerationSource } from "@/lib/generate-itinerary";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import type { CustomItineraryDay } from "@/types/package-itinerary";

type FlowStep = "detail" | "preferences" | "review";

const DEFAULT_PREFERENCES: TourPreferences = {
  opponentLevel: "",
  cities: [],
  hotelStars: 4,
  travelStart: "",
  travelEnd: ""
};

type PackageBookingFlowProps = {
  pkg: PackageShowcaseItem | null;
  onClose: () => void;
};

export function PackageBookingFlow({ pkg, onClose }: PackageBookingFlowProps) {
  const [step, setStep] = useState<FlowStep>("detail");
  const [preferences, setPreferences] = useState<TourPreferences>(DEFAULT_PREFERENCES);
  const [generatedItinerary, setGeneratedItinerary] = useState<CustomItineraryDay[]>([]);
  const [generationSource, setGenerationSource] = useState<ItineraryGenerationSource | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const itinerary = pkg?.itineraryJson ?? null;

  const referenceHotelsShown = useMemo(() => {
    if (!preferences.cities.length) return [];
    return getReferenceHotels(preferences.cities, preferences.hotelStars).map((h) => ({
      city: h.city,
      name: h.name,
      stars: h.stars
    }));
  }, [preferences.cities, preferences.hotelStars]);

  if (!pkg) return null;

  const titles: Record<FlowStep, string> = {
    detail: `${pkg.title} — Itinerary`,
    preferences: "Customize your tour",
    review: "Your personalized itinerary"
  };

  function handleClose() {
    setStep("detail");
    setPreferences(DEFAULT_PREFERENCES);
    setGeneratedItinerary([]);
    setGenerationSource(null);
    setPreviewError(null);
    onClose();
  }

  async function handlePreview() {
    if (!pkg || !itinerary) return;

    setPreviewLoading(true);
    setPreviewError(null);

    try {
      const response = await fetch("/api/itinerary/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packageId: pkg.id,
          cities: preferences.cities,
          hotelStars: preferences.hotelStars,
          opponentLevel: preferences.opponentLevel,
          travelStart: preferences.travelStart,
          travelEnd: preferences.travelEnd || undefined
        })
      });

      const data = (await response.json()) as {
        ok?: boolean;
        days?: CustomItineraryDay[];
        source?: ItineraryGenerationSource;
        error?: string;
      };

      if (!response.ok || !data.days?.length) {
        setPreviewError(data.error ?? "Could not generate itinerary. Please try again.");
        return;
      }

      setGeneratedItinerary(data.days);
      setGenerationSource(data.source ?? "template");
      setStep("review");
    } catch {
      setPreviewError("Network error. Please try again.");
    } finally {
      setPreviewLoading(false);
    }
  }

  return (
    <ModalShell title={titles[step]} onClose={handleClose}>
      {step === "detail" ? (
        <ItineraryDetailStep
          pkg={pkg}
          itinerary={itinerary}
          onCustomize={() => setStep("preferences")}
        />
      ) : null}

      {step === "preferences" ? (
        <PreferencesStep
          preferences={preferences}
          hasItinerary={Boolean(itinerary)}
          previewLoading={previewLoading}
          previewError={previewError}
          onChange={setPreferences}
          onPreview={handlePreview}
          onBack={() => setStep("detail")}
        />
      ) : null}

      {step === "review" && previewLoading ? (
        <p className="text-sm text-white/70">Building your personalized itinerary…</p>
      ) : null}

      {step === "review" && !previewLoading && generatedItinerary.length > 0 ? (
        <ReviewSubmitStep
          pkg={pkg}
          preferences={preferences}
          itinerary={generatedItinerary}
          generationSource={generationSource}
          referenceHotelsShown={referenceHotelsShown}
          onBack={() => setStep("preferences")}
        />
      ) : null}

      {step === "review" && !previewLoading && generatedItinerary.length === 0 ? (
        <div className="space-y-4">
          <p className="text-sm text-red-400">
            We couldn&apos;t build a preview for this package. Please go back and try again, or contact us
            directly.
          </p>
          <button type="button" className="ghost-button" onClick={() => setStep("preferences")}>
            Back to preferences
          </button>
        </div>
      ) : null}
    </ModalShell>
  );
}
