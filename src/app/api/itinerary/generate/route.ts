import { NextResponse } from "next/server";
import { z } from "zod";
import { generateItinerary } from "@/lib/generate-itinerary";
import { parsePackageItinerary } from "@/types/package-itinerary";

const requestSchema = z.object({
  packageTitle: z.string().min(1),
  packageDuration: z.string().min(1),
  baseItinerary: z.unknown(),
  cities: z.array(z.string()).min(1),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  opponentLevel: z.string().min(1),
  travelStart: z.string().min(1),
  travelEnd: z.string().optional()
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = requestSchema.parse(body);
    const baseItinerary = parsePackageItinerary(data.baseItinerary);

    if (!baseItinerary) {
      return NextResponse.json({ error: "Invalid base itinerary" }, { status: 400 });
    }

    const result = await generateItinerary({
      packageTitle: data.packageTitle,
      packageDuration: data.packageDuration,
      baseItinerary,
      cities: data.cities,
      hotelStars: data.hotelStars,
      opponentLevel: data.opponentLevel,
      travelStart: data.travelStart,
      travelEnd: data.travelEnd
    });

    if (!result.days.length) {
      return NextResponse.json({ error: "Could not generate itinerary" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 });
  }
}
