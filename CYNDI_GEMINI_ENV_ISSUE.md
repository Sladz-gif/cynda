# Cyndi / Gemini “API not connected” environment issue

## Symptoms

- Cyndi replies with a message like: *Cyndi can’t reach the AI service yet…* or the generic *I hit a snag…* fallback.
- The in-app copy may mention **`VITE_GEMINI_API_KEY`** even if you already added a key to `.env`.
- The browser **does not** read `.env` at runtime; the key must be present when **Vite starts** (dev or build) so it can be baked into the client bundle.

## Root causes (historical and current)

### 1. Wrong variable name (`VITE_` prefix)

Vite only exposes variables whose names start with **`VITE_`** to client code via `import.meta.env`.

If `.env` contains only:

```env
GEMINI_API_KEY=...
```

then `import.meta.env.VITE_GEMINI_API_KEY` and `import.meta.env.GEMINI_API_KEY` are **not** available in the browser bundle by default. The app used to look only at `VITE_GEMINI_API_KEY`, so the key appeared “missing” even though it was in `.env`.

**Mitigation in this repo:** `vite.config.ts` uses `loadEnv()` and injects either:

- `VITE_GEMINI_API_KEY`, or  
- `GEMINI_API_KEY`  

into the client via `define` as **`__CYNDA_GEMINI_KEY__`**, and `src/lib/gemini.ts` reads that first.

**Recommended:** still use `VITE_GEMINI_API_KEY` in `.env` for consistency with other Vite variables.

### 2. Secrets in `.env.example` instead of `.env`

- **`.env`** — local secrets, listed in `.gitignore`; this is where real keys belong.  
- **`.env.example`** — template only; safe to commit; must use placeholders, not real keys.

Putting a real key only in `.env.example` does not configure the app correctly and risks leaking the key if that file is committed.

### 3. Dev server not restarted after changing `.env`

Vite reads environment files when the dev server **starts**. After editing `.env`, stop the process and run `npm run dev` again (this project uses **port 8080** by default).

### 4. Wrong URL or stale bundle

- Use the dev server URL Vite prints (e.g. `http://localhost:8080/`), not an old tab, `file://`, or a hosted preview of an old `dist/` build.  
- Hard refresh: **Ctrl+Shift+R** (Windows) after restarting Vite.

### 5. `vite.config` `define` vs `import.meta.env`

Overriding `import.meta.env.VITE_*` with `define` can conflict with Vite’s own env handling. This project injects the Gemini key via a dedicated global: **`__CYNDA_GEMINI_KEY__`**, set in `vite.config.ts`.

### 6. Cyndi request pipeline (separate bug, fixed earlier)

An earlier bug sent `[USER_QUERY]` with **no user text** and invalid chat history. That caused failures even when the API key worked. The current `callCyndi` / `buildCyndiGeminiPayload` flow in `src/lib/gemini.ts` is intended to send the real user message and valid Gemini history.

If the key is loaded but requests still fail, check the browser **Network** tab for calls to Google’s Generative Language API and read the error status/body (quota, billing, model name, CORS, etc.).

## Correct `.env` setup (project root)

File location: **same folder as `package.json` and `vite.config.ts`**.

Either (or both) is supported by current `vite.config.ts`:

```env
VITE_GEMINI_API_KEY=your_key_here
```

```env
GEMINI_API_KEY=your_key_here
```

Rules:

- No spaces around `=` unless the value is quoted.  
- No quotes needed for a simple key string.  
- Save as UTF-8; avoid a BOM breaking the first line if your editor adds one.

## Verification checklist

1. `.env` exists at the **project root** (not only `.env.example`).  
2. Line present: `VITE_GEMINI_API_KEY=...` and/or `GEMINI_API_KEY=...`.  
3. Run **`npm run dev`** from the **cynda** project root after any `.env` change.  
4. Open **`http://localhost:8080/`** (see `vite.config.ts` `server.port`).  
5. In DevTools → **Console**, if the key is still missing you should see:  
   `Gemini API key missing. Set VITE_GEMINI_API_KEY or GEMINI_API_KEY...`  
6. If the key is present but Cyndi errors, check **Network** for the Gemini request and response.

## If it still fails after the checklist

Collect and attach (redact secrets):

- Exact Cyndi error text shown in the UI.  
- Console warnings/errors.  
- One failed network request to `generativelanguage.googleapis.com` (status + response body if any).  
- Confirm: `node -v`, `npm run dev` run from which directory, and full URL in the browser address bar.

Possible non-env causes:

- API key restricted (e.g. wrong referrer / IP) in Google AI Studio.  
- Quota or billing.  
- Model id not available for that key (`gemini-2.0-flash` with fallback to `gemini-1.5-flash` in `gemini.ts`).

## Security note

Any key embedded in the **frontend** bundle can be extracted from JavaScript or the network tab. For production, prefer a **small backend or serverless proxy** that holds the key and calls Gemini; restrict keys in Google AI Studio when testing on `localhost`.

## Related files

| File | Role |
|------|------|
| `vite.config.ts` | `loadEnv`, `envDir`, `define.__CYNDA_GEMINI_KEY__` |
| `src/lib/gemini.ts` | Reads `__CYNDA_GEMINI_KEY__` and initializes `GoogleGenerativeAI` |
| `.env` | Local secrets (gitignored) |
| `.env.example` | Template only |

---

*Last updated to match the Cynda codebase behavior; adjust this doc if env or Vite config changes.*
