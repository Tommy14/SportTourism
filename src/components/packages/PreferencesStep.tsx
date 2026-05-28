"use client";

import { getReferenceHotels } from "@/data/reference-hotels";
import { HOTEL_STAR_OPTIONS, OPPONENT_LEVELS, PLAY_CITIES, type HotelStars } from "@/data/tour-options";

export type TourPreferences = {
  opponentLevel: string;
  cities: string[];
  hotelStars: HotelStars;
  travelStart: string;
  travelEnd: string;
};

type PreferencesStepProps = {
  preferences: TourPreferences;
  onChange: (next: TourPreferences) => void;
  onPreview: () => void;
  onBack: () => void;
};

export function PreferencesStep({ preferences, onChange, onPreview, onBack }: PreferencesStepProps) {
  const referenceHotels =
    preferences.cities.length > 0 && preferences.hotelStars
      ? getReferenceHotels(preferences.cities, preferences.hotelStars)
      : [];

  function toggleCity(city: string) {
    const cities = preferences.cities.includes(city)
      ? preferences.cities.filter((c) => c !== city)
      : [...preferences.cities, city];
    onChange({ ...preferences, cities });
  }

  const canPreview = preferences.opponentLevel && preferences.cities.length > 0 && preferences.travelStart;

  return (
    <div className="space-y-6">
      <div>
        <p className="mb-2 text-sm font-semibold text-white">What types of opponents do you need to play with?</p>
        <div className="flex flex-wrap gap-2">
          {OPPONENT_LEVELS.map((level) => (
            <button
              key={level}
              type="button"
              onClick={() => onChange({ ...preferences, opponentLevel: level })}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition",
                preferences.opponentLevel === level
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
              ].join(" ")}
            >
              {level}
            </button>
          ))}
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
        <p className="mb-2 text-sm font-semibold text-white">Which hotel standard do you need?</p>
        <div className="flex flex-wrap gap-2">
          {HOTEL_STAR_OPTIONS.map((stars) => (
            <button
              key={stars}
              type="button"
              onClick={() => onChange({ ...preferences, hotelStars: stars })}
              className={[
                "rounded-full border px-3 py-1.5 text-sm transition",
                preferences.hotelStars === stars
                  ? "border-accent bg-accent/15 text-accent"
                  : "border-white/15 bg-white/5 text-white/80 hover:border-white/30"
              ].join(" ")}
            >
              {stars} stars
            </button>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-white">When are you planning to come?</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-sm text-white/70">
            Start date
            <input
              type="date"
              required
              value={preferences.travelStart}
              onChange={(e) => onChange({ ...preferences, travelStart: e.target.value })}
              className="input-dark mt-1 w-full"
            />
          </label>
          <label className="text-sm text-white/70">
            End date (optional)
            <input
              type="date"
              value={preferences.travelEnd}
              min={preferences.travelStart || undefined}
              onChange={(e) => onChange({ ...preferences, travelEnd: e.target.value })}
              className="input-dark mt-1 w-full"
            />
          </label>
        </div>
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

      <div className="flex flex-wrap gap-3">
        <button type="button" className="ghost-button" onClick={onBack}>
          Back
        </button>
        <button type="button" className="pill-button" disabled={!canPreview} onClick={onPreview}>
          Preview itinerary
        </button>
      </div>
    </div>
  );
}
