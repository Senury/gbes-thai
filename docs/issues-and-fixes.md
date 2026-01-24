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

## 11. Filters/Data Sources Stay Open After Search
- **Symptom**: On Partner Search pages, the advanced filter accordion and data source selector stayed open after a search, forcing users to manually close them to view results.
- **Fix Implemented**: Each locale's `searchCompanies` now closes both panels (`setShowFilters(false)`, `setShowDataSourceSelector(false)`) in the `finally` block so the results are visible immediately (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 12. Navbar Profile Actions Were Static
- **Symptom**: When logged in, the navbar just displayed the user's email text, and the “登録” button was always shown even for paid subscribers.
- **Fix Implemented**: The email is now a dashboard button (desktop + mobile) and the register CTA hides for paying/premium or completed users across all locales using `useUserRole` (`src/components/Navigation.tsx`, `src/components/en/Navigation.tsx`, `src/components/th/Navigation.tsx`).
- **Status**: ✅ done.

## 13. Dashboard Header/Sidebar Redundancies
- **Symptom**: The dashboard top bar had its own sidebar toggle button, and the sidebar lacked a quick way back to the public homepage (leading to duplicate toggles after design feedback).
- **Fix Implemented**: Removed the header `<SidebarTrigger>` (`src/components/DashboardLayout.tsx`) and replaced the sidebar menu shortcut with a minimalist localized “Back to site” control that sits above the menu when expanded. The control stays in-flow with `opacity-0` in collapsed mode so the other icons never shift, and the collapse trigger now uses a flex-1 container that centers it in the collapsed state (while a fixed-width spacer preserves the back-link slot) so it aligns vertically with the remaining icons (`src/components/AppSidebar.tsx`).
- **Status**: ✅ done.

## 14. Dashboard Localization Gaps
- **Symptom**: Visiting `/ja/dashboard` still rendered every heading/label in English, and the shared `SubscriptionStatus` widget always showed Japanese regardless of locale.
- **Fix Implemented**: Localized all static strings in `src/pages/Dashboard.tsx` (welcome hero, card headers/descriptions, CTAs, fallback messages, toast text) and explicitly set `<DashboardLayout language="ja">`. `SubscriptionStatus` now accepts a `language` prop with JA/EN/TH copy, localized dates, and locale-aware pricing links; each dashboard passes its language so the subscription panel matches the page (`src/components/SubscriptionStatus.tsx`, `src/pages/*/Dashboard.tsx`).
- **Status**: ✅ done.

## 15. Profile Form Didn’t Show Existing Data
- **Symptom**: The dashboard/profile form always loaded empty inputs even when the user already had profile/registration data because `react-hook-form` initialized before the async fetch completed and never re-populated the fields.
- **Fix Implemented**: `useProfile` now also fetches the latest `registrations` entry (even when a profile exists) and exposes the plan from that record so `ProfileForm` can prioritize the exact same plan string the dashboard’s “Current Plan” card displays. `getPlanDetails` centralizes plan names/prices/colors per locale, and the read-only plan field mirrors that output (Token A/B/Premium/Admin). All saved fields—including the plan—prefill automatically so nothing can be accidentally overwritten (`src/hooks/useProfile.ts`, `src/components/ProfileForm.tsx`, `src/utils/servicePlans.ts`, `src/pages/*/Dashboard.tsx`).  
- **Status**: ✅ done.

## 16. Sidebar Still Showed “Registration” Link After Completing Signup
- **Symptom**: Even after finishing the paid registration flow, the dashboard sidebar continued to show the “Registration” menu item (and it would flicker back in briefly while role info was loading), sending customers to a redundant form.
- **Fix Implemented**: `AppSidebar` now consumes `useUserRole.registrationCompleted` plus its loading state, and only adds the Registration entry when the role hook has finished loading and the user hasn’t completed registration. The hook now keeps that flag tri-stated (null/false/true) and persists it in `localStorage`, so we never show the link until we’re certain the user is incomplete (`src/components/AppSidebar.tsx`, `src/hooks/useUserRole.ts`).
- **Status**: ✅ done.

## 17. Sidebar Blanked on Every Navigation
- **Symptom**: Clicking any sidebar link briefly unmounted the entire dashboard because every page re-instantiated `useAuth`, which fetched Supabase session state anew, causing `DashboardLayout` to hit its loading skeleton each time.
- **Fix Implemented**: Promoted the auth hook into a global context provider (`AuthProvider`) that initializes Supabase session once and shares the user state across the app. Wrapped `<App />` with the provider so the sidebar and layout retain state across route changes (`src/hooks/useAuth.tsx`, `src/App.tsx`). Transitions between dashboard sections now swap only the content without flashing the whole shell.
- **Status**: ✅ done.

