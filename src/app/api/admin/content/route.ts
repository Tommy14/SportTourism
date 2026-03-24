import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  type: z.enum(["section", "topicTile", "package", "faq", "testimonial", "gallery", "settings"]),
  id: z.number().optional(),
  key: z.string().optional(),
  payload: z.record(z.any())
});

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data = updateSchema.parse(body);

  if (data.type === "section" && data.key) {
    await db.sectionContent.update({ where: { key: data.key }, data: data.payload });
  } else if (data.type === "topicTile" && data.id) {
    await db.topicTile.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "package" && data.id) {
    await db.package.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "faq" && data.id) {
    await db.faqItem.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "testimonial" && data.id) {
    await db.testimonial.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "gallery" && data.id) {
    await db.galleryItem.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "settings") {
    await db.siteSettings.update({ where: { id: 1 }, data: data.payload });
  } else {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
