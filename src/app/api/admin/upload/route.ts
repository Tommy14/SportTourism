import { NextResponse } from "next/server";
import { requireSession } from "@/lib/auth";
import { uploadImage } from "@/lib/supabase";

export async function POST(request: Request) {
  const session = await requireSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Could not parse form data" }, { status: 400 });
  }

  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  try {
    const url = await uploadImage(file, "site");
    return NextResponse.json({ url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Upload failed";
    console.error("[upload] Supabase upload error:", message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
