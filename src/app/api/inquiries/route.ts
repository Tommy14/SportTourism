import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendInquiryEmail, sendPackageInquiryEmail } from "@/lib/email";

const contactInquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  message: z.string().min(10)
});

const itineraryDaySchema = z.object({
  day: z.number(),
  location: z.string(),
  activity: z.string(),
  hotelName: z.string(),
  hotelStars: z.number()
});

const packageInquirySchema = z.object({
  type: z.literal("package"),
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().min(5),
  teamName: z.string().optional(),
  preferredPackage: z.string().min(1),
  packageId: z.number(),
  opponentLevel: z.string().min(1),
  cities: z.array(z.string()).min(1),
  hotelStars: z.union([z.literal(3), z.literal(4), z.literal(5)]),
  travelStart: z.string().min(1),
  travelEnd: z.string().optional(),
  generatedItinerary: z.array(itineraryDaySchema).min(1),
  referenceHotelsShown: z.array(
    z.object({
      city: z.string(),
      name: z.string(),
      stars: z.number()
    })
  ),
  generationSource: z.enum(["llm", "template"]).optional()
});

function buildPackageMessage(data: z.infer<typeof packageInquirySchema>): string {
  const lines = [
    `Package inquiry: ${data.preferredPackage} (id ${data.packageId})`,
    `Opponent level: ${data.opponentLevel}`,
    `Cities: ${data.cities.join(", ")}`,
    `Hotel standard: ${data.hotelStars} stars`,
    `Travel: ${data.travelStart}${data.travelEnd ? ` → ${data.travelEnd}` : ""}`,
    data.generationSource ? `Itinerary source: ${data.generationSource}` : "",
    "",
    "Generated itinerary:",
    ...data.generatedItinerary.map(
      (d) =>
        `Day ${d.day} | ${d.location} | ${d.activity} | Hotel: ${d.hotelName} (${d.hotelStars}★)`
    ),
    "",
    "--- JSON ---",
    JSON.stringify(data, null, 2)
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  try {
    const body = await request.json();

    if (body?.type === "package") {
      const data = packageInquirySchema.parse(body);
      const message = buildPackageMessage(data);

      await db.inquiry.create({
        data: {
          name: data.name,
          email: data.email,
          phone: data.phone,
          teamName: data.teamName ?? null,
          preferredPackage: data.preferredPackage,
          message
        }
      });

      try {
        await sendPackageInquiryEmail({
          name: data.name,
          email: data.email,
          phone: data.phone,
          teamName: data.teamName,
          preferredPackage: data.preferredPackage,
          opponentLevel: data.opponentLevel,
          cities: data.cities,
          hotelStars: data.hotelStars,
          travelStart: data.travelStart,
          travelEnd: data.travelEnd,
          generatedItinerary: data.generatedItinerary,
          referenceHotelsShown: data.referenceHotelsShown,
          generationSource: data.generationSource,
          message
        });
      } catch {
        return NextResponse.json(
          { error: "Inquiry saved but email could not be sent. Please try again or contact us directly." },
          { status: 500 }
        );
      }

      return NextResponse.json({ ok: true });
    }

    const data = contactInquirySchema.parse(body);

    await db.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        teamName: null,
        preferredPackage: null,
        message: data.message
      }
    });

    await sendInquiryEmail(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 });
  }
}
