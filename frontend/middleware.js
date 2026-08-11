import { NextResponse } from "next/server";
import { decodeRoute, encodeRoute } from "@/lib/routeEncoder";

export function middleware(req) {
  const { pathname, search } = req.nextUrl;

  // 0. If this is an internal rewrite request created by our middleware, pass through directly
  if (req.headers.get("x-route-encoded") === "1") {
    return NextResponse.next();
  }

  // Bypass internals, static assets, images, API routes
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api/") ||
    pathname === "/favicon.ico" ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml" ||
    pathname.match(/\.(png|jpg|jpeg|svg|webp|ico|css|js|map|json|txt|pdf|woff|woff2)$/)
  ) {
    return NextResponse.next();
  }

  // 1. Encoded path handling: /_e/<encodedSlug>
  if (pathname.startsWith("/_e/")) {
    const encodedSegment = pathname.slice(4);
    if (!encodedSegment) {
      return NextResponse.redirect(new URL("/", req.url));
    }

    const decodedPath = decodeRoute(encodedSegment);
    
    if (decodedPath && decodedPath !== "/" && !decodedPath.startsWith("/_e/")) {
      const targetUrl = new URL(`${decodedPath}${search}`, req.url);
      const requestHeaders = new Headers(req.headers);
      requestHeaders.set("x-route-encoded", "1");

      return NextResponse.rewrite(targetUrl, {
        request: {
          headers: requestHeaders,
        },
      });
    }
    return NextResponse.next();
  }

  // 2. Allow home page "/" directly
  if (pathname === "/") {
    return NextResponse.next();
  }

  // 3. Automatically redirect any direct unencoded route access to its /_e/... encoded URL
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
