import type { HotelStars, PlayCity } from "@/data/tour-options";

export type ReferenceHotel = {
  city: PlayCity;
  stars: HotelStars;
  name: string;
  area?: string;
};

export const REFERENCE_HOTELS: ReferenceHotel[] = [
  { city: "Colombo", stars: 5, name: "Shangri-La Colombo", area: "Galle Face" },
  { city: "Colombo", stars: 5, name: "Cinnamon Grand Colombo", area: "Colombo 3" },
  { city: "Colombo", stars: 4, name: "Cinnamon Lakeside", area: "Colombo 2" },
  { city: "Colombo", stars: 4, name: "Mövenpick Colombo", area: "Colombo 3" },
  { city: "Colombo", stars: 3, name: "Fairway Colombo", area: "Colombo 10" },
  { city: "Colombo", stars: 3, name: "Hotel Sapphire", area: "Colombo 6" },

  { city: "Galle", stars: 5, name: "Fort Bazaar Galle", area: "Galle Fort" },
  { city: "Galle", stars: 4, name: "Jetwing Lighthouse", area: "Galle" },
  { city: "Galle", stars: 4, name: "Amari Galle", area: "Galle" },
  { city: "Galle", stars: 3, name: "Lady Hill Hotel", area: "Galle" },
  { city: "Galle", stars: 3, name: "Southern Comforts", area: "Unawatuna" },

  { city: "Dambulla", stars: 5, name: "Heritance Kandalama", area: "Dambulla" },
  { city: "Dambulla", stars: 4, name: "Jetwing Lake", area: "Dambulla" },
  { city: "Dambulla", stars: 4, name: "Amaya Lake", area: "Dambulla" },
  { city: "Dambulla", stars: 3, name: "Pelwehera Village Resort", area: "Dambulla" },
  { city: "Dambulla", stars: 3, name: "Sigiriya Village Hotel", area: "Sigiriya" },

  { city: "Negombo", stars: 5, name: "Jetwing Lagoon", area: "Negombo" },
  { city: "Negombo", stars: 4, name: "Camelot Beach Hotel", area: "Negombo" },
  { city: "Negombo", stars: 4, name: "Jetwing Sea", area: "Negombo" },
  { city: "Negombo", stars: 3, name: "Goldi Sands Hotel", area: "Negombo" },
  { city: "Negombo", stars: 3, name: "Paradise Beach Hotel", area: "Negombo" },

  { city: "Kandy", stars: 5, name: "Earl's Regency Hotel", area: "Kandy" },
  { city: "Kandy", stars: 4, name: "Mahaweli Reach Hotel", area: "Kandy" },
  { city: "Kandy", stars: 4, name: "OZO Kandy", area: "Kandy" },
  { city: "Kandy", stars: 3, name: "Hotel Suisse", area: "Kandy" },
  { city: "Kandy", stars: 3, name: "Senani Hotel", area: "Kandy" },

  { city: "Hikkaduwa", stars: 4, name: "Coral Sands Hotel", area: "Hikkaduwa" },
  { city: "Hikkaduwa", stars: 4, name: "Hikka Tranz by Cinnamon", area: "Hikkaduwa" },
  { city: "Hikkaduwa", stars: 3, name: "Hikka Beach Hotel", area: "Hikkaduwa" },
  { city: "Hikkaduwa", stars: 3, name: "Ransara Beach Hotel", area: "Hikkaduwa" },

  { city: "Kalutara", stars: 5, name: "Anantara Kalutara", area: "Kalutara" },
  { city: "Kalutara", stars: 4, name: "Turyaa Kalutara", area: "Kalutara" },
  { city: "Kalutara", stars: 4, name: "Mermaid Hotel & Club", area: "Kalutara" },
  { city: "Kalutara", stars: 3, name: "Royal Palms Beach Hotel", area: "Kalutara" },
  { city: "Kalutara", stars: 3, name: "Tangerine Beach Hotel", area: "Kalutara" }
];

export function getReferenceHotels(cities: string[], stars: HotelStars): ReferenceHotel[] {
  const citySet = new Set(cities);
  return REFERENCE_HOTELS.filter((h) => citySet.has(h.city) && h.stars === stars);
}

export function pickHotelForCity(city: string, stars: HotelStars): ReferenceHotel | null {
  const matches = REFERENCE_HOTELS.filter((h) => h.city === city && h.stars === stars);
  return matches[0] ?? null;
}
