# Защита публичного лендинга ALGO

Область: публичный сайт и форма обращения. Это локальный кандидат от 18 октября 2026 года. Изменения в этом checkout не означают, что настройки опубликованы или что домен уже защищён Cloudflare.

## Политика обхода и поиск

`client/public/robots.txt` разрешает обычным поисковикам обход страниц и ресурсов. Закрыты служебные API и отдельно перечисленные GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-User, Claude-SearchBot, Google-Extended, CCBot, PerplexityBot, Perplexity-User и Bytespider. Googlebot, Bingbot и Yandex не внесены в запрет. Удаление сайта из поиска Google/Яндекса этой политикой не запрашивается. Запрет AI search означает, что видимость в ответах соответствующих ИИ-сервисов может уменьшиться.

Это политика для соблюдающих её клиентов, а не контроль доступа. По документации OpenAI и Perplexity, извлечение по запросу пользователя может не соблюдать `robots.txt`. Уже опубликованные копии и индексы этот файл не удаляет. Список требует обновления по мере появления новых агентов.

Дополнительно `shared/bot-policy.ts` распознаёт 10 соответствующих HTTP User-Agent tokens по границам слов без учёта регистра. Express guard и `netlify/edge-functions/ai-policy.ts` возвращают таким заявленным агентам 403 на страницы, ресурсы и API, оставляя `/robots.txt` читаемым. Google-Extended в HTTP-проверку не входит: отдельного клиента с этим User-Agent нет. Googlebot, Bingbot и Yandexbot matcher не блокирует. Netlify-функция охватывает `/*`, продолжает обычные запросы без изменения ответа и не кеширует отказ.

User-Agent легко подменить: агент с обычным browser User-Agent пройдёт этот базовый фильтр. Фильтр также не подтверждает подлинность Googlebot по его имени. Для распознавания такого обхода необходим внешний WAF/bot management; он ещё не настроен. При прямой статической публикации на Vercel в этой волне есть robots и headers, но нет UA guard для страниц: актуальная middleware использует отсутствующую зависимость `@vercel/functions`, поэтому непроверенная подмена протокола не добавлена. Для Vercel нужно отдельно подключить WAF или проверенную middleware-интеграцию перед заявлением об активной блокировке.

Google-Extended — отдельный токен управления использованием содержимого; Google указывает, что он не влияет на включение и позиции в Google Search. Нельзя блокировать Googlebot в firewall для реализации запрета Google-Extended: отдельного HTTP User-Agent Google-Extended нет. Сохранение обычного поиска также не гарантирует исключения страницы из всех ИИ-функций поисковых систем.

Публичный текст, который браузер показывает человеку, технически доступен для копирования, снимка экрана и извлечения. Запрет выделения, контекстного меню или клавиш не защищает содержимое и мешает посетителям, поэтому таких ограничений нет. Частные данные и внутренние материалы должны находиться за авторизацией в самой платформе и не попадать в сборку лендинга.

## Защита формы

Общий обработчик используется в Express, Netlify Functions и Vercel Functions. Защита формы реализуется сервером: ограниченный JSON-запрос, валидация полей, пустое поле-ловушка `website`, проверка Origin/Fetch Metadata, ограничения частоты и проверка токена Turnstile перед доставкой письма. Browser-проверка сама по себе не является доказательством: токен проверяется через Siteverify, включая hostname и action `contact`.

Настройки перечислены в `.env.example`. `VITE_TURNSTILE_SITE_KEY` — публичный ключ сборки. `TURNSTILE_SECRET_KEY` и ключ Resend хранятся только в секретах среды исполнения. Для рабочего домена нужны точные `CONTACT_ALLOWED_ORIGINS` и `TURNSTILE_EXPECTED_HOSTNAMES`; произвольный Host/Forwarded заголовок клиента не должен становиться доверенным origin или IP.

Без настройки доставки форма не должна сообщать об успешной отправке. Для production-доставки необходимы проверка Turnstile и разрешённые origins/hostnames. Отказ сервиса проверки не разрешает обход проверки. При локальной проверке реальные письма не отправляются.

Локальные счётчики действуют в пределах процесса/инстанса и сбрасываются при его перезапуске. Общий лимитер нескольких инстансов в этой волне не реализован: перед production нужен устойчивый лимит на периметре либо отдельное общее хранилище счётчиков. Эти меры не заменяют ограничение нагрузки перед приложением; распределённый поток запросов может обойти лимит на отдельный IP.

## Заголовки браузера

`shared/security-headers.ts` экспортирует `securityHeaders(production)` для Express. Значения production также заданы в `netlify.toml` и `vercel.json`. CSP ограничивает источники скриптов, шрифтов, запросов и iframe; запрещает плагины, inline-обработчики событий и встраивание страницы на чужие сайты. Исключение для Turnstile ограничено `challenges.cloudflare.com`. Inline CSS разрешён для текущих React/Framer Motion стилей; произвольные inline scripts не разрешены.

