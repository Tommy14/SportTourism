import { NextResponse } from "next/server";
import { z, ZodError } from "zod";
import { db } from "@/lib/db";
import { sendInquiryEmail, sendPackageInquiryEmail } from "@/lib/email";

const contactInquirySchema = z.object({
  name:    z.string().min(1, "Name is required"),
  email:   z.string().email("Valid email is required"),
  phone:   z.string().min(1, "Phone is required"),
  message: z.string().min(1, "Message is required")
});

const itineraryDaySchema = z.object({
  day:        z.number(),
  location:   z.string(),
  activity:   z.string(),
  hotelName:  z.string(),
  hotelStars: z.number()
});

const packageInquirySchema = z.object({
  type:                  z.literal("package"),
  name:                  z.string().min(1),
  email:                 z.string().email(),
  phone:                 z.string().min(1),
  teamName:              z.string().optional(),
  preferredPackage:      z.string().min(1),
  packageId:             z.number(),
  opponentLevel:         z.string().min(1),
  cities:                z.array(z.string()).min(1),
  hotelStars:            z.union([z.literal(3), z.literal(4), z.literal(5)]),
  travelStart:           z.string().min(1),
  travelEnd:             z.string().optional(),
  generatedItinerary:    z.array(itineraryDaySchema).min(1),
  referenceHotelsShown:  z.array(z.object({ city: z.string(), name: z.string(), stars: z.number() })),
  generationSource:      z.enum(["llm", "template"]).optional()
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
      (d) => `Day ${d.day} | ${d.location} | ${d.activity} | Hotel: ${d.hotelName} (${d.hotelStars}★)`
    ),
    "",
    "--- JSON ---",
    JSON.stringify(data, null, 2)
  ];
  return lines.join("\n");
}

export async function POST(request: Request) {
  let body: unknown;

  // 1. Parse JSON
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  // 2. Package inquiry path
  if ((body as Record<string, unknown>)?.type === "package") {
    let data: z.infer<typeof packageInquirySchema>;
    try {
      data = packageInquirySchema.parse(body);
    } catch (err) {
      const msg = err instanceof ZodError ? err.errors.map((e) => e.message).join(", ") : String(err);
      console.error("[inquiry/package] Validation failed:", msg);
      return NextResponse.json({ error: `Validation error: ${msg}` }, { status: 400 });
    }

    const message = buildPackageMessage(data);

    try {
      await db.inquiry.create({
        data: {
          name:             data.name,
          email:            data.email,
          phone:            data.phone,
          teamName:         data.teamName ?? null,
          preferredPackage: data.preferredPackage,
          message
        }
      });
    } catch (dbErr) {
      console.error("[inquiry/package] DB error:", dbErr);
      return NextResponse.json({ error: "Could not save inquiry. Please try again." }, { status: 500 });
    }

    try {
      await sendPackageInquiryEmail({
        name: data.name, email: data.email, phone: data.phone,
        teamName: data.teamName, preferredPackage: data.preferredPackage,
        opponentLevel: data.opponentLevel, cities: data.cities,
        hotelStars: data.hotelStars, travelStart: data.travelStart,
        travelEnd: data.travelEnd, generatedItinerary: data.generatedItinerary,
        referenceHotelsShown: data.referenceHotelsShown,
        generationSource: data.generationSource, message
      });
    } catch (emailErr) {
      console.error("[inquiry/package] Email failed:", emailErr);
      return NextResponse.json(
        { error: "Inquiry saved but email could not be sent. We still received your message." },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true });
  }

  // 3. Contact form path
  let data: z.infer<typeof contactInquirySchema>;
  try {
    data = contactInquirySchema.parse(body);
  } catch (err) {
    const msg = err instanceof ZodError ? err.errors.map((e) => e.message).join(", ") : String(err);
    console.error("[inquiry/contact] Validation failed:", msg, "| body:", JSON.stringify(body));
    return NextResponse.json({ error: `Validation error: ${msg}` }, { status: 400 });
  }

  try {
    await db.inquiry.create({
      data: {
        name:             data.name,
        email:            data.email,
        phone:            data.phone,
        teamName:         null,
        preferredPackage: null,
        message:          data.message
      }
    });
  } catch (dbErr) {
    console.error("[inquiry/contact] DB error:", dbErr);
    return NextResponse.json({ error: "Could not save your message. Please try again." }, { status: 500 });
  }

  try {
    await sendInquiryEmail(data);
  } catch (emailErr) {
    console.error("[inquiry/contact] Email failed:", emailErr);
    return NextResponse.json(
      { error: "Message received but email notification failed. We still got your message." },
      { status: 500 }
    );
  }

  return NextResponse.json({ ok: true });
}
