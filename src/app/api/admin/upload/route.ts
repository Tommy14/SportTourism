import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { uploadImage } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const url = await uploadImage(file, "site");
  return NextResponse.json({ url });
}
