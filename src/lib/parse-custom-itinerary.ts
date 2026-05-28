import { z } from "zod";
import type { CustomItineraryDay } from "@/types/package-itinerary";

const customDaySchema = z.object({
  day: z.number(),
  location: z.string().min(1),
  activity: z.string().min(1),
  hotelName: z.string().min(1),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)])
});

const llmResponseSchema = z.object({
  days: z.array(customDaySchema).min(1)
});

export function parseCustomItineraryDays(value: unknown): CustomItineraryDay[] | null {
  const parsed = llmResponseSchema.safeParse(value);
  if (!parsed.success) return null;
  return parsed.data.days;
}
