/**
 * Universal Route Encoder / Obfuscator for Next.js App Router
 * Safely encodes application paths to base64 URL-safe strings under /_e/
 */

/**
 * Encodes a clean path (e.g. /medical-referral, /login, /dashboard/development) into URL-safe base64
 */
export function encodeRoute(path) {
  if (!path) return "/";
  
  // Return as-is for home page, already encoded paths, API endpoints, or assets
  if (
    path === "/" ||
    path.startsWith("/_e/") ||
    path.startsWith("/api/") ||
    path.startsWith("/_next/") ||
    path.startsWith("http://") ||
    path.startsWith("https://") ||
    path.startsWith("#") ||
    path.startsWith("mailto:") ||
    path.startsWith("tel:")
  ) {
    return path;
  }

  // Remove trailing slash if present (except root)
  const cleanPath = path.length > 1 && path.endsWith("/") ? path.slice(0, -1) : path;

  try {
    const b64 = typeof window !== "undefined"
      ? btoa(cleanPath)
      : Buffer.from(cleanPath).toString("base64");
    
    // URL-safe Base64: replace '+' with '-', '/' with '_', remove '=' padding
    const urlSafe = b64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
    return `/_e/${urlSafe}`;
  } catch (err) {
    return path;
  }
}

/**
 * Decodes a URL-safe base64 segment back to original route path (e.g. L2xvZ2lu -> /login)
 */
export function decodeRoute(encodedSegment) {
  if (!encodedSegment) return "/";
  let slug = Array.isArray(encodedSegment) ? encodedSegment.join("/") : encodedSegment;
  
  if (slug.startsWith("_e/")) slug = slug.slice(3);
  if (slug.startsWith("/")) slug = slug.slice(1);

  if (!slug) return "/";

  // Re-add Base64 padding and restore standard base64 characters
  let b64 = slug.replace(/-/g, "+").replace(/_/g, "/");
  while (b64.length % 4 !== 0) {
    b64 += "=";
  }

  try {
    const decoded = typeof window !== "undefined"
      ? atob(b64)
      : Buffer.from(b64, "base64").toString("utf-8");
    
    if (decoded.startsWith("/")) return decoded;
    return `/${decoded}`;
  } catch (err) {
    return "/";
  }
}

/**
 * Checks if current pathname (encoded or raw) matches a target raw route path
 */
export function isRouteActive(currentPathname, targetRawRoute, exact = false) {
  if (!currentPathname) return false;
  
  let decodedCurrent = currentPathname;
  if (currentPathname.startsWith("/_e/")) {
    const slug = currentPathname.slice(4);
    decodedCurrent = decodeRoute(slug);
  }

  if (exact) {
    return decodedCurrent === targetRawRoute;
  }
  return decodedCurrent === targetRawRoute || decodedCurrent.startsWith(`${targetRawRoute}/`);
}
