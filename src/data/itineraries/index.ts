import type { PackageItinerary } from "@/types/package-itinerary";
import { parsePackageItinerary } from "@/types/package-itinerary";
import tour7 from "./7-day-tour.json";
import tour10 from "./10-day-tour.json";
import tour14 from "./14-day-tour.json";

const parsed7 = parsePackageItinerary(tour7);
const parsed10 = parsePackageItinerary(tour10);
const parsed14 = parsePackageItinerary(tour14);

export function itineraryFallbackForPackage(pkg: {
  title: string;
  duration: string;
}): PackageItinerary | null {
  const dayMatch = pkg.duration.match(/(\d+)\s*Days?/i);
  const dayCount = dayMatch ? Number(dayMatch[1]) : 0;

  if (dayCount >= 14 && parsed14) return parsed14;
  if (dayCount >= 10 && parsed10) return parsed10;
  if (dayCount >= 7 && parsed7) return parsed7;
  if (dayCount >= 5 && parsed7) return parsed7;

  return parsed7 ?? parsed10 ?? parsed14 ?? null;
}
