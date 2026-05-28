import { buildTemplateItinerary } from "@/lib/build-template-itinerary";
import { generateItineraryWithLlm, type GenerateItineraryInput } from "@/lib/generate-itinerary-llm";
import type { CustomItineraryDay } from "@/types/package-itinerary";

export type ItineraryGenerationSource = "llm" | "template";

export type GenerateItineraryResult = {
  days: CustomItineraryDay[];
  source: ItineraryGenerationSource;
};

export async function generateItinerary(
  input: GenerateItineraryInput
): Promise<GenerateItineraryResult> {
  const llmDays = await generateItineraryWithLlm(input);
  if (llmDays?.length) {
    return { days: llmDays, source: "llm" };
  }

  const templateDays = buildTemplateItinerary(input.baseItinerary, {
    cities: input.cities,
    hotelStars: input.hotelStars,
    opponentLevel: input.opponentLevel
  });

  return { days: templateDays, source: "template" };
}
