import type { PackageItinerary } from "@/types/package-itinerary";

const INCLUSIONS_SUMMARY =
  "5 T20s + 1 fifty-over match • Star-grade hotels • AC luxury coach • Team manager • Ambulance & medical staff • Bottled water • Airport transfers • Baggage vehicle • SIM card assistance • Group souvenir photo";

export const PRO_PLAYER_ITINERARY: PackageItinerary = {
  summary: INCLUSIONS_SUMMARY,
  days: [
    { day: 1, location: "Arrival → Negombo", activity: "Airport meet & greet, transfer to hotel, check-in" },
    { day: 2, location: "Negombo", activity: "Training / Net Session at a 1st class ground" },
    {
      day: 3,
      location: "Negombo → Kandy",
      activity: "Match #01 & #02 (T20s at Negombo), transfer to Kandy"
    },
    { day: 4, location: "Kandy", activity: "Match #03 & #04 (T20s at Kandy)" },
    {
      day: 5,
      location: "Kandy → Hikkaduwa",
      activity: "Pinnawela Elephant Orphanage, lunch at riverside café, transfer south"
    },
    {
      day: 6,
      location: "Hikkaduwa → Kalutara",
      activity: "Match #05 (50-over match at Hikkaduwa), transfer to Kalutara"
    },
    {
      day: 7,
      location: "Kalutara → Colombo → Departure",
      activity: "Match #06 (T20 at Kalutara), cocktail party, shopping in Colombo, airport transfer"
    }
  ]
};

export const STARTER_ITINERARY: PackageItinerary = {
  summary:
    "2 warm-up matches • 3-star hotels • AC coach • Team manager • Bottled water • Airport transfers • Group souvenir photo",
  days: [
    { day: 1, location: "Arrival → Colombo", activity: "Airport meet & greet, transfer to hotel, check-in" },
    { day: 2, location: "Colombo", activity: "Training / Net Session at a Colombo club ground" },
    { day: 3, location: "Colombo → Galle", activity: "Match #01 (T20 at Colombo), transfer to Galle" },
    { day: 4, location: "Galle", activity: "Match #02 (T20 at Galle), fort sightseeing" },
    {
      day: 5,
      location: "Galle → Colombo → Departure",
      activity: "Morning nets, team lunch, shopping in Colombo, airport transfer"
    }
  ]
};

export const ELITE_ITINERARY: PackageItinerary = {
  summary: INCLUSIONS_SUMMARY + " • Specialist coaching clinics • Extended leisure day",
  days: [
    { day: 1, location: "Arrival → Negombo", activity: "Airport meet & greet, transfer to hotel, check-in" },
    { day: 2, location: "Negombo", activity: "Training / Net Session at a 1st class ground" },
    {
      day: 3,
      location: "Negombo → Kandy",
      activity: "Match #01 & #02 (T20s at Negombo), transfer to Kandy"
    },
    { day: 4, location: "Kandy", activity: "Match #03 & #04 (T20s at Kandy)" },
    {
      day: 5,
      location: "Kandy → Hikkaduwa",
      activity: "Pinnawela Elephant Orphanage, lunch at riverside café, transfer south"
    },
    {
      day: 6,
      location: "Hikkaduwa → Kalutara",
      activity: "Match #05 (50-over match at Hikkaduwa), transfer to Kalutara"
    },
    { day: 7, location: "Kalutara", activity: "Match #06 (T20 at Kalutara), leisure afternoon" },
    {
      day: 8,
      location: "Kalutara → Dambulla",
      activity: "Match #07 (T20 at Dambulla), cultural stop en route"
    },
    { day: 9, location: "Dambulla → Galle", activity: "Match #08 (T20 at Galle), specialist bowling clinic" },
    {
      day: 10,
      location: "Galle → Colombo → Departure",
      activity: "Cocktail party, shopping in Colombo, airport transfer"
    }
  ]
};

export const PACKAGE_ITINERARY_BY_TITLE: Record<string, PackageItinerary> = {
  "Starter Plan": STARTER_ITINERARY,
  "Pro Player Plan": PRO_PLAYER_ITINERARY,
  "Elite Champion Plan": ELITE_ITINERARY
};
