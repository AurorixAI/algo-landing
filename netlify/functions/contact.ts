import type { Handler } from "@netlify/functions";
import { CONTACT_MAX_BODY_BYTES, ContactBodyError, createContactHandler, type ContactDependencies } from "../../shared/contact";

export function createNetlifyContactHandler(dependencies: ContactDependencies = {}): Handler {
  const contact = createContactHandler(dependencies);
  return async (event) => {
    const result = await contact({
      method: event.httpMethod,
      headers: event.headers,
      // Netlify sets this header from the connecting client, unlike arbitrary X-Forwarded-For.
      clientIp: process.env.NETLIFY === "true" ? event.headers["x-nf-client-connection-ip"] : undefined,
      readBody: async () => {
        // Bound allocation before decoding a base64 body.
        if (event.body && event.body.length > (event.isBase64Encoded ? Math.ceil(CONTACT_MAX_BODY_BYTES / 3) * 4 : CONTACT_MAX_BODY_BYTES)) throw new ContactBodyError(413);
        const bytes = Buffer.from(event.body || "", event.isBase64Encoded ? "base64" : "utf8");
        if (bytes.byteLength > CONTACT_MAX_BODY_BYTES) throw new ContactBodyError(413);
        return bytes;
      },
    });
    return { statusCode: result.status, headers: result.headers, body: JSON.stringify(result.body) };
  };
}

export const handler = createNetlifyContactHandler();
