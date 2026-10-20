# ALGO landing — local redesign, 18 October 2026

## Purpose

Help a learning center owner understand ALGO, explore actual product sections and request a relevant demo. The work is a local review candidate on `CEO` above `12a7651`; it has not been committed, pushed or published.

## Direction

The page combines clear editorial typography with a product walkthrough. Visual references reviewed in the first wave: [Linear](https://linear.app/) for product exploration, [Stripe](https://stripe.com/) for explaining a broad platform, [Mercury](https://mercury.com/) for composition. Their assets, copy and social proof were not copied.

The owner's clarification on 18 October is the governing constraint: product information and visuals must come from ALGO. The landing uses the platform's Inter font, blue `#2563eb`, blue–indigo integral mark and ALGO wordmark. Inter is served locally with its OFL license. The serif accent belongs to the landing's editorial layer.

The hero background is original code-native mathematical geometry: shaded, folded surfaces with a fine grid and moving traces. It is a brand illustration, not a feature or a student result. The center is kept clear for the headline. There are no generated stock images or invented customer logos.

## Source of product truth

The shipped frontend reference is `algo-front-p4`'s `origin/main`, `c15fc86793372bfd3497e233a40b410d64a57dc0` (17 October release in ROADMAP), cross-checked against the current checkout. The public login at `https://algolab.me/login` was viewed without entering credentials.

- `src/components/layout/sidebar.tsx`: role-specific navigation, integral mark and wordmark.
- `src/app/owner/dashboard/page.tsx`: dark organization header, active status, four KPI cards, academic leader and risk groups. No invented historical growth deltas.
- `src/components/payments/payments-page.tsx` and `src/lib/payments.ts`: payment categories, student table and search.
- `src/app/admin/diagnostics/[id]/report/page.tsx` and `src/components/diagnostics/report-score-header.tsx`: Error journal / Skill analysis / Learning plan, named level, correct and incorrect counts. A level is not represented as an accuracy percentage.
- `src/app/teacher/exams/page.tsx`: current, lobby, drafts, completed and archive filters, exam cards and status labels.
- `src/app/admin/diagnostics/page.tsx`: invitation statuses used in the journey illustration.
- `src/app/d/[code]/page.tsx` and `src/components/ui/option-grid.tsx`: diagnostic answer selection does not reveal correctness during the test. The landing therefore does not simulate instant diagnostic feedback.

Product previews are simplified reconstructions, with a visible demonstration-data label. Names, amounts, groups and results are examples; they are not production screenshots or evidence of measured outcomes. The report's sample equation comes from the platform's local demo fixture builder (G7_P08). No private student data is used.

## Visitor journey

1. The approved headline, live surface, product description and two actions. The visitor proceeds directly to the named platform sections; there are no summary example cards or explanatory microcopy between them.
2. Seven capabilities in a stable order; every card links to a meaningful scene.
3. Exams: library template and copy, preparation and question replacement, online/print delivery, group results and reuse.
4. Diagnostics: an answer journal, skill analysis, a clearly labelled Deep Scan mechanism diagram and a learning plan; separate error-free and error examples.
5. A center's day: one student in two groups, history, a planned lesson, explicit start, attendance, an administrator's absence decision and explicit completion.
6. Finances: calendar/package coverage and a receipt; lesson rows, saved payroll, changed payment data, explicit recalculation and two revisions.
7. The ALGO approach: adaptive question selection, Deep Scan and a traceable report, without unmeasured accuracy claims.
8. Team access: the same learning profile across roles, delegated administrator payment access, and a separate owner payroll link.
9. Future directions: learning centers today, private schools next, independent tutors under exploration. These are directions, without release dates or claims of availability.
10. A focused demo invitation with an editable module-specific message.
11. Practical FAQ and a closing invitation.

The landing does not promise verified accuracy, retention or revenue growth, inquiry CRM, branch/room management, a parent portal or a student mobile app. Unsupported old marketing copy was removed from the translation dictionary as well as the page. RU, UZ and EN are retained. Login goes to `https://algolab.me/login`.

## Motion and access

Scroll progress, staggered entrances, restrained product parallax, view transitions and hover responses accompany native scrolling. The hero uses a native 2D canvas capped at 30 frames per second and DPR 1.65. It pauses when off-screen, when the tab is hidden, or through the visible pause control. System reduced-motion preference produces a static composition and suppresses entrance/parallax movement. Observers, listeners and animation frames are cleaned up on unmount.

The contact endpoint remains `/api/contact`; the payload now includes an empty `website` honeypot and `turnstileToken`. The Radix dialog provides labels, keyboard dismissal, focus management, cancellation and distinct unavailable/rate-limit/verification states. No mail configuration returns HTTP 503 and never claims delivery. The preview runs without mail or challenge keys. See `SECURITY.md` for the server contract and deployment requirements.

## Verification and remaining publication work

The first wave (17 October) passed TypeScript, client/server build, a browser walkthrough in three languages, responsive checks at 360/390/768/1280px, keyboard navigation, FAQ and a synthetic local form request with mail disabled. The TypeScript 5.6.3 setting `ignoreDeprecations` was corrected from incompatible `6.0` to `5.0`.

The 18 October grounding and motion pass passed TypeScript (`--noEmit --incremental false`) and the client/server production build (455.40 kB client JavaScript, 147.29 kB gzip). Browser checks covered:

- 1280px desktop and the 558px app panel: no document horizontal overflow; mobile layouts visually inspected in 360/390/768px frames.
- Background pause/resume, live rendering and absence of new console warnings/errors. Reduced-motion, visibility and off-screen behavior reviewed in source; system preference was not changed during testing.
- Owner dashboard and payment navigation; stable student records across payment filters; search and empty state.
- The report's three sections, exam filters/search/empty state, and keyboard Home/Arrow navigation.
- The three process steps and report section selection; opening the demo dialog and Escape returning focus to the trigger; the 360px menu closes on navigation.
- RU/UZ/EN copy and titles. The static share image was regenerated after the wordmark/color correction.

Screenshots: `../artifacts/landing-redesign-20261018/hero.png`, `product-owner.png`, `mobile-process-report.png`, `tablet-hero.png`. The temporary responsive-check page was removed before the final build.

Before publication, select the final public URL and verify canonical/share metadata, configure and accept real request delivery, and review the copy with the owner. Published-site performance and conversion improvement have not been measured. No paid model calls, actual email sends or production changes are part of this work.

## Language menu refinement — 18 October

The browser-native select was replaced with a styled Radix radio menu: full native language names, active checkmark, short language codes, a chevron trigger and reduced-motion-aware entrance. It stays within viewport edges and uses 44px option targets. No dependency was added; the project already includes Radix Dropdown Menu. Saved preference retains priority; the first supported entry in `navigator.languages` is used when no valid preference exists, with Russian as fallback.

Browser verification: RU → EN → reload retains EN; keyboard ArrowDown/Enter selects UZ; Escape closes and returns focus to the trigger; RU restored; the 360px frame and 558px panel both fit the menu. No new browser console warnings/errors. TypeScript and client/server build pass. The menu library increases the client bundle to 507.80 kB / 166.05 kB gzip; Vite emits its non-blocking 500 kB chunk warning. No published performance result is claimed. The temporary language QA page was removed before the build. Screenshots: `../artifacts/landing-language-20261018/language-menu.png` and `mobile-360.png`.

## Section atmospheres — 18 October

The approved hero stays intact. Its mathematical geometry now extends into five related background compositions across six lower sections: contour fields around the platform cards, branching routes behind the process, an orbital mesh around the team, quiet paper geometry in details and FAQ, and converging folds in the closing invitation. These are decorative brand compositions; they make no product or performance claim. All artwork is native SVG/CSS, with no generated bitmap assets or new dependencies.

The reading column stays clear through local gradient veils. Content sits above a non-interactive, aria-hidden decorative layer. The team and closing sections use a deeper blue palette and lighter body copy; cards, spacing, icon frames and FAQ surfaces were coordinated with the backgrounds. Mobile role controls use three equal columns with icons above labels to avoid clipping.

One shared control pauses the hero and all section backgrounds, available both on the hero and in the fixed header. Section animations run only while their scene intersects the viewport and the document is visible. System reduced-motion renders static geometry. Existing product interactions retain their own transitions.

Verification:

- TypeScript passes; client/server production build passes. Client JS is 519.02 kB / 169.08 kB gzip, CSS 152.24 kB / 29.63 kB gzip. The existing non-blocking Vite chunk warning remains; published performance has not been measured.
- Desktop 1280px: all six scenes visually reviewed; roles switch, FAQ expands, closing demo opens, Escape returns focus. No horizontal document overflow. No browser warnings/errors in the final preview.
- Shared pause: both control labels update; all six scene flags become false and their computed animation play states are paused. Resume re-enables intersecting scenes. Off-screen flags observed; hidden-document and reduced-motion paths reviewed in source, without changing the system preference.
- Responsive frames 360/390/768px visually reviewed; team composition inspected at 360/768px. Additional header checks at 950px and 320px with Uzbek text pass. The user's 558px preview has no document horizontal overflow.
- The temporary responsive fixture was closed and removed before the final build. Screenshots are in `../artifacts/landing-atmospheres-20261018/`.

This is a local visual implementation. The broader product-story proposal in `PRODUCT_STRATEGY.md` remains a proposal; new exam/diagnostic walkthroughs and the listed copy corrections were not implemented in this wave. No commit, push, email delivery or publication occurred.

## Product-story implementation — 18 October, LANDING-7

The owner accepted `PRODUCT_STRATEGY.md`. This implementation replaces the earlier repeating Platform/Journey/Team/Details sequence with the current journey above. The heavy first-screen workbench is replaced by concise outcome previews; product depth now lives in four dedicated chapters. The earlier `ProductWorkbench`/`JourneyPreview` sources are retained for reference but are not imported into the page. Obsolete active copy was removed from `landing-copy.ts`.

All chapters use the shipped source baseline and audits recorded in `PRODUCT_STRATEGY.md`. There is no backend or platform contract change. The contact context is an optional local argument to `open(type, context)`; the existing request payload and endpoint remain unchanged. A chosen module supplies editable message text. Closing a dialog clears that draft; Escape returns focus to its trigger. Real request delivery remains unconfigured locally.

Meaningful interactions and acceptance:

- Exams: four keyboard-navigable tabs; create a copy, assign it to 6-B, switch topic/textbook context, reveal the checked answer and replace the actual example. Online start/finish updates the scene title, participant state and report. Eight participants, eight submitted papers and three errors describe a marked demo example. Printed work opens a real two-page sample, not a simulated download.
- Diagnostics: three keyboard-navigable report tabs, expandable Deep Scan mechanism and separate error/no-error scenarios. The no-error journal is positive, the plan develops learning, and no Deep Scan control is shown. Mathematics is checked: `2x+1=7` gives `x=3`; `x=4` gives `9`. Deep Scan is explicitly a mechanism diagram because no accepted anonymized linked-response fixture was available.
- Operations: profile/history/two groups, explicit lesson start, all four attendance marks, required reason before passing an excused absence to the administrator, confirmation, completion and locked marks. Reset restores the planned lesson. Only local example state changes.
- Finance: calendar/package modes and matching receipt coverage; package has four used/four remaining lessons. Saved revision 1 remains 120,000 UZS when changed payment records are revealed. Explicit recalculation saves revision 2 at 160,000 UZS. Expandable history shows both revisions, owner and timestamps. Formula: `800,000 / 8 * 40% = 40,000` per included lesson.
- Scene selection in operations/finance synchronizes the fragment without jumping. Map links select the correct scene even after a manual tab change. Initial deep links wait for the chapter content and fonts, then scroll to the requested anchor. No missing internal link targets were found in the final rendered page.
- Role switch hides money from the teacher example; the administrator example explicitly has payment permission. Payroll is linked as an owner's separate section, not invented as a student-profile tab.
- Module and demo-topic CTAs open a correctly prefilled, editable message. No form submission or email send occurred in this wave.

Browser review covered 1280px desktop and the user's 558px pane; no horizontal document overflow. Responsive frames 360/390/768px were visually inspected, including Uzbek text, mobile formulas, wrapped finance controls and large report fragments. Redundant mobile preambles were condensed, important calculation rows enlarged and key controls given 44px minimum touch height. Shared pause was rechecked across all six decorative scenes. Reduced-motion and hidden-tab behavior were reviewed in source; system settings were not changed. Final browser warnings/errors: none. These are local UI checks, not published performance or conversion measurements.

TypeScript and the production client/server build pass. Main JS is 480.24 kB / 157.50 kB gzip; four chapter chunks are 17.49–28.98 kB each (5.95–9.40 kB gzip). All emitted JS totals approximately 573.13 kB / 188.55 kB gzip; CSS totals 189.69 kB / 40.29 kB gzip. Chapters are separate chunks requested when the chapter boundary renders; viewport-only loading is not claimed. The prior >500 kB chunk warning is absent after removing obsolete copy.

Download assets under `client/public/samples/`:

- `algo-exam-sample.pdf`: two pages, worksheet and teacher key, checked and visually rendered. Two saved bank examples from `sample50_verified_text_match.json`: `G6_TB_12_513.1` and `G6_TB_34–37_320.4`; independently checked sums are `8/15` and `6`. It is a purpose-built educational landing sample, not an unmodified platform export or a real exam.
- `algo-payroll-sample.xlsx`: one readable sheet with numeric dates, inputs and formulas, four lesson rows and a 160,000 UZS total. A temporary 50% share recalculated to 200,000, then 40% was restored. Formula-error scan, rendered view and exported cell values passed. Native desktop Excel was not launched. Both samples currently use Russian and are labelled RU where offered.

Both assets return HTTP 200. Temporary QA HTML and generated inspection logs were removed before the final build. Screenshots and rendered document proofs are in `../artifacts/landing-product-story-20261018/`. Publication, real email delivery, customer testimonials, P4 and new platform features are outside this local acceptance. Before publication, configure request delivery and the final public URL, then validate the deployed site.


## Navigation, clarity, future directions and anti-abuse — 18 October, LANDING-8

The owner requested clearer modules, navigation matching the expanded page, believable fictional examples, separate approach/future sections, and restrictions for AI agents while preserving ordinary search.

Implemented plan and result:

1. Navigation: a desktop Platform disclosure with four module groups and an overview, plus Approach / Team / Future links. A modal mobile menu covers the same destinations, login and demo; Escape, focus handling and scroll containment use Radix. The current section is highlighted. Footer links use the same source. Native anchors use one sticky-header offset rather than doubled padding/margins.
2. Readability: active product controls, meaningful notes and form copy are at least 14px; repeated scene footnotes, finance bullet lists/notes and duplicate demo hints are removed. Capability cards keep a stable order; the previous role toggle only reordered the same cards and was removed. Mobile exam navigation has two rows. Hero preview boxes grow to fit the larger text instead of overflowing.
3. Examples: Aziza Karimova and Dilshod Rahimov connect the operations, roles, payment and payroll examples. Sardor Abdullayev appears in the grade-7 diagnostic example; the grade-6 exam has named fictional participants. A visible overview note explains that names/data are fictional. The XLSX was regenerated with the same names; formulas and 160,000 UZS total remain verified.
4. Scenario clarity: payroll rows explicitly belong to the saved revision and no longer imply a current unpaid balance after a later payment. Exam results opened before running the sample identify a completed example sitting. Attendance explicitly introduces the administrator's stage.
5. Additional editorial sections: Approach explains adaptive selection, related foundational checks and evidence in the three report tabs. Future distinguishes learning centers now, private schools as the next direction and independent tutors as an explored format. No empirical accuracy percentage or schedule is invented. RU/UZ/EN and the shared background pause are supported.
6. Anti-abuse: one contact handler serves Express/Vercel/Netlify with raw-byte limits, strict validation, Origin/Fetch Metadata checks, a honeypot, bounded per-process attempt/send limits, body/provider timeouts and server Turnstile verification of hostname/action. Mail requires explicit recipient/sender and challenge configuration. Personal data and provider bodies are not logged. The form loads Turnstile only when configured and open, handles expiration/retry, and distinguishes delivery unavailability and rate limiting.
7. AI policy and browser protections: explicit robots rules for 11 AI tokens preserve ordinary Google/Bing/Yandex crawling; declared AI HTTP clients receive uncached 403 in Express and Netlify Edge. Production CSP/security headers agree across hosting configurations. User-Agent spoofing remains possible; real WAF/origin restrictions/shared limits and live Turnstile/mail keys are still deployment work. Vercel page filtering requires its external WAF or a separately verified middleware integration. No copy/selection/right-click bans were added.

Acceptance: TypeScript and client/server build PASS; 17 contact tests PASS, including actual local Express HTTP, slow bodies, Vercel streams and Netlify base64; 8 reproducible policy checks PASS. Browser reviewed RU/EN/UZ, desktop 1280 and user pane 558, with 360/390/768 frames. Mobile menu→demo, language selection, future anchors, finance revision transition and the honest unavailable-mail state were exercised. No document overflow at 1280/558 and no missing header/footer anchors. The production build was served locally with CSP: page, dialogue and all chapters rendered without console/CSP errors; HTML/assets/PDF/XLSX returned 200. Tests used injected providers; no real email/challenge service call was made.

Final emitted assets: main JS 496.42 kB / 162.84 kB gzip; all JS 587.86 / 193.45 kB, CSS 198.18 / 41.62 kB. No >500 kB chunk warning. Temporary responsive HTML was removed before the final build. Evidence: `../artifacts/landing-refinement-20261018/` (screenshots, policy checks, production HTTP headers and acceptance.json). No Git publication, deployment or platform/backend-service change occurred. The Express preview remains on localhost:5050 with delivery disabled; the temporary production-check server was stopped.


## Remove ambiguous summaries and repeated instructions — LANDING-9, 18 October

The owner's screenshot identified a concrete comprehension problem: the three hero summaries mixed fragments of an error journal, an exam template and payroll without enough context. Their whole-card links also sent visitors into different sections before the product was explained. Enlarging the notes had not solved that structural issue.

Removed the three HeroOverview cards, their data snippets and captions, the redundant capability strip and hero/closing footnotes. The hero now contains the headline, concise product description and two actions, then leads directly into the capability map. Its height and spacing were recomposed for desktop and mobile, retaining the approved live background and the shared header pause control. The unused overview component, styles and localized fields were removed rather than hidden.

A second pass removed repeated “Explore the workflow” labels from the seven capability links (their actual module names/descriptions and arrows remain), the map's generic instruction, repeated role prose and the generic Approach/Future introductions. In exams the library proof no longer duplicates its description, the selected-topic/source repetition is gone and the error count appears once beside its question. In diagnostics the extra meta-headings/subtitle/caption and commentary about what the journal ought to show were removed; Deep Scan explicitly says how it works, and the no-error journal gives the positive result and next step. One factual 14px note about fictional names/data remains before the first exam illustration. Functional restrictions and role decisions remain next to their actions.

Verification: TypeScript and client/server production build PASS. Browser reviewed desktop1280, user558, responsive360/768 and all three locales; hero→capability→diagnostic navigation, Deep Scan disclosure, error-free journal and report tabs exercised. No old overview cards, no missing internal anchors, no document overflow at1280/558 and no console warnings/errors. Visible functional paragraphs/buttons in the product scenes were checked at ≥14px. Responsive fixture removed before building. Evidence: `../artifacts/landing-clarity-20261018/`. API/security contracts were unchanged; no backend regression was repeated for this presentation-only change.

Current assets: main JS486.74kB/159.57gzip; all JS572.30/188.78kB; CSS195.84/41.22kB. No commit, push, deployment or email occurred. Delivery and external protection remain the publication requirements described in SECURITY.md.

## Document entry and exam preparation — LANDING-10/11, 19 October

Reload had two competing scroll owners: native restoration retained the old lower-page position, while ProductChapters replayed a captured fragment after lazy chunks/fonts loaded. The defect was reproduced on a fragment-free URL at y=8300.5 with the demo dialog open. The document-entry controller now runs before React mounts. Reload resets to the top and removes only the stale fragment, preserving the path, query and history state. A deliberately opened section link waits for chapters, pageshow and fonts, then applies its actual scroll margin once. Trusted scrolling cancels a pending correction. Back/Forward and BFCache keep native ownership; pagehide cancels pending work. Native fragment clicks can also emit popstate, and restoration belongs to each history entry: the old entry is released before creating a new fragment entry. There are no repeating reset timers.

Preparation is now a full-width workspace with source selection on the left and teacher review on the right; it stacks on phones. Curriculum selection distinguishes equal and different denominators. Textbook selection displays the actual edition, selected section and page: Vilenkin et al., Mnemozina, §12 p74; School edition, O‘qituvchi 2017, §§34–37 p51. These sections belong to different books. Each source has an independent remembered selection. Replacements stay within its scope and difficulty level. A/B/C use three intrinsic cards with explicit Easy/Medium/Hard labels and separate counts, replacing the overflowing fixed-width chips. The 5-question, 45-minute composition is an illustrative paper, not a live generation request.

The teacher preview shows a bank question, its level, checked answer and worked arithmetic. Its distractor controls reveal a possible arithmetic mechanism; they do not diagnose a pupil from a single answer. Four saved questions are used: G6_TB_12_513.1 (8/15, B), G6_TB_12_513.3 (3 4/9, B), G6_TB_34–37_320.4 (6, A), and G6_TB_34–37_320.3 (5 4/5, A). The generic 60 distractor is retained with an explicit missing-explanation state; no detailed cause is invented. The mathematically invalid −1 explanation from .513.2 is excluded with that unused question. Canonical question_latex and selected content-only source records are bound in content-evidence.json, extracted from the historical September bank snapshot; the October no-student repair snapshot also confirms the original examples. This is not a new live-bank audit or a bank repair. Correct answers were independently recomputed by rational arithmetic; all distractors differ from the key.

The issued question is captured when the example sitting starts, so later preparation edits do not rewrite its report. Recommendations fit both equal-denominator examples, without asserting a carry into the whole part when none exists. Confirming a replacement returns focus to its replacement control. RU/UZ/EN copy and the fictional-data note distinguish invented participant names/results from actual educational content. Library copy/assignment, online start/finish and the separate paper/PDF route remain available.

Verification: TypeScript, client/server build, 12 scroll regressions and 4 independent rational solutions PASS. Browser reviewed desktop1280, user558 and responsive360/768; sources, both replacement pools, teacher review, missing explanation, focus return and issued-report continuity exercised. English and Uzbek copy reviewed. No document overflow at1280/558; functional preparation text/buttons ≥14px; A/B/C boxes contain their contents. Production-mode localhost5051 confirmed direct payroll URL (selected tab, target top130.12px), reload preserving query and returning y0, and demo-dialog reload from y8300.5 to y0 with the dialog closed. Native Back/Forward also exercised; BFCache cancellation is covered by regression, without claiming a forced browser cache hit.

Final assets: main JS488.67kB/160.26gzip; all JS586.87/193.30kB; CSS204.16/42.70kB. Evidence: ../artifacts/landing-exam-entry-20261019/. Temporary responsive HTML was removed before building. No API/security/backend-bank changes, new dependencies, Git publication, deployment, real email or paid model calls. The user preview remains localhost5050 with mail disabled; the temporary production-check server is stopped after acceptance.

## Telegram for students and parents — LANDING-13, 19 October

The owner confirmed that both Telegram apps already work with real data and that access is provided through the learning centre. This is owner confirmation of the product; the earlier local demo audit is a separate source review and does not verify the running environment. The landing now explains the two audiences and the connection route without inventing public bot links or a self-registration flow.

Added a fifth product chapter after Finance, with separate student/parent selectors, results and attendance. The student example also shows a class schedule; the parent example has only results and attendance. The phone is a labelled learning example, using fictional Aziza Karimova and Dilshod Rahimov. The result is internally consistent: 5 questions, 4 correct, 1 incorrect, 8/10 points. It is an illustration rather than a live connection to personal data. Audience changes reset the preview; result details expand independently. On phones an explicit audience selection focuses and scrolls to its preview, respecting reduced-motion. Two-column preview controls keep the student's third Schedule control on its own full row instead of crowding labels. Functional text is at least 14px; checked secondary colours have contrast ratios 4.84–5.63 against their associated backgrounds. Decorative movement uses the existing shared pause.

Online tuition payments appear separately with a visible Coming soon status in RU/UZ/EN. There is no payment action, deadline or provider-partnership claim. The CTA opens the existing editable demo dialog with Telegram context. Capability navigation now has eight items, Platform/mobile/footer navigation covers five chapters, and the demo selector has six contexts. The Telegram FAQ explains centre-issued access; the payments FAQ distinguishes existing payment records from the planned online checkout. The entry-scroll controller waits for all five lazy chapters.

Verification: full TypeScript and client/server production build PASS; existing 12 scroll regressions PASS. Browser reviewed student/parent results, attendance, student schedule, result expansion and audience resets; RU/UZ/EN, desktop1280/user558 and responsive frames360/768. Mobile menu → Telegram and desktop Platform → Telegram work; the CTA prefill matches this chapter. No document overflow at1280/558, preview control scroll widths fit their bounds, and no functional paragraph/button/small text below14px in the checked chapter. Narrow frames were visually inspected rather than cross-frame DOM-measured. Production-mode localhost5051 loaded the direct Telegram anchor at top108.01px after lazy content; a reload with the demo open returned y0, preserved the query, removed the fragment and closed the dialog. No email was submitted. Browser logs were reviewed separately in acceptance.json.

Assets: main JS490.29kB/160.81gzip; all JS599.68/197.96kB; CSS213.09/45.05kB. The new Telegram chunk is11.06/3.99kB JS and8.70/2.31kB CSS. No >500kB chunk warning. Temporary responsive HTML was removed before building. Evidence: ../artifacts/landing-telegram-20261019/ (screenshots, contrast, build-assets and acceptance).

The payment research is recorded in ../algo-infrastructure/docs/engineering/evidence/telegram-payments-estimate-2026-10-19.md. It estimates a new PaymentOrder/Invoice core over existing StudentPayment records, provider adapters, shared QA and a Telegram hosted-checkout entry. It does not implement a payment backend or treat accounting void as a bank refund. One-centre pilot and approved merchant access are assumptions; wider settlement, bank waiting and standalone fiscal work are separate. No new dependencies, platform/API changes, commit/push/deploy, banking registrations, real payments, emails or paid calls occurred. The local preview remains5050; publication prerequisites remain LANDING-8/SECURITY.md.

## Chapter alignment and redundant CTA — LANDING-14, 19 October

The owner's screenshots showed an unnecessary working-day demo link and a Telegram preview starting too far below its heading. Removed the Operations CTA, all three localized labels/contexts and its unused contact hook/styles. The chapter's actual student, group, lesson and attendance controls remain in place.

Telegram's introduction previously occupied a full-width row, forcing the preview below the entire introduction. Moved it into the left column and let the right preview begin64px from the column's top,16px below the actual heading top in the1280px browser. It no longer depends on heading/paragraph height or a negative visual offset. The existing single-column mobile flow and preview focus after audience selection remain intact.

Reviewed the adjacent compositions. Team had the same structural issue: the example followed both the introduction and role selector. Its introduction, selector and role explanation now occupy the left column; the right card starts alongside the introduction,26px below the heading's bottom. The role selector uses intrinsic grid cells, with2+1 placement in narrow two-column layouts and on small phones. Long role names retain14px type and44px minimum button height. Other reviewed module layouts did not need the same structural change.

Verification: full TypeScript and client/server production build PASS; git diff whitespace check PASS. Browser review1280/558 and responsive360/768, with RU/EN/UZ; Telegram heading/preview alignment, mobile reading order, responsive role labels and Owner selection exercised. No overflowing document at1280/558 and no button content wider than its bounds in the checked page states. No main-content button below14px on the checked1280 state. Hero/map, exam, diagnostic, operations, finance, team, future, demo, FAQ and closing/footer compositions were reviewed; responsive frames were visually reviewed rather than cross-frame DOM-measured. This wave changes presentation only; existing entry-scroll/backend suites were not repeated.

Final assets: main JS490.29kB/160.80gzip; all JS599.09/197.77kB; CSS213.21/45.05kB. Temporary responsive HTML removed before the build. Evidence: ../artifacts/landing-alignment-20261019/. No API contracts, payment implementation, dependencies, Git publication, deployment or real email changed. Preview remains localhost5050 with delivery disabled.

## Questions before connecting — LANDING-15, 19 October

The owner requested a considered Q&A section following the chapter-alignment review. Replaced the generic invitation heading and seven individually numbered cards with a clearly named Questions and answers section and one quiet, divided accordion. The list begins5.60px below the heading's top in the1280px review; below900px the section becomes a single reading column. Questions use16px type and answers15px, without numbered decorations, secondary CTA or instruction footnotes. The paper atmosphere still follows the site's shared pause and reduced-motion setting.

Seven stable topics now follow the visitor's decision: intended centres/subject coverage, diagnostics versus exams, printed exams, student/parent access, role permissions, current accounting versus future online payments, and the first demo/setup step. Answers lead with the actual behaviour and use short paragraphs. They preserve mathematics grades5–11, teacher marking on paper, centre-issued Telegram access, role/granted-payment boundaries and online tuition payments being unavailable today. No trial, pricing, launch date, bank partnership, empirical accuracy or onboarding-duration promise was added.

QuestionsSection owns its RU/EN/UZ content and styling. Old FAQ fields and duplicate CSS were removed from ProductStory, landing-copy, index.css and section-system.css. The section uses the already-installed Radix Accordion primitive with stable item IDs: the first answer opens initially, at most one opens at a time, all can be closed and locale changes preserve the current topic. Trigger headings, expanded state, associated regions and focus are handled by the primitive. Only the chevron/hover transition moves; reduced-motion disables it. No new dependencies were installed.

Verification: full TypeScript, client/server production build and diff whitespace check PASS. Browser1280/user558: seven controls, first answer initially open, valid control targets, no document/control overflow, questions16px and visible answer text15px. Keyboard Down moved to the next question; Enter opened it and closed the previous; End moved to the last; Enter opened setup; Space closed all while preserving focus; Home/Enter returned to the first. Responsive360/768 visually reviewed in RU and EN/UZ, including long questions and the payment state. An open payment answer stayed selected when switched to Uzbek. Desktop/mobile warning/error logs were empty. Temporary responsive HTML was removed before building. This is local UI acceptance, not an accessibility certification, new platform/API acceptance or conversion measurement; backend/entry-scroll suites were not repeated.

Final assets: main JS498.56kB/163.33gzip; all JS607.35/200.31kB; CSS213.32/45.03kB. No >500kB chunk warning. Evidence: ../artifacts/landing-questions-20261019/ (desktop/mobile screenshots, responsive translations, payment answer, build-assets and acceptance). User preview stays on localhost5050/#questions in Russian. No commit/push/deploy, submitted form, real email, financial operation or bank configuration occurred.

## Topic board replacing the Q&A list — LANDING-16, 19 October

The owner asked for a stronger block composition instead of the long list in LANDING-15. The local proposal now puts the heading above a full-width topic board, removing the empty editorial column. Three plainly named tabs organize the existing seven answers: Learning has scope/diagnostics/paper in three parallel articles; Access and roles has two; Payments and setup has two. Answers are immediately visible within the chosen topic. There are no individual disclosure rows, instruction captions, invented statistics or extra conversion buttons. All previous product facts and the explicit future status of online payments remain unchanged.

At wide widths, the board uses three or two article columns with shared dividers. At801px and above Learning has three columns;641–800px uses two plus a full-width third;640px and below uses one reading column. The three topic controls remain visible, wrap their labels and use at least14px type. Answers retain15px type and question headings20–21px. The serif heading phrase is kept together when wrapping on phones. The paper atmosphere and shared pause remain in place; reduced-motion removes control transitions. The existing Radix Tabs dependency replaces Accordion, with no installation. Stable learning/access/setup values preserve selection across translations.

Verification: TypeScript and client/server production build PASS, no >500kB chunk warning; diff whitespace check PASS. Browser1280 and user558: one active topic panel, valid tab control targets, no document or tab-label overflow; real group counts3/2/2. Right selected Access, End selected Setup, Home restored Learning, and Tab entered the active panel. Pointer selection of Setup also passed in the558px pane. Responsive360/768 visually reviewed in RU/EN/UZ; an active Setup topic stayed selected when translated to Uzbek. The answer still says online tuition payments are unavailable. Desktop/mobile warning/error logs were empty. Responsive frames were visually reviewed rather than cross-frame DOM-measured. Backend and entry-scroll logic were unchanged and their suites were not repeated.

Assets: main JS495.67kB/162.70gzip; all JS604.46/199.68kB; CSS214.18/45.20kB. Temporary responsive HTML removed before building. Evidence: ../artifacts/landing-questions-board-20261019/. This is the current local design candidate, replacing the previous list presentation; it is not a published release or conversion result. Local5050 remains open in Russian with mail disabled. No API/payment configuration, new dependencies, commit/push/deploy, real email or banking action occurred.

## Stable Q&A transitions — LANDING-17, 19 October

The owner accepted the topic-board composition and asked for softer transitions without the board growing or shrinking. The cause was switching between panels with different natural heights: at1280px in Russian, Learning was504.64px high and Access363.20px. Each topic now stays mounted in one shared grid area, reserving the tallest topic's natural height for the current width and language. No fixed pixel height, resize observer, timer or artificial text shortening is used. Shorter topics retain some whitespace in exchange for keeping the board, following section and scroll position stable.

Outgoing answers fade over140ms; incoming answers fade over280ms after80ms with a subtle5px movement finishing by440ms. Control colour and underline transitions use240ms. Inactive panels are immediately aria-hidden, inert and tabindex=-1, even during the visual fade; only the selected panel is accessible and focusable. Controlled Radix state keeps selection and ARIA bindings synchronized, including across translations. Reduced-motion CSS removes both transitions and translation; OS preference emulation was not performed.

Browser acceptance: all three topics have equal board height, equal following-section position and unchanged scroll at1280px in RU/EN/UZ and558px in RU. Russian board height504.64px at1280,927px at558; English and Uzbek476.89px at1280. An intermediate active opacity0.721 confirmed a real transition while board height remained504.64px. End/Home/Right and Tab to the active panel passed; rapid pointer switching ended on the requested topic. One accessible panel, two inert panels and valid tab targets confirmed. Responsive360/768 frames visually reviewed with different topics selected; no cross-frame DOM sizing claim. Desktop warning/error logs were empty.

TypeScript, client/server build and whitespace checks PASS. Assets: main JS495.82kB/162.75gzip; all JS604.62/199.73kB; CSS214.71/45.31kB. Evidence: ../artifacts/landing-questions-motion-20261019/. Temporary QA HTML removed before the build. This is a local UI correction, not publication or a conversion result. Product copy, backend, entry-scroll and banking contracts were unchanged; their suites were not repeated. No new dependency, Git operation, deployment, submitted form, real email or bank action occurred.

## Git checkpoint — 20 October

The owner authorized committing and pushing all landing changes, explicitly limited to the independent algo-landing repository on CEO. The previous LANDING entries describe historical local checks; this checkpoint preserves their accumulated product experience, source assets, examples, translations, navigation, contact protections and Q&A refinements together. Other repositories and deployment branches are outside this Git operation.

Fresh pre-commit acceptance: TypeScript and client/server production build PASS;29 tests PASS (17 contact and12 entry-scroll). The first restricted test run could not bind loopback for two HTTP-adapter cases; the complete rerun with local socket permission passed without skipping any test. External mail/challenge calls are replaced at the test boundary. Candidate-file credential-pattern scan found no matches; local env, dependencies, compiled output and workspace evidence remain outside the commit. No GitHub Actions workflow is configured in this repository; local checks are not a remote CI result. No deployment, real mail or payment was initiated for this checkpoint.
