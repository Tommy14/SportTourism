export type ItineraryDay = {
  day: number;
  location: string;
  activity: string;
};

export type PackageItinerary = {
  summary: string;
  days: ItineraryDay[];
};

export type CustomItineraryDay = ItineraryDay & {
  hotelName: string;
  hotelStars: number;
};

export function parsePackageItinerary(value: unknown): PackageItinerary | null {
  if (!value || typeof value !== "object") return null;
  const obj = value as Record<string, unknown>;
  if (!Array.isArray(obj.days)) return null;
  const days = obj.days
    .map((d) => {
      if (!d || typeof d !== "object") return null;
      const day = d as Record<string, unknown>;
      if (typeof day.day !== "number" || typeof day.location !== "string" || typeof day.activity !== "string") {
        return null;
      }
      return { day: day.day, location: day.location, activity: day.activity };
    })
    .filter((d): d is ItineraryDay => d !== null);
  if (!days.length) return null;
  return {
    summary: typeof obj.summary === "string" ? obj.summary : "",
    days
  };
}
