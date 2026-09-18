import { NextRequest, NextResponse } from "next/server";
import { agencySlugFromHost } from "@/lib/tenant";

export function middleware(request: NextRequest) {
  const slug = agencySlugFromHost(request.headers.get("host") || "");
  const response = NextResponse.next();
  if (slug) {
    response.headers.set("x-agency-slug", slug);
    response.cookies.set("agency_slug", slug, { path: "/" });
  }
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
