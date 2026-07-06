import { NextResponse } from "next/server";
import { z } from "zod";
import { requireSession } from "@/lib/auth";
import { db } from "@/lib/db";

const patchSchema = z.object({
  id: z.string().min(1),
  alt: z.string()
});

const deleteSchema = z.object({
  id: z.string().min(1)
});

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id, alt } = patchSchema.parse(body);

  await db.mediaFile.update({
    where: { id },
    data: { alt: alt.trim() || null }
  });

  return NextResponse.json({ ok: true });
}

export async function DELETE(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { id } = deleteSchema.parse(body);

  await db.mediaFile.delete({ where: { id } });

  return NextResponse.json({ ok: true });
}
