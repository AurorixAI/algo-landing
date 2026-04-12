import type { Express } from "express";
import { type Server } from "http";

const CONTACT_EMAIL = process.env.CONTACT_EMAIL || "aurorixai@gmail.com";
const RESEND_API_KEY = process.env.RESEND_API_KEY;

export async function registerRoutes(
  httpServer: Server,
  app: Express
): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    const { name, email, message, type } = req.body || {};

    if (!name || typeof name !== "string" || name.length > 200) {
      return res.status(400).json({ error: "Invalid name" });
    }
    if (!email || typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 320) {
      return res.status(400).json({ error: "Invalid email" });
    }
    if (message && (typeof message !== "string" || message.length > 2000)) {
      return res.status(400).json({ error: "Invalid message" });
    }
    if (!type || !["demo", "pitchDeck", "connect"].includes(type)) {
      return res.status(400).json({ error: "Invalid type" });
    }

    const typeLabels: Record<string, string> = {
      demo: "Демо для школ",
      pitchDeck: "Запрос Pitch Deck",
      connect: "Подключение центра",
    };

    const sanitize = (s: string) => s.replace(/[<>&"']/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;", "'": "&#39;" }[c] || c));

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
      return res.status(200).json({ ok: true, note: "Logged (no API key)" });
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
        console.error("[contact] Resend error:", await response.text());
        return res.status(500).json({ error: "Failed to send email" });
      }

      return res.status(200).json({ ok: true });
    } catch (err) {
      console.error("[contact] Error:", err);
      return res.status(500).json({ error: "Internal server error" });
    }
  });

  return httpServer;
}