## 18. Subscription Status Ignored Premium Roles
- **Symptom**: Users with active subscriptions still saw “Not Subscribed” in the dashboard card because `useSubscription` could fail silently and `SubscriptionStatus` only trusted that hook. Even the fallback `useUserRole` was reporting `hasSubscription=false` when a user’s `user_roles` table already had `premium` assigned.
- **Fix Implemented**: The component now also consumes `useUserRole` so it treats `hasSubscription`/`subscriptionTier` from our RPC as truthy even if the functions endpoint lags, and the role hook itself infers `hasSubscription` from the highest role (premium/admin) when the RPC returns null. Status badge, plan label, and CTA now reflect real premium accounts immediately (`src/components/SubscriptionStatus.tsx`, `src/hooks/useUserRole.ts`).
- **Status**: ✅ done.

## 19. Partner Search Lacked Real Location Context
- **Symptom**: Location filtering was limited to static region dropdowns and didn’t leverage the Google Places data source, so users couldn’t target specific cities/landmarks or feed precise locations into the search.
- **Fix Implemented**: Added a Supabase Edge function that proxies Google Places Autocomplete, extended `search-companies` to honor selected Place IDs when calling Google Places, and updated all Partner Search locales (JA/EN/TH) to include a Google-powered location field. Selecting a suggestion stores the `place_id`, feeds it through `CompanySearchService`, and drives more accurate Google Places results. (`supabase/functions/google-places-autocomplete`, `supabase/functions/search-companies/index.ts`, `src/utils/CompanySearchService.ts`, `src/pages/*/PartnerSearch.tsx`)
- **Status**: ✅ done.

## 20. Navbar Overflow Near Tablet Breakpoint
- **Symptom**: Just before the layout switches to the tablet/mobile breakpoint, the navigation links overflow the container and clip.
- **Fix Implemented**: Shifted the desktop navigation to start at `lg` so the mobile menu takes over earlier, preventing overflow in all locales (`src/components/Navigation.tsx`, `src/components/en/Navigation.tsx`, `src/components/th/Navigation.tsx`).
- **Status**: ✅ done.

## 21. Hero CTA Buttons Did Nothing
- **Symptom**: The primary/secondary hero buttons in JA/EN/TH were styled but lacked navigation, so “Register/ลงทะเบียน/今すぐ登録” and “Learn More/サービス詳細/เรียนรู้เพิ่มเติม” had no effect.
- **Fix Implemented**: Wired the primary CTA to each locale’s signup route and the secondary CTA to smooth-scroll to the `#services` section (`src/components/Hero.tsx`, `src/components/en/Hero.tsx`, `src/components/th/Hero.tsx`).
- **Status**: ✅ done.

