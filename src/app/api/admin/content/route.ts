import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  type: z.enum(["section", "topicTile", "package", "faq", "testimonial", "gallery", "settings"]),
  id: z.number().optional(),
  create: z.boolean().optional(),
  key: z.string().optional(),
  payload: z.record(z.any())
});

const packageCreatePayload = z.object({
  title: z.string().min(1),
  duration: z.string(),
  inclusions: z.string(),
  pricingNote: z.string(),
  imageUrl: z.union([z.string(), z.null()]).optional(),
  sortOrder: z.coerce.number().int().optional()
});

const faqCreatePayload = z.object({
  question: z.string().min(1),
  answer: z.string().min(1),
  sortOrder: z.coerce.number().int().optional()
});

const testimonialCreatePayload = z.object({
  name: z.string().min(1),
  team: z.string(),
  quote: z.string().min(1),
  imageUrl: z.union([z.string(), z.null()]).optional(),
  sortOrder: z.coerce.number().int().optional()
});

const galleryCreatePayload = z.object({
  imageUrl: z.string().min(1),
  caption: z.string(),
  sortOrder: z.coerce.number().int().optional()
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
  } else if (data.type === "package" && data.create) {
    const parsed = packageCreatePayload.safeParse(data.payload);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.title?.[0] || "Invalid package fields";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const p = parsed.data;
    const maxSort = await db.package.aggregate({ _max: { sortOrder: true } });
    const sortOrder = p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;
    const created = await db.package.create({
      data: {
        title: p.title,
        duration: p.duration,
        inclusions: p.inclusions,
        pricingNote: p.pricingNote,
        imageUrl: p.imageUrl ?? null,
        sortOrder
      }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } else if (data.type === "faq" && data.create) {
    const parsed = faqCreatePayload.safeParse(data.payload);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.question?.[0] || "Invalid FAQ fields";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const p = parsed.data;
    const maxSort = await db.faqItem.aggregate({ _max: { sortOrder: true } });
    const sortOrder = p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;
    const created = await db.faqItem.create({
      data: { question: p.question, answer: p.answer, sortOrder }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } else if (data.type === "testimonial" && data.create) {
    const parsed = testimonialCreatePayload.safeParse(data.payload);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.name?.[0] || "Invalid testimonial fields";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const p = parsed.data;
    const maxSort = await db.testimonial.aggregate({ _max: { sortOrder: true } });
    const sortOrder = p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;
    const created = await db.testimonial.create({
      data: {
        name: p.name,
        team: p.team,
        quote: p.quote,
        imageUrl: p.imageUrl ?? null,
        sortOrder
      }
    });
    return NextResponse.json({ ok: true, id: created.id });
  } else if (data.type === "gallery" && data.create) {
    const parsed = galleryCreatePayload.safeParse(data.payload);
    if (!parsed.success) {
      const msg = parsed.error.flatten().fieldErrors.imageUrl?.[0] || "Invalid gallery fields";
      return NextResponse.json({ error: msg }, { status: 400 });
    }
    const p = parsed.data;
    const maxSort = await db.galleryItem.aggregate({ _max: { sortOrder: true } });
    const sortOrder = p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1;
    const created = await db.galleryItem.create({
      data: { imageUrl: p.imageUrl, caption: p.caption, sortOrder }
    });
    return NextResponse.json({ ok: true, id: created.id });
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
