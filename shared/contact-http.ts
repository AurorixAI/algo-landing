import { CONTACT_BODY_TIMEOUT_MS, CONTACT_MAX_BODY_BYTES, ContactBodyError } from "./contact";

/** Read original bytes: whitespace and UTF-8 also count towards the cap. */
export async function readContactWebBody(request: Request, timeoutMs = CONTACT_BODY_TIMEOUT_MS): Promise<Uint8Array> {
  if (!request.body) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let size = 0;
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_resolve, reject) => {
    timer = setTimeout(() => { reject(new ContactBodyError(400)); void reader.cancel().catch(() => {}); }, timeoutMs);
  });
  try {
    while (true) {
      const { done, value } = await Promise.race([reader.read(), timeout]);
      if (done) break;
      size += value.byteLength;
      if (size > CONTACT_MAX_BODY_BYTES) { void reader.cancel().catch(() => {}); throw new ContactBodyError(413); }
      chunks.push(value);
    }
    const bytes = new Uint8Array(size);
    let offset = 0;
    for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
    return bytes;
  } finally { clearTimeout(timer); reader.releaseLock(); }
}