## 22. Filter + Data Source Panels Overlapped
- **Symptom**: Opening the filter panel and data source selector stacked them on top of each other instead of switching, obscuring controls.
- **Fix Implemented**: Toggled the panels to be mutually exclusive so opening one closes the other in all locales (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 23. Supabase-Only Search Returned No Results
- **Symptom**: Selecting only the Supabase data source and running an empty search (to list all saved companies) returned nothing because data-source filtering excluded records tagged with external origins stored in the same database.
- **Fix Implemented**: When Supabase is the sole selected source, the data-source filter now returns all database results instead of filtering by `data_source` (`src/utils/CompanySearchService.ts`).
- **Status**: ✅ done.

## 24. Data Source Test Button Always Failed
- **Symptom**: The data source panel’s “Test” button always reported failure because the client sent `test: true` and expected `data.success`, while the Edge function expects `testConnection` and returns `{ connectionTest: boolean }`.
- **Fix Implemented**: Updated the client to send `testConnection: true` and read `data.connectionTest` (`src/utils/CompanySearchService.ts`).
- **Status**: ✅ done.

## 25. EN Partner Search Filters Syntax Error
- **Symptom**: The English Partner Search page failed to compile due to a stray wrapper `<div>` left behind after removing Google location search, causing a JSX parsing error.
- **Fix Implemented**: Removed the empty `<div>` so the filter panel markup is valid again (`src/pages/en/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 26. Partner Search Pagination Limited to First 20 Results
- **Symptom**: Partner Search only displayed the first page of results with no way to navigate through pages.
- **Fix Implemented**: Added numbered pagination controls (Prev/Next + page numbers) that fetch the requested page in JA/EN/TH (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 27. Google Places Results Stopped After First Page
- **Symptom**: Only the first 20 Google Places results were fetched; later pages only paged through database records.
- **Fix Implemented**: Added Google Places `next_page_token` support in the Edge function and client so page 2/3 can fetch additional Google results before paging the database (`supabase/functions/search-companies/index.ts`, `src/utils/CompanySearchService.ts`, `src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 28. Pagination UI Hidden When Only External Pages Available
- **Symptom**: Numbered pagination stayed hidden when only Google Places had more pages because total count was based on current DB results.
- **Fix Implemented**: When Google Places returns a `next_page_token`, the UI now advertises the next page even if the DB count is still at 20, so page buttons appear for external pagination (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 29. Partner Search Page Size Too Small
- **Symptom**: Searches only pulled 20 results per page, so pagination wouldn’t appear unless there were many DB rows.
- **Fix Implemented**: Increased page size to 40 and passed that limit through to external search requests so each page loads more companies consistently (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`, `src/utils/CompanySearchService.ts`).
- **Status**: ✅ done (reverted to 20 per client request for clearer pagination).

## 30. Pagination Hidden When Count Was Overwritten
- **Symptom**: Pagination buttons never appeared because data-source filtering overwrote the total count with only the current page length.
- **Fix Implemented**: Preserve the database count when filtering by data source so pagination can show page numbers (`src/utils/CompanySearchService.ts`).
- **Status**: ✅ done.

## 31. Pagination Triggered Toasts and Didn’t Reset Scroll
- **Symptom**: Switching pages fired the “search complete” toast every time and left the user scrolled mid-page, making pagination feel noisy.
- **Fix Implemented**: Suppressed toasts on page changes and scroll to top on pagination in JA/EN/TH (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 32. Partner Search Results Not Sorted by Query Similarity
- **Symptom**: Searches did not prioritize companies whose names start with the query, making short queries like "to" feel unordered.
- **Fix Implemented**: Added a relevance sort that prioritizes exact matches, then prefix matches, then substring matches (plus verified/name tiebreakers) across all locales (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.



## 33. Pagination Scroll/Ellipsis Improvements
- **Symptom**: Clicking the current page number didn’t scroll back to the top, and large page counts showed every button instead of using ellipses.
- **Fix Implemented**: Always scroll to top on pagination clicks and added condensed page buttons with `…` when there are more than five pages in JA/EN/TH (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 34. Card Content Alignment
- **Symptom**: Card content heights varied, causing misaligned footers and inconsistent horizontal alignment between cards.
- **Fix Implemented**: Made cards full-height with flex layouts and pushed footer actions to the bottom so card contents align consistently across JA/EN/TH (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 35. Region Filter Returned Zero Results
- **Symptom**: Region filtering returned no results because the default data sources excluded Supabase, so only external APIs (which can be empty/unavailable) were queried.
- **Fix Implemented**: Included Supabase in the default selected data sources across locales so region filters return existing DB records (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 36. Supabase Results Missing When Combined With Other Sources
- **Symptom**: Selecting Supabase alongside other data sources only showed external results because Supabase filtering excluded records tagged with external `data_source` values that are still stored in the DB.
- **Fix Implemented**: Treat Supabase selection as “show all DB rows,” so combining it with other sources no longer hides stored records (`src/utils/CompanySearchService.ts`).
- **Status**: ✅ done.

## 37. Data Source Test Buttons Failed for OpenCorporates/Companies House
- **Symptom**: The “Test” button failed for OpenCorporates and Companies House due to missing auth handling (Companies House requires Basic auth, and OpenCorporates can use an API token).
- **Fix Implemented**: Added optional `OPENCORPORATES_API_KEY` and `COMPANIES_HOUSE_API_KEY` handling and proper auth for Companies House during connection tests (`supabase/functions/search-companies/index.ts`).
- **Status**: ✅ done.

## 38. Partner Search Page Size Set to 12
- **Symptom**: The client requested fewer cards per page for easier scanning.
- **Fix Implemented**: Updated Partner Search pagination to display 12 results per page across JA/EN/TH (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## 39. Pagination Ellipsis Layout Refined
- **Symptom**: Ellipsis-based pagination looked awkward with uneven spacing.
- **Fix Implemented**: Switched to a fixed 5-slot pagination model (first, last, and neighbors of current) so ellipses render predictably (`src/pages/PartnerSearch.tsx`, `src/pages/en/PartnerSearch.tsx`, `src/pages/th/PartnerSearch.tsx`).
- **Status**: ✅ done.

## Notes on Scope / Next Steps
- This doc can expand as we knock out the client’s requested fixes + small features. Each entry should capture the symptom, impacted files, decision on approach, and validation steps so progress is easy to share back.
- Partner Search deep-dive findings (pending action):
  - ✅ Role-gated contact info works by masking `contact_email/phone` per company via `CompanySearchService.filterContactInformation` and showing `ContactAccessPrompt`.
  - ⚠️ `ContactAccessPrompt`’s “Upgrade” button always scrolls to `/ja#pricing`, even from `/en` or `/th`, so non-Japanese users get bounced to the wrong locale.
  - ⚠️ “Search” allows empty keywords, but `search-companies` Edge function rejects blank queries without filters, leading to confusing “Search Error” toasts.
  - ⚠️ `DataSourceSelector` test button never succeeds because client/server disagree on the test flag and response shape.
  - ⚠️ `CompanySearchService.searchMultipleExternalSources` doesn’t enforce a minimum keyword; calling it with `''` still triggers remote APIs that may reject the request or return irrelevant data.
  - ⚠️ `CompanySearchService.scrapeCompanyWebsites` allows non-logged-in users to attempt scrapes; consider gating behind auth to prevent anonymous abuse.
- Google Places autocomplete: `google-places-autocomplete` returns `REQUEST_DENIED` until billing is enabled on the Google Cloud project tied to `GOOGLE_PLACES_API_KEY`, so location suggestions won’t appear without billing.
