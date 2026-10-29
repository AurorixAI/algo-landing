/** Build-time settings (only VITE_ values are public).  See .env.example; vite.config.ts refuses a build without VITE_APP_URL. */
export const APP_URL: string = (import.meta.env.VITE_APP_URL || "").trim().replace(/\/+$/, "");
/** «Войти»: the product's login page (stage build -> stage product, prod build -> app.algolab.me). */
export const LOGIN_URL = `${APP_URL}/login`;
export const TURNSTILE_SITE_KEY: string = (import.meta.env.VITE_TURNSTILE_SITE_KEY || "").trim();
