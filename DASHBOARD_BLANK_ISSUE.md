# Issue: Dashboard / app appears blank

This document describes blank-screen symptoms and how the app mounts today. **Update (2026):** the Zustand `persist` **full-screen hydration gate was removed** from `AppLayout` — `useHydration()` now resolves immediately for the frontend-first build, so you should not stay stuck on “Initializing Workspace…” for that reason alone.

---

## What you might be seeing

| Appearance | Likely layer |
|------------|----------------|
| **Pure white / nothing** | React never mounted, root crash, or extension blocking JS — check **Console** first. |
| **“Initializing Workspace…”** (legacy) | Previously: `AppLayout` waited on `useHydration()` / Zustand `persist`. If you still see this string, search the repo — it should no longer be in `AppLayout`. |
| **Very minimal page** | Empty `selectedModules` or route guard — see store defaults and `hasAccess` in `AppLayout`. |
| **“Access Denied”** | `hasAccess === false` → `ForbiddenPage` instead of `Outlet`. |

---

## Expected render chain for `/app/dashboard`

1. **`main.tsx`** → `<App />` into `#root`.
2. **`App.tsx`** → `BrowserRouter` → `/app/*` → **`AppLayout`** → **`DashboardPage`** via `<Outlet />`.
3. **`AppLayout.tsx`** → sidebar, top bar, main + `Outlet` (no persist gate).

---

## Persist & localStorage

- **Key:** `cynda-workspace-storage` (`persist.name` in `src/lib/industry-store.ts`).
- **`migrate`** is wrapped in **try/catch**; on failure it logs a warning and returns `{}` so defaults can apply.
- If behaviour is odd after upgrades: DevTools → **Application** → **Local Storage** → delete `cynda-workspace-storage` → hard refresh.

---

## Development environment

This repository is developed with **Cursor** (not Trae or other editors) for AI-assisted editing. Product behaviour is defined in **`CYNDA_DOCUMENTATION.md`**.
