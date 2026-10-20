/** Declared AI crawler/fetcher tokens, checked against the providers' public docs.
 * This is an inexpensive policy backstop, not proof of a client's real identity.
 * Google-Extended is deliberately absent: it is a robots control token, not an HTTP UA.
 */
export const KNOWN_AI_BOT_TOKENS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "CCBot",
  "PerplexityBot",
  "Perplexity-User",
  "Bytespider",
] as const;

const knownAiBot = new RegExp(`\\b(?:${KNOWN_AI_BOT_TOKENS.join("|")})\\b`, "i");

export function isKnownAIBot(userAgent: string): boolean {
  return knownAiBot.test(userAgent);
}
