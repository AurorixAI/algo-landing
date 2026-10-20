// Keep the production values in netlify.toml and vercel.json in sync.
// This hash permits only the JSON-LD block in client/index.html, including whitespace.
const organizationSchemaHash = "'sha256-6TT5IzTJ0TenjWWHmfIPvh+3/Z1DKMJUgoDF+AAQqXY='";

export const productionContentSecurityPolicy = [
  "default-src 'self'",
  `script-src 'self' ${organizationSchemaHash} https://challenges.cloudflare.com`,
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline'",
  "font-src 'self'",
  "img-src 'self' data: blob:",
  "connect-src 'self' https://challenges.cloudflare.com",
  "frame-src https://challenges.cloudflare.com",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'none'",
  "form-action 'self'",
  "manifest-src 'self'",
  "media-src 'self'",
  "worker-src 'none'",
].join("; ");

export function securityHeaders(production: boolean): Record<string, string> {
  const headers: Record<string, string> = {
    "X-Content-Type-Options": "nosniff",
    "Referrer-Policy": "strict-origin-when-cross-origin",
    "Permissions-Policy": "camera=(), microphone=(), geolocation=(), payment=(), usb=()",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-origin",
  };

  if (production) {
    headers["Content-Security-Policy"] = productionContentSecurityPolicy;
    headers["X-Frame-Options"] = "DENY";
  }

  // HSTS belongs at the HTTPS deployment edge, not at an HTTP development server.
  return headers;
}
