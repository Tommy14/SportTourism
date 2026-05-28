import { buildTemplateItinerary } from "@/lib/build-template-itinerary";
import type { HotelStars } from "@/data/tour-options";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

/** @deprecated Use generateItinerary() API or buildTemplateItinerary() directly. */
export function buildCustomItinerary(
  base: PackageItinerary,
  options: {
    cities: string[];
    hotelStars: HotelStars;
    opponentLevel: string;
    travelStart: string;
    travelEnd?: string;
  }
): CustomItineraryDay[] {
  void options.travelStart;
  void options.travelEnd;
  return buildTemplateItinerary(base, options);
}

export { formatTravelDates } from "@/lib/build-template-itinerary";
