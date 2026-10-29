import { execSync } from "node:child_process";
import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const root = import.meta.dirname;

/** The sha the page was built from (+ "-dirty" when the tree has changes, so the marker never claims a commit it is not). */
function releaseSha(): string {
  const fromEnv = (process.env.RELEASE_SHA || "").trim();
  if (fromEnv) return fromEnv;
  try {
    const run = (cmd: string) => execSync(cmd, { cwd: root, encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] }).trim();
    return run("git rev-parse HEAD") + (run("git status --porcelain --untracked-files=no") ? "-dirty" : "");
  } catch {
    return "unknown";
  }
}

/** `<meta name="release">` of index.html (K3 L9): the deploy script reads it back from the live address. */
function releaseMeta(sha: string): Plugin {
  return { name: "algo-release-meta", transformIndexHtml: (html) => html.replaceAll("__RELEASE__", sha) };
}

export default defineConfig(({ command, mode }) => {
  // .env.stage / .env.prod hold the public build settings (VITE_APP_URL, VITE_TURNSTILE_SITE_KEY), see .env.example.
  const env = loadEnv(mode, root, "VITE_");
  if (command === "build") {
    // A build must say which product «Войти» leads to: a silent default would put the prod address on a stage page.
    const appUrl = (env.VITE_APP_URL || "").trim();
    if (!/^https:\/\/[a-z0-9.-]+$/i.test(appUrl) && !/^http:\/\/localhost(:\d+)?$/.test(appUrl)) {
      throw new Error(`VITE_APP_URL is missing or not an origin (got "${appUrl}"): build with --mode prod or --mode stage.`);
    }
  }
  return {
    plugins: [react(), tailwindcss(), releaseMeta(releaseSha())],
    resolve: {
      alias: {
        "@": path.resolve(root, "client", "src"),
        "@assets": path.resolve(root, "attached_assets"),
      },
    },
    css: { postcss: { plugins: [] } },
    root: path.resolve(root, "client"),
    envDir: root,
    build: {
      outDir: path.resolve(root, "dist/public"),
      emptyOutDir: true,
    },
    server: {
      host: "0.0.0.0",
      allowedHosts: true,
      fs: { strict: true, deny: ["**/.*"] },
    },
  };
});
