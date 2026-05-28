import { getReferenceHotels } from "@/data/reference-hotels";
import type { HotelStars } from "@/data/tour-options";
import { getLlmConfig } from "@/lib/llm-config";
import { parseCustomItineraryDays } from "@/lib/parse-custom-itinerary";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

export type GenerateItineraryInput = {
  packageTitle: string;
  packageDuration: string;
  baseItinerary: PackageItinerary;
  cities: string[];
  hotelStars: HotelStars;
  opponentLevel: string;
  travelStart: string;
  travelEnd?: string;
};

const SYSTEM_PROMPT = `You are a cricket tour planner for Sri Lanka sports tourism.
Return ONLY valid JSON (no markdown) matching this schema:
{
  "days": [
    {
      "day": number,
      "location": string,
      "activity": string,
      "hotelName": string,
      "hotelStars": 3 | 4 | 5
    }
  ]
}
Rules:
- Keep the SAME number of days as the sample itinerary.
- ALL matches, training, and nets must occur ONLY in the user-selected cities.
- If only ONE city is selected, every day must be in that city (arrival/departure may mention Colombo airport only for transfers).
- Use the reference hotels provided when possible for hotelName; otherwise pick a realistic name for that city and star rating.
- Preserve approximate match count and mix (T20 vs 50-over) from the sample.
- Include opponent level in match and training descriptions.
- Be specific and practical for touring cricket teams.`;

export async function generateItineraryWithLlm(
  input: GenerateItineraryInput
): Promise<CustomItineraryDay[] | null> {
  const config = getLlmConfig();
  if (!config) return null;

  const referenceHotels = getReferenceHotels(input.cities, input.hotelStars);

  const userPrompt = JSON.stringify(
    {
      package: {
        title: input.packageTitle,
        duration: input.packageDuration
      },
      preferences: {
        cities: input.cities,
        hotelStars: input.hotelStars,
        opponentLevel: input.opponentLevel,
        travelStart: input.travelStart,
        travelEnd: input.travelEnd ?? null
      },
      sampleItinerary: input.baseItinerary,
      referenceHotels: referenceHotels.map((h) => ({
        city: h.city,
        name: h.name,
        stars: h.stars,
        area: h.area ?? null
      }))
    },
    null,
    2
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${config.apiKey}`,
        "Content-Type": "application/json"
      },
      signal: controller.signal,
      body: JSON.stringify({
        model: config.model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userPrompt }
        ]
      })
    });

    if (!response.ok) {
      console.error("OpenAI itinerary error:", response.status, await response.text());
      return null;
    }

    const data = (await response.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const content = data.choices?.[0]?.message?.content;
    if (!content) return null;

    const parsed = JSON.parse(content) as unknown;
    return parseCustomItineraryDays(parsed);
  } catch (error) {
    console.error("LLM itinerary generation failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
