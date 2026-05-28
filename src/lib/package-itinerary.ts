import { itineraryFallbackForPackage } from "@/data/itineraries";
import { PACKAGE_ITINERARY_BY_TITLE } from "@/data/package-itinerary-seeds";
import { db } from "@/lib/db";
import { parsePackageItinerary, type PackageItinerary } from "@/types/package-itinerary";

export type ResolvedPackage = {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  itinerary: PackageItinerary;
};

export function resolvePackageItinerary(pkg: {
  id: number;
  title: string;
  duration: string;
  inclusions: string;
  itineraryJson?: unknown;
}): PackageItinerary | null {
  return (
    parsePackageItinerary(pkg.itineraryJson) ??
    itineraryFallbackForPackage(pkg) ??
    PACKAGE_ITINERARY_BY_TITLE[pkg.title] ??
    null
  );
}

/** Authoritative itinerary for a package (DB → JSON files → seeds). */
export async function getCanonicalPackageById(packageId: number): Promise<ResolvedPackage | null> {
  const pkg = await db.package.findUnique({ where: { id: packageId } });
  if (!pkg) return null;

  const itinerary = resolvePackageItinerary(pkg);
  if (!itinerary) return null;

  return {
    id: pkg.id,
    title: pkg.title,
    duration: pkg.duration,
    inclusions: pkg.inclusions,
    itinerary
  };
}
