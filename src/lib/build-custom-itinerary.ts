import { pickHotelForCity } from "@/data/reference-hotels";
import type { HotelStars } from "@/data/tour-options";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

function cityFromLocation(location: string, selectedCities: string[]): string {
  for (const city of selectedCities) {
    if (location.toLowerCase().includes(city.toLowerCase())) return city;
  }
  return selectedCities[0] ?? location.split("→").pop()?.trim() ?? location;
}

function distributeCities(dayCount: number, cities: string[]): string[] {
  if (!cities.length) return [];
  const result: string[] = [];
  for (let i = 0; i < dayCount; i++) {
    result.push(cities[i % cities.length]);
  }
  return result;
}

function withOpponentNote(activity: string, opponentLevel: string): string {
  if (/match/i.test(activity)) {
    return activity.replace(/Match/i, `Match vs ${opponentLevel} opposition`);
  }
  if (/training|net/i.test(activity)) {
    return `${activity} (opposition standard: ${opponentLevel})`;
  }
  return activity;
}

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
  const citySchedule = distributeCities(base.days.length, options.cities);

  return base.days.map((day, index) => {
    const scheduledCity = citySchedule[index] ?? cityFromLocation(day.location, options.cities);
    const hotel = pickHotelForCity(scheduledCity, options.hotelStars);
    const location =
      options.cities.length > 0
        ? day.location.includes("→")
          ? day.location.replace(/[A-Za-z]+/g, (word) => {
              const match = options.cities.find((c) => c.toLowerCase() === word.toLowerCase());
              return match ?? word;
            })
          : scheduledCity
        : day.location;

    return {
      day: day.day,
      location,
      activity: withOpponentNote(day.activity, options.opponentLevel),
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
