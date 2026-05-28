import { getReferenceHotels } from "@/data/reference-hotels";
import type { HotelStars } from "@/data/tour-options";
import { getLlmConfig } from "@/lib/llm-config";
import {
  buildPackageMatchSpec,
  formatMatchScheduleForPrompt
} from "@/lib/itinerary-match-spec";
import { parseCustomItineraryDays } from "@/lib/parse-custom-itinerary";
import { validateAdaptedItinerary } from "@/lib/validate-adapted-itinerary";
import type { CustomItineraryDay, PackageItinerary } from "@/types/package-itinerary";

export type GenerateItineraryInput = {
  packageTitle: string;
  packageDuration: string;
  packageInclusions: string;
  baseItinerary: PackageItinerary;
  cities: string[];
  hotelStars: HotelStars;
  opponentLevel: string;
  travelStart: string;
  travelEnd?: string;
};

const SYSTEM_PROMPT = `You ADAPT a fixed cricket tour itinerary — you do NOT invent a new tour.

You will receive PACKAGE_MATCH_SCHEDULE with EXACT match counts per day. You MUST follow it precisely.

STRICT RULES:
1. Output EXACTLY one object per canonical day — same count, same day numbers (1, 2, 3…).
2. Follow PACKAGE_MATCH_SCHEDULE.perDaySchedule for each day:
   - If matchCountOnDay is 0 → activity must NOT mention any match.
   - If matchesOnDay lists matches → include EXACTLY those match numbers and formats (T20 vs 50-over).
3. Totals across the tour MUST equal PACKAGE_MATCH_SCHEDULE.totals (t20Matches + fiftyOverMatches).
4. Preserve dayType: training days stay training, leisure stays leisure, arrival/departure unchanged in purpose.
5. ALL cricket must be in the user's selected cities ONLY.
6. hotelName MUST be copied EXACTLY from allowedHotelNames, or "Hotel TBD".
7. hotelStars MUST equal user hotelStars.
8. Do NOT invent extra matches or change match numbering.
9. Return ONLY JSON: { "days": [ ... ] } — no markdown.`;

function buildAdaptationBrief(base: PackageItinerary, matchSpec: ReturnType<typeof buildPackageMatchSpec>) {
  return matchSpec.perDay.map((d) => ({
    day: d.day,
    dayType: d.dayType,
    canonicalLocation: d.canonicalLocation,
    canonicalActivity: d.canonicalActivity,
    requiredMatchesOnDay: d.matches.map((m) => ({
      matchNumber: m.number,
      format: m.format
    })),
    adaptInstruction:
      d.matches.length > 0
        ? `Rewrite for user cities/opponent. Keep EXACTLY these matches: ${d.matches.map((m) => `#${String(m.number).padStart(2, "0")} ${m.format}`).join(", ")}.`
        : "Rewrite for user cities. Do NOT add any match on this day."
  }));
}

export async function generateItineraryWithLlm(
  input: GenerateItineraryInput
): Promise<CustomItineraryDay[] | null> {
  const config = getLlmConfig();
  if (!config) return null;

  const matchSpec = buildPackageMatchSpec(input.baseItinerary);
  const matchSchedule = formatMatchScheduleForPrompt(matchSpec);

  const referenceHotels = getReferenceHotels(input.cities, input.hotelStars);
  const allowedHotelNames = new Set([
    ...referenceHotels.map((h) => h.name),
    "Hotel TBD"
  ]);

  const userPrompt = JSON.stringify(
    {
      task: "Adapt the canonical itinerary. Match schedule is mandatory — do not change match counts.",
      package: {
        title: input.packageTitle,
        duration: input.packageDuration,
        inclusionsSummary: input.packageInclusions
      },
      PACKAGE_MATCH_SCHEDULE: matchSchedule,
      userPreferences: {
        cities: input.cities,
        hotelStars: input.hotelStars,
        opponentLevel: input.opponentLevel,
        travelStart: input.travelStart,
        travelEnd: input.travelEnd ?? null
      },
      CANONICAL_PACKAGE_ITINERARY: {
        summary: input.baseItinerary.summary,
        days: input.baseItinerary.days
      },
      dayByDayAdaptationBrief: buildAdaptationBrief(input.baseItinerary, matchSpec),
      referenceHotels: referenceHotels.map((h) => ({
        city: h.city,
        name: h.name,
        stars: h.stars,
        area: h.area ?? null
      })),
      allowedHotelNames: [...allowedHotelNames]
    },
    null,
    2
  );

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

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
        temperature: 0.1,
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
    const days = parseCustomItineraryDays(parsed);
    if (!days) return null;

    if (!validateAdaptedItinerary(days, input.baseItinerary, allowedHotelNames)) {
      console.warn("LLM itinerary failed match validation — using template fallback");
      return null;
    }

    return days.map((d) => ({
      ...d,
      hotelStars: input.hotelStars
    }));
  } catch (error) {
    console.error("LLM itinerary generation failed:", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
