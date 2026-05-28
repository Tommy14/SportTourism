import { pickHotelForCity } from "@/data/reference-hotels";
import type { HotelStars } from "@/data/tour-options";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

type DayType = "arrival" | "training" | "match" | "leisure" | "transfer" | "departure";

function inferDayType(activity: string, location: string): DayType {
  const text = `${activity} ${location}`.toLowerCase();
  if (/airport|arrival|meet & greet|check-in/.test(text) && !/departure/.test(text)) return "arrival";
  if (/departure|airport transfer/.test(text)) return "departure";
  if (/match/.test(text)) return "match";
  if (/training|net session|nets/.test(text)) return "training";
  if (/→|transfer/.test(text)) return "transfer";
  if (/orphanage|sightseeing|cocktail|shopping|leisure|safari/.test(text)) return "leisure";
  return "leisure";
}

function isFiftyOver(activity: string): boolean {
  return /50-over|fifty-over|50 over/i.test(activity);
}

function buildActivity(
  type: DayType,
  city: string,
  opponentLevel: string,
  matchIndex: number,
  fiftyOver: boolean,
  fromCity?: string,
  toCity?: string
): string {
  switch (type) {
    case "arrival":
      return `Airport meet & greet, transfer to ${city}, check-in`;
    case "training":
      return `Training / net session at a 1st-class ground in ${city} (opposition standard: ${opponentLevel})`;
    case "match":
      return fiftyOver
        ? `50-over match vs ${opponentLevel} opposition at ${city} — Match #${matchIndex}`
        : `T20 vs ${opponentLevel} opposition at ${city} — Match #${matchIndex}`;
    case "leisure":
      return `Team leisure time and local experience in ${city}`;
    case "transfer":
      return `Transfer from ${fromCity ?? city} to ${toCity ?? city}, luggage and team coach`;
    case "departure":
      return `Match or wrap-up in ${city} if scheduled, Colombo shopping optional, airport transfer`;
    default:
      return `Activities in ${city}`;
  }
}

function buildLocation(type: DayType, city: string, fromCity?: string, toCity?: string): string {
  switch (type) {
    case "arrival":
      return `Arrival → ${city}`;
    case "departure":
      return `${city} → Colombo → Departure`;
    case "transfer":
      return `${fromCity ?? city} → ${toCity ?? city}`;
    default:
      return city;
  }
}

function assignCitiesToDays(dayCount: number, cities: string[]): string[] {
  if (cities.length === 1) {
    return Array(dayCount).fill(cities[0]);
  }

  const schedule: string[] = [];
  const blockSize = Math.max(1, Math.floor(dayCount / cities.length));

  for (let i = 0; i < dayCount; i++) {
    const cityIndex = Math.min(Math.floor(i / blockSize), cities.length - 1);
    schedule.push(cities[cityIndex]);
  }

  return schedule;
}

export function buildTemplateItinerary(
  base: PackageItinerary,
  options: {
    cities: string[];
    hotelStars: HotelStars;
    opponentLevel: string;
  }
): CustomItineraryDay[] {
  const cities = options.cities;
  if (!cities.length) return [];

  const citySchedule = assignCitiesToDays(base.days.length, cities);
  let matchCounter = 0;

  return base.days.map((day, index) => {
    const type = inferDayType(day.activity, day.location);
    const city = citySchedule[index] ?? cities[0];
    const prevCity = index > 0 ? citySchedule[index - 1] : city;
    const nextCity = index < base.days.length - 1 ? citySchedule[index + 1] : city;

    const effectiveType: DayType =
      cities.length > 1 &&
      prevCity !== city &&
      type !== "arrival" &&
      type !== "departure" &&
      (type === "transfer" || index > 0)
        ? "transfer"
        : type;

    const fromCity = effectiveType === "transfer" ? prevCity : city;
    const toCity = effectiveType === "transfer" ? city : city;

    if (effectiveType === "match") matchCounter += 1;

    const hotelCity = effectiveType === "transfer" ? toCity : city;
    const hotel = pickHotelForCity(hotelCity, options.hotelStars);

    return {
      day: day.day,
      location: buildLocation(effectiveType, city, fromCity, toCity),
      activity: buildActivity(
        effectiveType,
        effectiveType === "transfer" ? toCity : city,
        options.opponentLevel,
        matchCounter || 1,
        isFiftyOver(day.activity),
        fromCity,
        toCity
      ),
      hotelName: hotel?.name ?? "Hotel TBD",
      hotelStars: options.hotelStars
    };
  });
}

export function formatTravelDates(travelStart: string, travelEnd?: string): string {
  if (!travelStart) return "Not specified";
  if (!travelEnd) return travelStart;
  return `${travelStart} → ${travelEnd}`;
}
