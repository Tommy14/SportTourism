import { NextRequest, NextResponse } from "next/server";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/portal") || pathname.startsWith("/portal/login")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("portal_session")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/portal/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/portal/:path*"]
};
