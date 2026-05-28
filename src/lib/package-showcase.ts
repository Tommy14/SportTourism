import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import { resolvePackageItinerary } from "@/lib/package-itinerary";

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
    itineraryJson: resolvePackageItinerary(pkg)
  }));
}
