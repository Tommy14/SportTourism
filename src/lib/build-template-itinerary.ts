import { pickHotelForCity } from "@/data/reference-hotels";
import type { HotelStars } from "@/data/tour-options";
import {
  buildMatchActivityText,
  buildPackageMatchSpec,
  type DayMatchSpec
} from "@/lib/itinerary-match-spec";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

function buildLocation(
  daySpec: DayMatchSpec,
  city: string,
  fromCity?: string,
  toCity?: string
): string {
  switch (daySpec.dayType) {
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

function buildNonMatchActivity(
  daySpec: DayMatchSpec,
  city: string,
  opponentLevel: string,
  toCity?: string
): string {
  const canonical = daySpec.canonicalActivity;

  switch (daySpec.dayType) {
    case "arrival":
      return `Airport meet & greet, transfer to ${city}, check-in`;
    case "training":
      return `Training / net session at a 1st-class ground in ${city} (opposition standard: ${opponentLevel})`;
    case "leisure":
      return canonical.replace(
        /Negombo|Kandy|Hikkaduwa|Kalutara|Galle|Colombo|Dambulla/gi,
        city
      );
    case "transfer":
      return `Transfer to ${toCity ?? city}, team coach and luggage`;
    case "departure":
      return canonical.toLowerCase().includes("match")
        ? `${buildMatchActivityText(daySpec.matches, city, opponentLevel)}, Colombo shopping, airport transfer`
        : `Team wrap-up in ${city}, Colombo shopping optional, airport transfer`;
    default:
      return canonical;
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
    hotelStars: HotelStars[];
    opponentLevels: string[];
  }
): CustomItineraryDay[] {
  const cities = options.cities;
  if (!cities.length) return [];

  const opponentLevel = options.opponentLevels.join(", ");
  const primaryHotelStars = Math.max(...options.hotelStars) as HotelStars;

  const matchSpec = buildPackageMatchSpec(base);
  const citySchedule = assignCitiesToDays(base.days.length, cities);

  return base.days.map((day, index) => {
    const daySpec = matchSpec.perDay[index];
    const city = citySchedule[index] ?? cities[0];
    const prevCity = index > 0 ? citySchedule[index - 1] : city;
    const nextCity = index < base.days.length - 1 ? citySchedule[index + 1] : city;

    const hasTransfer =
      cities.length > 1 &&
      daySpec.dayType === "transfer" &&
      (daySpec.canonicalLocation.includes("→") || /transfer/i.test(daySpec.canonicalActivity));

    const effectiveType = hasTransfer ? "transfer" : daySpec.dayType;
    const fromCity = effectiveType === "transfer" ? prevCity : city;
    const toCity = effectiveType === "transfer" ? nextCity : city;

    let activity: string;
    if (daySpec.matches.length > 0) {
      activity = buildMatchActivityText(daySpec.matches, city, opponentLevel);
      if (/transfer/i.test(daySpec.canonicalActivity) && nextCity && nextCity !== city) {
        activity += `, transfer to ${nextCity}`;
      }
    } else {
      activity = buildNonMatchActivity(daySpec, city, opponentLevel, toCity);
    }

    const hotelCity = effectiveType === "transfer" ? toCity : city;
    const hotel = pickHotelForCity(hotelCity, options.hotelStars);

    return {
      day: day.day,
      location: buildLocation({ ...daySpec, dayType: effectiveType }, city, fromCity, toCity),
      activity,
      hotelName: hotel?.name ?? "Hotel TBD",
      hotelStars: hotel?.stars ?? primaryHotelStars
    };
  });
}

export function formatTravelDates(travelStart: string, travelEnd?: string): string {
  if (!travelStart) return "Not specified";
  if (!travelEnd) return travelStart;
  return `${travelStart} → ${travelEnd}`;
}
