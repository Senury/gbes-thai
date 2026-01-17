# Issues & Fix Notes

Working document that tracks the functional problems surfaced so far plus the agreed direction for fixes/features.

## 1. Partner Search Allows Blank Queries but Backend Rejects Them
- **Symptom**: `PartnerSearch` (all locales) sends `CompanySearchService.searchCompanies(searchQuery || "")`, but the Edge function refuses empty queries when filters are `"all"` and silently throws. Users see the generic “検索エラー/ข้อผิดพลาดในการค้นหา/Search error” toast despite the UI claiming blank searches are valid.
- **Planned Fix**:
  - Either enforce a non-empty keyword on the client or pass explicit industry/location filter tokens even for “all” so the function can build a query.
  - Update the backend guard (`supabase/functions/search-companies/index.ts`) so it interprets an empty string plus filter flags as intentional.

## 2. Data Source “Test” Button Always Fails
- **Symptom**: `DataSourceSelector`→`testDataSourceConnection` posts `{ test: true }`, but the Edge function looks for `testConnection` before short-circuiting. Even if that flag lined up, the client expects `data.success` while the server returns `{ connectionTest: boolean }`. Result: toast + icon always show failure.
- **Planned Fix**:
  - Send `testConnection: true` and read `data.connectionTest`.
  - Consider surfacing backend errors in the toast so users know when an API key is missing vs. the remote API is down.

## 3. Lint Suite Currently Broken
- **Symptom**: `npm run lint` reports 46 errors (lots of `any`, empty blocks, @typescript-eslint rules, regex escape issues, illegal `require` in `tailwind.config.ts`, etc.).
- **Planned Fix**:
  - Triage by grouping (type annotations, hook deps, empty blocks, regex cleanup, config import style).
  - Address the highest-leverage files first (pages/* repeated across locales). Once clean, enforce linting pre-commit / CI.

## 4. Chat Launcher Pulsing Animation
- **Symptom**: The floating chat launcher button (bottom-right) used `animate-pulse`, causing a constant blink that the client dislikes.
- **Fix Implemented**: Removed the `animate-pulse` Tailwind class from all locale variants (`src/components/ExportImportChat.tsx`, `src/components/en/ExportImportChat.tsx`, `src/components/th/ExportImportChat.tsx`) so the button stays static while keeping hover affordances.
- **Status**: ✅ done (no animation now across JP/EN/TH pages).

## Notes on Scope / Next Steps
- This doc can expand as we knock out the client’s requested fixes + small features. Each entry should capture the symptom, impacted files, decision on approach, and validation steps so progress is easy to share back.
