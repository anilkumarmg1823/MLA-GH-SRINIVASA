import { NextResponse } from "next/server";
import { encodeRoute } from "@/lib/routeEncoder";

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // Bypass internals, static assets, images, API routes, and /e/ encoded paths
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname.startsWith("/e/") ||
    pathname === "/" ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|map|json|txt|pdf|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // Automatically redirect any direct unencoded route access to its /e/... encoded URL
  const encodedPath = encodeRoute(pathname);
  if (encodedPath && encodedPath !== pathname) {
    const redirectUrl = new URL(`${encodedPath}${search}`, req.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};

export default middleware;
