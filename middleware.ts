import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const country = request.headers.get("x-vercel-ip-country") || "US";
  const city = request.headers.get("x-vercel-ip-city") || "";
  const response = NextResponse.next();
  response.headers.set("x-country", country);
  response.headers.set("x-city", city);
  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|images|downloads).*)"],
};
