import { createContactHandler, type ContactDependencies } from "../shared/contact";
import { readContactWebBody } from "../shared/contact-http";

/** Vercel Web Handlers preserve the original body stream for the byte limit. */
export function createVercelContactHandler(dependencies: ContactDependencies = {}) {
  const contact = createContactHandler(dependencies);
  return async (request: Request): Promise<Response> => {
    const result = await contact({
      method: request.method,
      headers: Object.fromEntries(request.headers.entries()),
      // Vercel overwrites this platform header. It is not trusted outside that runtime.
      clientIp: process.env.VERCEL === "1" ? request.headers.get("x-vercel-forwarded-for") ?? undefined : undefined,
      readBody: () => readContactWebBody(request, dependencies.bodyTimeoutMs),
    });
    return new Response(JSON.stringify(result.body), { status: result.status, headers: result.headers });
  };
}

const handle = createVercelContactHandler();
export { handle as POST, handle as GET, handle as HEAD, handle as OPTIONS, handle as PUT, handle as PATCH, handle as DELETE };
