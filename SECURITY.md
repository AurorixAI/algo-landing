# Защита публичного лендинга ALGO

Лендинг — чистая статика (`vite build`). Express-слой, `/api/contact`, Netlify/Vercel-функции удалены (K3 L2). Форма заявки ходит на `/api/v1/public/demo-requests` того же адреса; nginx проксирует `/api/v1/public/` в auth-сервис (K3 I4). Honeypot, Turnstile и лимиты проверяет auth (`K3_API.md`, §1.1), не лендинг.

Всё, что раньше делал Express и `netlify.toml`, переезжает в nginx (K3 I5). Ниже — точные значения для конфига.

## Заголовки ответа (все пути лендинга)

| Заголовок | Значение |
|---|---|
| `Content-Security-Policy` | см. ниже |
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=(), usb=()` |
| `Cross-Origin-Opener-Policy` | `same-origin` |
| `Cross-Origin-Resource-Policy` | `same-origin` |
| `Strict-Transport-Security` | `max-age=31536000` (без `includeSubDomains` и `preload`) |

CSP (одна строка; хеш — sha256 встроенного JSON-LD из `client/index.html`):

```
default-src 'self'; script-src 'self' 'sha256-4aGtvtcALQgeHnlSqbuF2OnJMzibRdE21wZJyYZkEuY=' https://challenges.cloudflare.com; script-src-attr 'none'; style-src 'self' 'unsafe-inline'; font-src 'self'; img-src 'self' data: blob:; connect-src 'self' https://challenges.cloudflare.com; frame-src https://challenges.cloudflare.com; frame-ancestors 'none'; object-src 'none'; base-uri 'none'; form-action 'self'; manifest-src 'self'; media-src 'self'; worker-src 'none'
```

Хеш считается по содержимому блока `<script type="application/ld+json">` вместе с пробелами. Любая правка блока меняет хеш: тест `client/src/seo.test.ts` падает, пока не обновлены константа в тесте, строка выше и CSP в nginx. Пересчёт:

```js
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const html = readFileSync("dist/public/index.html", "utf8");
for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) console.log("sha256-" + createHash("sha256").update(match[1]).digest("base64"));
}
```

Скрипт выкладки `deploy/deploy_landing.sh` печатает этот хеш при каждой сборке.

## Кэш

`index.html` — `Cache-Control: no-cache`; `/assets/*` — `public, max-age=31536000, immutable` (имена с хешем); `robots.txt`, `sitemap.xml` — `public, max-age=3600, must-revalidate`. SPA-фолбэк на `index.html` — только для путей без точки и не для `/api/`.

## ИИ-боты

`client/public/robots.txt` закрывает обход перечисленным токенам. Это политика для тех, кто её соблюдает; nginx дополнительно отвечает 403 по заявленному User-Agent (`map $http_user_agent`, без учёта регистра, по границам слов):

`GPTBot`, `OAI-SearchBot`, `ChatGPT-User`, `ClaudeBot`, `Claude-User`, `Claude-SearchBot`, `CCBot`, `PerplexityBot`, `Perplexity-User`, `Bytespider`.

`Google-Extended` в списке нет: это токен robots.txt, а не User-Agent. Подмену User-Agent такой фильтр не ловит; реальное ограничение — WAF на внешнем периметре.

## Turnstile

`VITE_TURNSTILE_SITE_KEY` — публичный ключ сборки (`.env.prod`, `.env.stage`); секрет и `TURNSTILE_HOSTNAMES` (`algolab.me,www.algolab.me` / `landing.stage.algolab.me,stage.algolab.me`) живут только в auth. Виджет и скрипт `challenges.cloudflare.com` разрешены CSP выше.

## Что остаётся на внешнем периметре

Cloudflare/WAF для ИИ-краулеров и лимит POST на `/api/v1/public/demo-requests` на уровне nginx (`limit_req`) — отдельные задачи инфраструктуры; здесь они не настраиваются.
