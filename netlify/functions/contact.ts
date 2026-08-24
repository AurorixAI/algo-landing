import type { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "aurorixai@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

const sanitize = (s: string) =>
  s.replace(/[<>&"']/g, (c) =>
    ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] || c)
  );

export const handler: Handler = async (event: HandlerEvent, _ctx: HandlerContext) => {
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, body: JSON.stringify({ error: "Method not allowed" }) };
  }

  let body: Record<string, unknown>;
  try {
    body = JSON.parse(event.body || "{}");
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid JSON" }) };
  }

  const { name, email, message, type } = body as Record<string, string>;

  if (!name || typeof name !== "string" || name.length > 200) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid name" }) };
  }
  if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid email" }) };
  }
  if (message && (typeof message !== "string" || message.length > 2000)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid message" }) };
  }
  if (!type || !["demo", "pitchDeck", "connect"].includes(type)) {
    return { statusCode: 400, body: JSON.stringify({ error: "Invalid type" }) };
  }

  const typeLabels: Record<string, string> = {
    demo: "Демо для школ",
    pitchDeck: "Запрос Pitch Deck",
    connect: "Подключение центра",
  };

  const htmlBody = `
    <h2>Новая заявка с лендинга ALGO</h2>
    <table style="border-collapse:collapse;width:100%;max-width:500px">
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Тип</td><td style="padding:8px;border:1px solid #e2e8f0">${sanitize(typeLabels[type] || type)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Имя</td><td style="padding:8px;border:1px solid #e2e8f0">${sanitize(name)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Email</td><td style="padding:8px;border:1px solid #e2e8f0">${sanitize(email)}</td></tr>
      <tr><td style="padding:8px;border:1px solid #e2e8f0;font-weight:bold">Сообщение</td><td style="padding:8px;border:1px solid #e2e8f0">${message ? sanitize(message) : "—"}</td></tr>
    </table>
  `;

  if (!RESEND_API_KEY) {
    console.log("[contact] No RESEND_API_KEY. Logged:", { name, email, type, message });
    return {
      statusCode: 200,
      body: JSON.stringify({ ok: true, note: "Logged (no API key)" }),
    };
  }

  try {
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: "ALGO Landing <onboarding@resend.dev>",
        to: [CONTACT_EMAIL],
        reply_to: email,
        subject: `[ALGO] ${typeLabels[type] || type} — ${name}`,
        html: htmlBody,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("[contact] Resend error:", err);
      return { statusCode: 502, body: JSON.stringify({ error: "Email delivery failed" }) };
    }

    return {
      statusCode: 200,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ok: true }),
    };
  } catch (err) {
    console.error("[contact] Unexpected error:", err);
    return { statusCode: 500, body: JSON.stringify({ error: "Internal server error" }) };
  }
};
