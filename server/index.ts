import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { serveStatic } from "./static";
import { createServer } from "http";
import { securityHeaders } from "../shared/security-headers";
import { isKnownAIBot } from "../shared/bot-policy";

const app = express();
const httpServer = createServer(app);
app.disable("x-powered-by");
app.set("trust proxy", false);
app.use((req, res, next) => {
  res.set(securityHeaders(process.env.NODE_ENV === "production"));
  // Keep the policy readable; deny declared AI clients on all other routes.
  if (req.path !== "/robots.txt" && isKnownAIBot(req.get("user-agent") || "")) {
    return res.status(403).set({ "Cache-Control": "no-store", Vary: "User-Agent" }).type("text/plain").send("Automated AI access is not permitted.");
  }
  next();
});

export function log(message: string, source = "express") {
  const formattedTime = new Date().toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  console.log(`${formattedTime} [${source}] ${message}`);
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      log(`${req.method} ${path} ${res.statusCode} in ${duration}ms`);
    }
  });

  next();
});

(async () => {
  await registerRoutes(httpServer, app);

  app.use((err: any, _req: Request, res: Response, next: NextFunction) => {
    const suppliedStatus = Number(err.status || err.statusCode);
    const status = [400, 413, 415].includes(suppliedStatus) ? suppliedStatus : 500;
    // Parser/provider errors may contain the submitted body. Log only a safe status.
    console.error(`[express] Request failed (${status})`);

    if (res.headersSent) {
      return next(err);
    }

    return res.status(status).set("Cache-Control", "no-store").json({ error: status === 413 ? "payload_too_large" : "invalid_request" });
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (process.env.NODE_ENV === "production") {
    serveStatic(app);
  } else {
    const { setupVite } = await import("./vite");
    await setupVite(httpServer, app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || "5050", 10);
  httpServer.listen(
    {
      port,
      host: "0.0.0.0",
    },
    () => {
      log(`serving on port ${port}`);
    },
  );
})();
