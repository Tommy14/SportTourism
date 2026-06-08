import type { PackageShowcaseItem } from "@/components/sections/PackageShowcase";
import { resolvePackageItinerary } from "@/lib/package-itinerary";

type RawPackage = {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  pricingNote: string;
  imageUrl?: string | null;
  itineraryJson?: unknown;
};

export function toPackageShowcaseItems(packages: RawPackage[]): PackageShowcaseItem[] {
  return packages.map((pkg) => ({
    id: pkg.id,
    title: pkg.title,
    duration: pkg.duration,
    inclusions: pkg.inclusions,
    pricingNote: pkg.pricingNote,
    imageUrl: pkg.imageUrl ?? null,
    itineraryJson: resolvePackageItinerary(pkg)
  }));
}
