import {
  buildPackageMatchSpec,
  countFormats,
  extractMatchesFromActivity
} from "@/lib/itinerary-match-spec";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

/**
 * Reject LLM output that drifts from the canonical package itinerary structure.
 */
export function validateAdaptedItinerary(
  adapted: CustomItineraryDay[],
  base: PackageItinerary,
  allowedHotelNames: Set<string>
): boolean {
  const spec = buildPackageMatchSpec(base);

  if (adapted.length !== base.days.length) return false;

  let adaptedT20 = 0;
  let adaptedFifty = 0;

  for (let i = 0; i < base.days.length; i++) {
    const baseDaySpec = spec.perDay[i];
    const adaptedDay = adapted[i];

    if (!baseDaySpec || adaptedDay.day !== baseDaySpec.day) return false;
    if (!adaptedDay.location?.trim() || !adaptedDay.activity?.trim()) return false;

    const hotelOk =
      adaptedDay.hotelName === "Hotel TBD" || allowedHotelNames.has(adaptedDay.hotelName);
    if (!hotelOk) return false;

    const adaptedMatches = extractMatchesFromActivity(adaptedDay.activity);

    if (adaptedMatches.length !== baseDaySpec.matches.length) return false;

    for (let j = 0; j < baseDaySpec.matches.length; j++) {
      const expected = baseDaySpec.matches[j];
      const actual = adaptedMatches[j];
      if (expected.number > 0 && actual.number !== expected.number) return false;
      if (actual.format !== expected.format) return false;
    }

    if (baseDaySpec.matches.length === 0 && /match/i.test(adaptedDay.activity)) return false;

    const dayFormats = countFormats(adaptedMatches);
    adaptedT20 += dayFormats.t20;
    adaptedFifty += dayFormats.fiftyOver;
  }

  if (adaptedT20 !== spec.t20Count || adaptedFifty !== spec.fiftyOverCount) return false;

  return true;
}
