export const OPPONENT_LEVELS = [
  "School Level",
  "A Level",
  "B Level",
  "Club Level",
  "University Level",
  "Academy Level"
] as const;

export type OpponentLevel = (typeof OPPONENT_LEVELS)[number];

export const PLAY_CITIES = [
  "Colombo",
  "Galle",
  "Dambulla",
  "Negombo",
  "Kandy",
  "Hikkaduwa",
  "Kalutara"
] as const;

export type PlayCity = (typeof PLAY_CITIES)[number];

export const HOTEL_STAR_OPTIONS = [3, 4, 5] as const;

export type HotelStars = (typeof HOTEL_STAR_OPTIONS)[number];
