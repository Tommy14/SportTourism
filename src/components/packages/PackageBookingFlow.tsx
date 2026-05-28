"use client";

import { useMemo, useState } from "react";
import { ModalShell } from "@/components/packages/ModalShell";
import { ItineraryDetailStep } from "@/components/packages/ItineraryDetailStep";
import { PreferencesStep, type TourPreferences } from "@/components/packages/PreferencesStep";
import { ReviewSubmitStep } from "@/components/packages/ReviewSubmitStep";
import { getReferenceHotels } from "@/data/reference-hotels";
import { buildCustomItinerary } from "@/lib/build-custom-itinerary";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import type { PackageItinerary } from "@/types/package-itinerary";

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

  const itinerary = pkg?.itineraryJson ?? null;

  const generatedItinerary = useMemo(() => {
    if (!itinerary || !preferences.opponentLevel || !preferences.cities.length) return [];
    return buildCustomItinerary(itinerary, {
      cities: preferences.cities,
      hotelStars: preferences.hotelStars,
      opponentLevel: preferences.opponentLevel,
      travelStart: preferences.travelStart,
      travelEnd: preferences.travelEnd
    });
  }, [itinerary, preferences]);

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
    onClose();
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
          onChange={setPreferences}
          onPreview={() => setStep("review")}
          onBack={() => setStep("detail")}
        />
      ) : null}

      {step === "review" && generatedItinerary.length > 0 ? (
        <ReviewSubmitStep
          pkg={pkg}
          preferences={preferences}
          itinerary={generatedItinerary}
          referenceHotelsShown={referenceHotelsShown}
          onBack={() => setStep("preferences")}
        />
      ) : null}
    </ModalShell>
  );
}
