# Issues & Fix Notes

Working document that tracks the functional problems surfaced so far plus the agreed direction for fixes/features.

## 1. Partner Search Allows Blank Queries but Backend Rejects Them
- **Symptom**: `PartnerSearch` (all locales) sends `CompanySearchService.searchCompanies(searchQuery || "")`, but the Edge function refuses empty queries when filters are `"all"` and silently throws. Users see the generic “検索エラー/ข้อผิดพลาดในการค้นหา/Search error” toast despite the UI claiming blank searches are valid.
- **Fix Implemented**:
  - Updated `CompanySearchService.searchCompanies` to skip `searchMultipleExternalSources` when the user supplied neither a meaningful keyword (>=2 chars) nor any filters (industry/location/company size). This prevents the backend from receiving invalid empty queries while still allowing DB-only searches when users haven’t entered criteria.
- **Status**: ✅ done (blank searches no longer trigger backend errors; they simply return existing DB results).

## 2. Data Source “Test” Button Always Fails
- **Symptom**: `DataSourceSelector`→`testDataSourceConnection` posts `{ test: true }`, but the Edge function looks for `testConnection` before short-circuiting. Even if that flag lined up, the client expects `data.success` while the server returns `{ connectionTest: boolean }`. Result: toast + icon always show failure.
- **Planned Fix**:
  - Send `testConnection: true` and read `data.connectionTest`.
  - Consider surfacing backend errors in the toast so users know when an API key is missing vs. the remote API is down.
- **Note**: Selector now supports locale-aware labels (JP/EN/TH) so once the API issue is addressed, the UI will be consistent across languages.

## 3. Lint Suite Currently Broken
- **Symptom**: `npm run lint` reports 46 errors (lots of `any`, empty blocks, @typescript-eslint rules, regex escape issues, illegal `require` in `tailwind.config.ts`, etc.).
- **Planned Fix**:
  - Triage by grouping (type annotations, hook deps, empty blocks, regex cleanup, config import style).
  - Address the highest-leverage files first (pages/* repeated across locales). Once clean, enforce linting pre-commit / CI.

## 4. Chat Launcher Pulsing Animation
- **Symptom**: The floating chat launcher button (bottom-right) used `animate-pulse`, causing a constant blink that the client dislikes.
- **Fix Implemented**: Removed the `animate-pulse` Tailwind class from all locale variants (`src/components/ExportImportChat.tsx`, `src/components/en/ExportImportChat.tsx`, `src/components/th/ExportImportChat.tsx`) so the button stays static while keeping hover affordances.
- **Status**: ✅ done (no animation now across JP/EN/TH pages).

## 5. English Hero Overflows on Mobile / Buttons Too Tight
- **Symptom**: On `/en` the hero headline + CTA buttons use desktop typography/padding, causing horizontal overflow on small screens and cramped button padding on larger screens.
- **Fix Implemented**:
  - Updated `src/components/en/Hero.tsx` with responsive typography and button sizing: mobile headings are slightly smaller but still bold (`text-4xl` base, up to `text-7xl` on desktops) and paragraph text starts at `text-lg`.
  - CTA buttons become full-width on small screens with wrapping text, and their padding/spacing was increased (`px-8/py-5` mobile, `px-10/py-7` desktop) with a wider container to match the Japanese hero spacing.
- **Status**: ✅ done (verify via mobile emulator on `/en`).

## 6. Partner Search Controls Cramped at Tablet Width
- **Symptom**: Around 650 px wide screens the search input shrinks dramatically because the action buttons (Search, Filters, Data Sources, Add) stay in a single row, forcing the input to give up space. Around 1000 px the opposite happens (input much wider than buttons).
- **Fix Implemented**:
  - Updated all locale pages (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`) so the search/input row only switches to side-by-side layout on large screens. Buttons now wrap/full-width on smaller viewports, and at larger widths the input gets `flex-[3]` while the button group gets `flex-[2]` plus `lg:flex-nowrap` to keep a single row without squishing.
- **Status**: ✅ done (check tablet breakpoint ~650 px and wider screens ~1050 px).

## 7. Desktop Nav Bars Feel Cramped
- **Symptom**: The `/ja`, `/en`, and `/th` nav bars all packed 8–9 links into a single row, making medium screens feel crowded.
- **Fix Implemented**:
  - Kept the five core links inline and moved secondary options into locale-specific dropdowns with chevron indicators (`src/components/Navigation.tsx`, `src/components/en/Navigation.tsx`, `src/components/th/Navigation.tsx`), keeping navigation accessible without overwhelming the bar.
- **Status**: ✅ done (verify around 1024 px widths).

## 8. Footer Lacked Language Switcher
- **Symptom**: Once users scrolled to the footer there was no way to jump between `/ja`, `/en`, and `/th`, forcing them back to the top navigation.
- **Fix Implemented**: Added localized language selectors with pill buttons in each footer (`src/components/Footer.tsx`, `src/components/en/Footer.tsx`, `src/components/th/Footer.tsx`) so visitors can swap locales from the bottom of any page.
- **Status**: ✅ done.

## 9. EN/TH Hero Missing Live Badge + Scroll Cue
- **Symptom**: The Japanese hero showcased the “ライブ • 1,234人のユーザーがオンライン” badge and mouse-scroll hint, but the English/Thai heroes lacked these cues, and the badge in Japanese gently floated/animated.
- **Fix Implemented**:
  - Added localized live-status pills plus the mouse scroll indicator to `src/components/en/Hero.tsx` and `src/components/th/Hero.tsx` for parity, and removed the float/glow animation from `src/components/Hero.tsx` so all badges stay static per request. Increased EN/TH badge text to `text-base` for readability.
- **Status**: ✅ done.

## 10. Chat Widget Response Was Static & Plain Text
- **Symptom**: The floating export/import chat modal waited for full responses and rendered plain text, so long replies felt laggy and markdown (lists, code) looked unformatted.
- **Fix Implemented**:
  - Added a lightweight Markdown renderer for assistant replies and restored OpenAI streaming support end-to-end (custom fetch/stream reader per locale) so replies arrive live with formatting (`src/components/*/ExportImportChat.tsx`, `src/utils/markdown.ts`, `supabase/functions/chat-export-import/index.ts`).
- **Status**: ✅ done (chat works again with formatted output; revisit streaming later).

## Notes on Scope / Next Steps
- This doc can expand as we knock out the client’s requested fixes + small features. Each entry should capture the symptom, impacted files, decision on approach, and validation steps so progress is easy to share back.
- Partner Search deep-dive findings (pending action):
  - ✅ Role-gated contact info works by masking `contact_email/phone` per company via `CompanySearchService.filterContactInformation` and showing `ContactAccessPrompt`.
  - ⚠️ `ContactAccessPrompt`’s “Upgrade” button always scrolls to `/ja#pricing`, even from `/en` or `/th`, so non-Japanese users get bounced to the wrong locale.
  - ⚠️ “Search” allows empty keywords, but `search-companies` Edge function rejects blank queries without filters, leading to confusing “Search Error” toasts.
  - ⚠️ `DataSourceSelector` test button never succeeds because client/server disagree on the test flag and response shape.
  - ⚠️ `CompanySearchService.searchMultipleExternalSources` doesn’t enforce a minimum keyword; calling it with `''` still triggers remote APIs that may reject the request or return irrelevant data.
  - ⚠️ `CompanySearchService.scrapeCompanyWebsites` allows non-logged-in users to attempt scrapes; consider gating behind auth to prevent anonymous abuse.
