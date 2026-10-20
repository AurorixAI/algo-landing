import express, { type Express, type RequestHandler, type ErrorRequestHandler } from "express";
import { type Server } from "http";
import { CONTACT_BODY_TIMEOUT_MS, CONTACT_MAX_BODY_BYTES, contactError, createContactHandler, type ContactDependencies, type ContactResult } from "../shared/contact";

export async function registerRoutes(httpServer: Server, app: Express, dependencies: ContactDependencies = {}): Promise<Server> {
  const contact = createContactHandler(dependencies);
  const respond = (res: express.Response, result: ContactResult) => res.set(result.headers).status(result.status).json(result.body);
  const method: RequestHandler = (req, res, next) => req.method === "POST" ? next() : void respond(res, contactError(405, "method_not_allowed"));
  const bodyTimeout: RequestHandler = (req, res, next) => {
    const timer = setTimeout(() => {
      if (req.complete || res.headersSent) return;
      // Stop a slow body before the parser or challenge can hold a connection indefinitely.
      res.once("finish", () => req.destroy());
      res.set("Connection", "close");
      respond(res, contactError(408, "invalid_request"));
    }, dependencies.bodyTimeoutMs ?? CONTACT_BODY_TIMEOUT_MS);
    const clear = () => clearTimeout(timer);
    req.once("end", clear);
    req.once("aborted", clear);
    req.once("close", clear);
    res.once("finish", clear);
    next();
  };
  app.all("/api/contact", method, bodyTimeout, express.raw({ type: () => true, limit: CONTACT_MAX_BODY_BYTES, inflate: false }), async (req, res) => {
    const result = await contact({
      method: req.method,
      headers: req.headers,
      // Generic Express does not trust forwarded headers or an arbitrary proxy chain.
      clientIp: req.socket.remoteAddress,
      readBody: async () => Buffer.isBuffer(req.body) ? req.body : new Uint8Array(),
    });
    respond(res, result);
  });
  const bodyError: ErrorRequestHandler = (error, _req, res, _next) => {
    if (res.headersSent) return;
    const status = [400, 413, 415].includes(Number(error.status)) ? Number(error.status) : 500;
    respond(res, contactError(status, status === 413 ? "payload_too_large" : "invalid_request"));
  };
  app.use("/api/contact", bodyError);
  return httpServer;
}
