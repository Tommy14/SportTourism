import { NextResponse } from "next/server";
import { clearSession } from "@/lib/auth";

export async function POST(request: Request) {
  await clearSession();
  const host  = request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "pitchtoparadise.com";
  const proto = request.headers.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return NextResponse.redirect(`${proto}://${host}/`, { status: 303 });
}
