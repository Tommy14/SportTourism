import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sendInquiryEmail } from "@/lib/email";

const inquirySchema = z.object({
  name: z.string().min(2),
  email: z.string().email(),
  phone: z.string().optional(),
  teamName: z.string().optional(),
  preferredPackage: z.string().optional(),
  message: z.string().min(10)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const data = inquirySchema.parse(body);

    await db.inquiry.create({
      data: {
        name: data.name,
        email: data.email,
        phone: data.phone,
        teamName: data.teamName,
        preferredPackage: data.preferredPackage,
        message: data.message
      }
    });

    await sendInquiryEmail(data);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json({ error: "Invalid request", details: String(error) }, { status: 400 });
  }
}
