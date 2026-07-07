"use client";

import { getReferenceHotels } from "@/data/reference-hotels";
import { HOTEL_STAR_OPTIONS, OPPONENT_LEVELS, PLAY_CITIES, type HotelStars } from "@/data/tour-options";

export type TourPreferences = {
  opponentLevels: string[];
  cities: string[];
  hotelStars: HotelStars[];
  travelStart: string;
};

type PreferencesStepProps = {
  preferences: TourPreferences;
  hasItinerary: boolean;
  previewLoading?: boolean;
  previewError?: string | null;
  onChange: (next: TourPreferences) => void;
  onPreview: () => void | Promise<void>;
  onBack: () => void;
};

export function PreferencesStep({
  preferences,
  hasItinerary,
  previewLoading = false,
  previewError = null,
  onChange,
  onPreview,
  onBack
}: PreferencesStepProps) {
  const referenceHotels =
    preferences.cities.length > 0 && preferences.hotelStars.length > 0
      ? getReferenceHotels(preferences.cities, preferences.hotelStars)
      : [];

  function toggleCity(city: string) {
    const cities = preferences.cities.includes(city)
      ? preferences.cities.filter((c) => c !== city)
      : [...preferences.cities, city];
    onChange({ ...preferences, cities });
  }

  function toggleOpponentLevel(level: string) {
    const opponentLevels = preferences.opponentLevels.includes(level)
      ? preferences.opponentLevels.filter((l) => l !== level)
      : [...preferences.opponentLevels, level];
    onChange({ ...preferences, opponentLevels });
  }

  function toggleHotelStars(stars: HotelStars) {
    const hotelStars = preferences.hotelStars.includes(stars)
      ? preferences.hotelStars.filter((s) => s !== stars)
      : [...preferences.hotelStars, stars];
    onChange({ ...preferences, hotelStars });
  }

  const canPreview =
    hasItinerary &&
    preferences.opponentLevels.length > 0 &&
    preferences.cities.length > 0 &&
    preferences.hotelStars.length > 0 &&
    Boolean(preferences.travelStart);

  const missingFields: string[] = [];
  if (!hasItinerary) missingFields.push("package itinerary");
  if (!preferences.opponentLevels.length) missingFields.push("opponent level");
  if (!preferences.cities.length) missingFields.push("at least one city");
  if (!preferences.hotelStars.length) missingFields.push("hotel standard");
  if (!preferences.travelStart) missingFields.push("planning to visit date");

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-white">What types of opponents do you need to play with? (multiple)</p>
        <div className="flex flex-wrap gap-2">
          {OPPONENT_LEVELS.map((level) => {
            const selected = preferences.opponentLevels.includes(level);
            return (
              <button
                key={level}
                type="button"
                onClick={() => toggleOpponentLevel(level)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  selected
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
                ].join(" ")}
              >
                {level}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">Where do you need to play? (multiple)</p>
        <div className="flex flex-wrap gap-2">
          {PLAY_CITIES.map((city) => {
            const selected = preferences.cities.includes(city);
            return (
              <button
                key={city}
                type="button"
                onClick={() => toggleCity(city)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  selected
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
                ].join(" ")}
              >
                {city}
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">Which hotel standard do you need? (multiple)</p>
        <div className="flex flex-wrap gap-2">
          {HOTEL_STAR_OPTIONS.map((stars) => {
            const selected = preferences.hotelStars.includes(stars);
            return (
              <button
                key={stars}
                type="button"
                onClick={() => toggleHotelStars(stars)}
                className={[
                  "rounded-full border px-3 py-1.5 text-sm transition",
                  selected
                    ? "border-accent bg-accent/15 text-accent"
                    : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
                ].join(" ")}
              >
                {stars} stars
              </button>
            );
          })}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">When are you planning to come?</p>
        <label className="text-sm text-white/70">
          Planning to visit
          <input
            type="date"
            required
            value={preferences.travelStart}
            onChange={(e) => onChange({ ...preferences, travelStart: e.target.value })}
            className="input-dark mt-1 w-full"
          />
        </label>
      </div>

      {referenceHotels.length > 0 ? (
        <div>
          <p className="mb-2 text-sm font-semibold text-white">Reference hotels (for your selected cities)</p>
          <ul className="grid gap-2 sm:grid-cols-2">
            {referenceHotels.map((hotel) => (
              <li
                key={`${hotel.city}-${hotel.name}`}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm"
              >
                <span className="font-medium text-white">{hotel.name}</span>
                <span className="mt-0.5 block text-white/60">
                  {hotel.city}
                  {hotel.area ? ` · ${hotel.area}` : ""} · {hotel.stars}★
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      {!canPreview && missingFields.length > 0 ? (
        <p className="text-sm text-white/55">Complete: {missingFields.join(", ")}.</p>
      ) : null}

      {previewError ? <p className="text-sm text-red-400">{previewError}</p> : null}

      <div className="flex flex-wrap gap-3">
        <button type="button" className="ghost-button" onClick={onBack} disabled={previewLoading}>
          Back
        </button>
        <button
          type="button"
          className="pill-button disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0"
          disabled={!canPreview || previewLoading}
          onClick={onPreview}
        >
          {previewLoading ? "Generating…" : "Preview itinerary"}
        </button>
      </div>
    </div>
  );
}
