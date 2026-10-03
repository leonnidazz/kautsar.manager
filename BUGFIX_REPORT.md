# Kautsar Manager — Bugfix Report

## Fixed

1. Added `GET /api/transactions` plus transaction create/update/delete routes.
2. Added missing `GET /api/files`; the frontend was calling this endpoint during startup.
3. Fixed task toggle returning invalid status `pending`; it now returns `todo`.
4. Added `/api/health` for backend/database diagnostics.
5. Made initial frontend data loading resilient with `Promise.allSettled()` so one failed API does not prevent the other sections from loading.
6. Fixed JSON backup export so PostgreSQL-backed transactions/files are awaited instead of serializing unresolved Promises.
7. Added Supabase Storage cleanup when a file upload succeeds but database insertion fails.
8. File deletion now removes both the database record and the private Supabase Storage object.
9. Replaced server-side `Math.random()` filename generation with `crypto.randomUUID()`.
10. Replaced frontend generated IDs with `crypto.randomUUID()`.
11. Added Supabase/PostgreSQL variables to `.env.example`.
12. Renamed the navigation label to make Cashflow/Keuangan explicit.
13. Replaced `path`/`fs` imports with Node-native imports and removed unused server dependencies.

## Validation

- TypeScript check: `npx tsc --noEmit` — passed.
- Node syntax check: `node --check server.cjs` — passed.
- Production build should be run on Windows after extracting the project and running `npm install`/`npm ci` because Vite/Rolldown native binaries are platform-specific.
