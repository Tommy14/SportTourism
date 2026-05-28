import type { ItineraryDay, PackageItinerary } from "@/types/package-itinerary";

export type MatchFormat = "T20" | "50-over";

export type ScheduledMatch = {
  number: number;
  format: MatchFormat;
};

export type DayMatchSpec = {
  day: number;
  dayType: "arrival" | "training" | "match" | "leisure" | "transfer" | "departure" | "other";
  matches: ScheduledMatch[];
  canonicalActivity: string;
  canonicalLocation: string;
};

export type PackageMatchSpec = {
  summary: string;
  t20Count: number;
  fiftyOverCount: number;
  totalMatches: number;
  perDay: DayMatchSpec[];
};

function inferDayType(activity: string, location: string): DayMatchSpec["dayType"] {
  const text = `${activity} ${location}`.toLowerCase();
  if (/airport|arrival|meet & greet|check-in/.test(text) && !/departure/.test(text)) return "arrival";
  if (/departure|airport transfer/.test(text) && !/match/.test(text)) return "departure";
  if (/match/.test(text)) return "match";
  if (/training|net session|nets/.test(text)) return "training";
  if (/→|transfer/.test(location)) return "transfer";
  if (/orphanage|sightseeing|fort|museum|shopping|cocktail|leisure|safari|dinner/.test(text) && !/match/.test(text))
    return "leisure";
  return "other";
}

/** Parse match numbers and format from a single day's activity text. */
export function extractMatchesFromActivity(activity: string): ScheduledMatch[] {
  if (!/match/i.test(activity)) return [];

  const numbers = [...activity.matchAll(/#(\d+)/gi)].map((m) => Number(m[1]));
  if (!numbers.length) {
    const format: MatchFormat = /50-over|fifty-over/i.test(activity) ? "50-over" : "T20";
    return [{ number: 0, format }];
  }

  return numbers.map((num) => {
    const segment =
      activity.match(new RegExp(`#0?${num}\\b[^#]*`, "i"))?.[0] ?? activity;
    const format: MatchFormat = /50-over|fifty-over/i.test(segment) ? "50-over" : "T20";
    return { number: num, format };
  });
}

function parseCountsFromSummary(summary: string): { t20Count: number; fiftyOverCount: number } {
  const t20Match = summary.match(/(\d+)\s*T20/i);
  const fiftyMatch = summary.match(/(\d+)\s*(?:fifty-over|50-over|50 over)/i);
  return {
    t20Count: t20Match ? Number(t20Match[1]) : 0,
    fiftyOverCount: fiftyMatch ? Number(fiftyMatch[1]) : 0
  };
}

export function buildPackageMatchSpec(itinerary: PackageItinerary): PackageMatchSpec {
  const perDay: DayMatchSpec[] = itinerary.days.map((d) => {
    const matches = extractMatchesFromActivity(d.activity);
    return {
      day: d.day,
      dayType: inferDayType(d.activity, d.location),
      matches,
      canonicalActivity: d.activity,
      canonicalLocation: d.location
    };
  });

  const fromDays = {
    t20Count: perDay.flatMap((d) => d.matches).filter((m) => m.format === "T20").length,
    fiftyOverCount: perDay.flatMap((d) => d.matches).filter((m) => m.format === "50-over").length
  };

  const fromSummary = parseCountsFromSummary(itinerary.summary);

  const t20Count = fromSummary.t20Count || fromDays.t20Count;
  const fiftyOverCount = fromSummary.fiftyOverCount || fromDays.fiftyOverCount;

  return {
    summary: itinerary.summary,
    t20Count,
    fiftyOverCount,
    totalMatches: t20Count + fiftyOverCount,
    perDay
  };
}

export function formatMatchScheduleForPrompt(spec: PackageMatchSpec) {
  return {
    inclusionsSummary: spec.summary,
    totals: {
      totalMatches: spec.totalMatches,
      t20Matches: spec.t20Count,
      fiftyOverMatches: spec.fiftyOverCount
    },
    perDaySchedule: spec.perDay.map((d) => ({
      day: d.day,
      dayType: d.dayType,
      matchCountOnDay: d.matches.length,
      matchesOnDay: d.matches.map((m) => ({
        matchNumber: m.number,
        format: m.format
      })),
      canonicalLocation: d.canonicalLocation,
      canonicalActivity: d.canonicalActivity,
      rules:
        d.matches.length === 0
          ? "NO matches on this day — do not add any match."
          : `EXACTLY ${d.matches.length} match(es) on this day: ${d.matches.map((m) => `#${String(m.number).padStart(2, "0")} (${m.format})`).join(", ")}.`
    }))
  };
}

export function countFormats(matches: ScheduledMatch[]) {
  return {
    t20: matches.filter((m) => m.format === "T20").length,
    fiftyOver: matches.filter((m) => m.format === "50-over").length
  };
}

export function buildMatchActivityText(
  matches: ScheduledMatch[],
  city: string,
  opponentLevel: string
): string {
  if (!matches.length) return "";

  const parts = matches.map((m) => {
    const label = m.number > 0 ? `#${String(m.number).padStart(2, "0")}` : "Match";
    if (m.format === "50-over") {
      return `${label} (50-over vs ${opponentLevel} at ${city})`;
    }
    return `${label} (T20 vs ${opponentLevel} at ${city})`;
  });

  if (parts.length === 1) return `Match ${parts[0]}`;
  if (parts.length === 2) return `Match ${parts[0]} & ${parts[1]}`;
  return `Matches ${parts.slice(0, -1).join(", ")} & ${parts[parts.length - 1]}`;
}
