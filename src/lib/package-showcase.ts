import { itineraryFallbackForPackage } from "@/data/itineraries";
import { PACKAGE_ITINERARY_BY_TITLE } from "@/data/package-itinerary-seeds";
import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import { parsePackageItinerary } from "@/types/package-itinerary";

type RawPackage = {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  pricingNote: string;
  itineraryJson?: unknown;
};

export function toPackageShowcaseItems(packages: RawPackage[]): PackageShowcaseItem[] {
  return packages.map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    duration: pkg.duration,
    inclusions: pkg.inclusions,
    pricingNote: pkg.pricingNote,
    itineraryJson:
      parsePackageItinerary(pkg.itineraryJson) ??
      itineraryFallbackForPackage(pkg) ??
      PACKAGE_ITINERARY_BY_TITLE[pkg.title] ??
      null
  }));
}
