import { NextResponse } from "next/server";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const updateSchema = z.object({
  type: z.enum(["section", "topicTile", "package", "faq", "testimonial", "gallery", "settings", "gallerySection"]),
  id: z.number().optional(),
  create: z.boolean().optional(),
  delete: z.boolean().optional(),
  key: z.string().optional(),
  payload: z.record(z.any()).default({})
});

const packageItinerarySchema = z.object({
  summary: z.string(),
  days: z.array(
    z.object({ day: z.number(), location: z.string(), activity: z.string() })
  )
});

const packageCreatePayload = z.object({
  title: z.string().min(1),
  duration: z.string(),
  inclusions: z.string(),
  pricingNote: z.string(),
  imageUrl: z.union([z.string(), z.null()]).optional(),
  itineraryJson: z.union([packageItinerarySchema, z.null()]).optional(),
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
  sectionId: z.number().int(),
  imageUrl: z.string().min(1),
  caption: z.string(),
  sortOrder: z.coerce.number().int().optional()
});

const gallerySectionCreatePayload = z.object({
  title: z.string().min(1),
  sortOrder: z.coerce.number().int().optional()
});

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const data = updateSchema.parse(body);

  // ── Deletes ──────────────────────────────────────────────────────────────
  if (data.delete && data.id) {
    if (data.type === "gallery") {
      await db.galleryItem.delete({ where: { id: data.id } });
    } else if (data.type === "gallerySection") {
      await db.galleryItem.deleteMany({ where: { sectionId: data.id } });
      await db.gallerySection.delete({ where: { id: data.id } });
    } else if (data.type === "package") {
      await db.package.delete({ where: { id: data.id } });
    } else if (data.type === "faq") {
      await db.faqItem.delete({ where: { id: data.id } });
    } else if (data.type === "testimonial") {
      await db.testimonial.delete({ where: { id: data.id } });
    }
    return NextResponse.json({ ok: true });
  }

  // ── Creates ──────────────────────────────────────────────────────────────
  if (data.type === "gallerySection" && data.create) {
    const count = await db.gallerySection.count();
    if (count >= 2) return NextResponse.json({ error: "Maximum of 2 gallery sections allowed" }, { status: 400 });
    const parsed = gallerySectionCreatePayload.safeParse(data.payload);
    if (!parsed.success) return NextResponse.json({ error: "Invalid section fields" }, { status: 400 });
    const maxSort = await db.gallerySection.aggregate({ _max: { sortOrder: true } });
    const created = await db.gallerySection.create({
      data: { title: parsed.data.title, sortOrder: parsed.data.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1 }
    });
    return NextResponse.json({ ok: true, id: created.id });
  }

  if (data.type === "gallery" && data.create) {
    const parsed = galleryCreatePayload.safeParse(data.payload);
    if (!parsed.success) return NextResponse.json({ error: "Invalid gallery fields" }, { status: 400 });
    const p = parsed.data;
    const count = await db.galleryItem.count({ where: { sectionId: p.sectionId } });
    if (count >= 10) return NextResponse.json({ error: "Maximum of 10 images per section" }, { status: 400 });
    const maxSort = await db.galleryItem.aggregate({ _max: { sortOrder: true }, where: { sectionId: p.sectionId } });
    const created = await db.galleryItem.create({
      data: { sectionId: p.sectionId, imageUrl: p.imageUrl, caption: p.caption, sortOrder: p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1 }
    });
    return NextResponse.json({ ok: true, id: created.id });
  }

  if (data.type === "package" && data.create) {
    const parsed = packageCreatePayload.safeParse(data.payload);
    if (!parsed.success) return NextResponse.json({ error: parsed.error.flatten().fieldErrors.title?.[0] || "Invalid package fields" }, { status: 400 });
    const p = parsed.data;
    const maxSort = await db.package.aggregate({ _max: { sortOrder: true } });
    const created = await db.package.create({
      data: { title: p.title, duration: p.duration, inclusions: p.inclusions, pricingNote: p.pricingNote, imageUrl: p.imageUrl ?? null, itineraryJson: p.itineraryJson ?? Prisma.DbNull, sortOrder: p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1 }
    });
    return NextResponse.json({ ok: true, id: created.id });
  }

  if (data.type === "faq" && data.create) {
    const parsed = faqCreatePayload.safeParse(data.payload);
    if (!parsed.success) return NextResponse.json({ error: "Invalid FAQ fields" }, { status: 400 });
    const p = parsed.data;
    const maxSort = await db.faqItem.aggregate({ _max: { sortOrder: true } });
    const created = await db.faqItem.create({ data: { question: p.question, answer: p.answer, sortOrder: p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1 } });
    return NextResponse.json({ ok: true, id: created.id });
  }

  if (data.type === "testimonial" && data.create) {
    const parsed = testimonialCreatePayload.safeParse(data.payload);
    if (!parsed.success) return NextResponse.json({ error: "Invalid testimonial fields" }, { status: 400 });
    const p = parsed.data;
    const maxSort = await db.testimonial.aggregate({ _max: { sortOrder: true } });
    const created = await db.testimonial.create({ data: { name: p.name, team: p.team, quote: p.quote, imageUrl: p.imageUrl ?? null, sortOrder: p.sortOrder ?? (maxSort._max.sortOrder ?? 0) + 1 } });
    return NextResponse.json({ ok: true, id: created.id });
  }

  // ── Updates ──────────────────────────────────────────────────────────────
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
  } else if (data.type === "gallerySection" && data.id) {
    await db.gallerySection.update({ where: { id: data.id }, data: data.payload });
  } else if (data.type === "settings") {
    await db.siteSettings.update({ where: { id: 1 }, data: data.payload });
  } else {
    return NextResponse.json({ error: "Invalid target" }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
