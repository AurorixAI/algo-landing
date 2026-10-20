import { isKnownAIBot } from "../../shared/bot-policy.ts";

/** Returning undefined continues Netlify's request chain without changing caching. */
export default function aiPolicy(request: Request): Response | undefined {
  // Leave the policy readable so compliant bots can discover it.
  if (new URL(request.url).pathname === "/robots.txt") return;
  if (!isKnownAIBot(request.headers.get("user-agent") || "")) return;
  return new Response("Automated AI access is restricted.", {
    status: 403,
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}

export const config = { path: "/*", excludedPath: "/robots.txt" };