JSON-LD в `client/index.html` разрешён точным SHA-256. При изменении его содержимого или пробелов нужно пересчитать хеш и обновить все три конфигурации. После сборки проверить совпадение со скриптом в `dist/public/index.html`:

```js
import { readFileSync } from "node:fs";
import { createHash } from "node:crypto";
const html = readFileSync("dist/public/index.html", "utf8");
for (const match of html.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/g)) {
  if (match[1].trim()) {
    console.log("sha256-" + createHash("sha256").update(match[1]).digest("base64"));
  }
}
```

Netlify/Vercel HTTPS-конфигурации задают HSTS для текущего hostname, без `includeSubDomains` и preload. Node-функция не выставляет HSTS автоматически, потому что локальный сервер работает по HTTP. В development CSP и запрет iframe отключены для Vite/HMR и проверки адаптивности. Это сознательное отличие локальной среды от production.

Netlify применяет статические headers к статическим ответам; ответы функции должны отдельно возвращать нужные заголовки. Их состояние нужно проверять на опубликованном endpoint, а не только по конфигурационному файлу.

## Что требуется на внешнем периметре перед публикацией

Настройки Cloudflare, DNS, ключей и рабочего почтового домена в этой волне не применялись. Для реального ограничения обхода нужен отдельный этап в аккаунте владельца:

1. Подключить рабочий hostname к проксируемому edge и исключить публичный обход origin. На Netlify/Vercel также проверить доступ через служебный домен: защита только основного домена не ограничивает второй адрес сайта.
2. Настроить AI Crawl Control/WAF для выбранных AI crawler/agent. Сохранить доступ проверенных Googlebot, Bingbot и Yandexbot и нужных предпросмотров ссылок. Проверять личность поисковика средствами провайдера или по официальной процедуре верификации, а не по одному User-Agent. Не создавать общий пропуск всех verified bots: среди них есть ИИ-агенты.
3. Проверить новые Cloudflare-политики Search/Agent/Training перед включением. Широкая блокировка Training может затронуть смешанные Search/Training crawler. Для этой задачи безопаснее точечные запреты нежелательных операторов с отдельной проверкой обычного поиска, чем слепое включение всех категорий.
4. Ограничить поток POST на `/api/contact` и прямой `/.netlify/functions/contact`, а также аномальный обход страниц/ресурсов. Согласовать пороги с реальной посещаемостью; не ставить CAPTCHA на каждый просмотр страницы. Не закрывать `robots.txt`, CSS, JS и шрифты от разрешённых поисковиков.
5. Настроить доменные Turnstile keys, серверные origins/hostnames, верифицированный отправитель Resend и общий лимит перед приложением. Проверить правильную выдачу IP адаптером хостинга и исключить доверие клиентским proxy-заголовкам.
6. После согласованной публикации проверить HTTP-заголовки HTML, API и ресурсов; открыть сайт и форму с CSP; проверить sitemap/canonical и обход в Google Search Console/Яндекс Вебмастере; проверить журналы блокировок и ложные срабатывания. В журналах не хранить текст обращения, email, токены и секреты.

Даже настроенный WAF снижает автоматизированный обход, но не гарантирует распознавание каждого агента, имитирующего обычного человека. Защиту следует оценивать по реальному трафику, доступности сайта для посетителей и поисковиков, а также по предотвращённым нежелательным отправкам.

## Первичные источники

Документация проверена 18 октября 2026 года; внешние возможности и названия настроек могут меняться.

- [OpenAI: назначение и ограничения crawler tokens](https://developers.openai.com/api/docs/bots).
- [Anthropic: ClaudeBot, Claude-User и Claude-SearchBot](https://support.claude.com/en/articles/8896518-does-anthropic-crawl-data-from-the-web-and-how-can-site-owners-block-the-crawler).
- [Google: Google-Extended и Googlebot](https://developers.google.com/crawling/docs/crawlers-fetchers/google-common-crawlers).
- [Perplexity: crawler и user-directed fetcher](https://docs.perplexity.ai/docs/resources/perplexity-crawlers).
- [Common Crawl: CCBot и robots.txt](https://commoncrawl.org/faq).
- [Cloudflare: справочник AI bots](https://developers.cloudflare.com/ai-crawl-control/reference/bots/), [AI bot policies](https://developers.cloudflare.com/bots/additional-configurations/block-ai-bots/) и [verified bots](https://developers.cloudflare.com/bots/concepts/bot/verified-bots/).
- [Cloudflare: CSP для Turnstile](https://developers.cloudflare.com/turnstile/reference/content-security-policy/).
- [Netlify: область действия custom headers](https://docs.netlify.com/manage/routing/headers/).
- [Netlify: Edge Functions API](https://docs.netlify.com/build/edge-functions/api/) и [объявление путей](https://docs.netlify.com/build/edge-functions/declarations/).
- [Vercel: Routing Middleware](https://vercel.com/docs/routing-middleware/getting-started).
