import { NextResponse } from "next/server";
import { z } from "zod";
import { generateItinerary } from "@/lib/generate-itinerary";
import { getCanonicalPackageById } from "@/lib/package-itinerary";

const requestSchema = z.object({
  packageId: z.number().int().positive(),
  cities: z.array(z.string()).min(1),
  hotelStars: z.array(z.union([z.literal(3), z.literal(4), z.literal(5)])).min(1),
  opponentLevels: z.array(z.string()).min(1),
  travelStart: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = requestSchema.parse(body);

    const resolved = await getCanonicalPackageById(data.packageId);
    if (!resolved) {
      return NextResponse.json(
        { error: "Package not found or has no itinerary configured" },
        { status: 404 }
      );
    }

    const result = await generateItinerary({
      packageTitle: resolved.title,
      packageDuration: resolved.duration,
      packageInclusions: resolved.inclusions,
      baseItinerary: resolved.itinerary,
      cities: data.cities,
      hotelStars: data.hotelStars,
      opponentLevels: data.opponentLevels,
      travelStart: data.travelStart
    });

    if (!result.days.length) {
      return NextResponse.json({ error: "Could not generate itinerary" }, { status: 500 });
    }

    return NextResponse.json({ ok: true, ...result });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 });
  }
}
