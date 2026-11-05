# hadeerhanafy.com

Hadeer Hanafy's portfolio — live at https://hadeerhanafy.com, deployed on
Vercel from `main` (no build step; the repo root is served as-is).

## Layout

- `index.html` — English page: markup and one small inline bootstrap script
- `ar/index.html` — Arabic page (served at `/ar`, `lang="ar" dir="rtl"`). Same structure and ids as
  `index.html`, so any markup or copy change must be made in **both** files. Language switch is the
  `.lang` link in the header; `hreflang` alternates are in both heads and in `sitemap.xml`
- `styles.css` — all styles, shared by both pages. The `[dir="rtl"]` block at the end holds the Arabic
  overrides (Cairo font, zero letter-spacing, mirrored positions)
- `app.js` — all behaviour (character sprite loop, scroll reveals, work grid,
  process panel, booking modal, video lightbox). Strings are English; on the Arabic page
  `i18n-ar.js` (loaded first) sets `window.HH_AR` with the Arabic UI strings and film texts
- `i18n-ar.js` — Arabic strings for everything `app.js` renders (cards, filters, form messages, summary)
- `fx.js` — the motion layer, hand-written WebGL with no libraries: polished gold spheres in
  real perspective (they dodge the cursor, shift with parallax and speed up as you scroll),
  the hero's 3D parallax (character and headline) and the card tilt. Respects
  `prefers-reduced-motion` (draws once, then stays still)
- `assets/` — character sprite sheet, portraits, film stills (`w*-poster.webp`, 640x800,
  cut from each film at full resolution), films (`w*.mp4`, web-encoded, faststart), social card
- `assets/fonts/` — Archivo, Inter and Cairo as `woff2`, served from this site (`@font-face` at the top of `styles.css`)
- `vercel.json` — security headers, CSP, caching
- `tools/security-check.py` — guardrail for the rules below (stdlib only). Run `python3 tools/security-check.py`
  before every push; `.github/workflows/security-check.yml` runs it on GitHub for every push and pull request
- `.well-known/security.txt` — where researchers can report a problem

## Security rules — apply to every change

These are standing requirements from the owner. Treat them as non-negotiable.

**In force now**

1. **Secrets never enter the repo.** `.env` and key files are gitignored. Keys
   and tokens live only in Vercel environment variables. Never inline a secret
   in `index.html`, `app.js`, or any committed file.
2. **HTTPS only.** Vercel issues and renews the certificate. `Strict-Transport-Security`
   and `upgrade-insecure-requests` are set; do not remove them.
3. **Security headers stay.** `vercel.json` sets CSP, HSTS, `X-Content-Type-Options`,
   `X-Frame-Options`, `frame-ancestors 'none'`, `Referrer-Policy`,
   `Permissions-Policy`, `Cross-Origin-Opener-Policy`.
4. **CSP uses script hashes, not `unsafe-inline`.** Any edit to an inline
   `<script>` in `index.html` or `ar/index.html` invalidates its hash — recompute the sha256 of each
   inline script body and update `script-src` in `vercel.json` in the same commit,
   or the page silently stops working. Prefer putting new code in `app.js`.
5. **No inline event handlers** (`onclick=`, `onerror=`, …) and no `style=`
   attributes — both are blocked by CSP and neither is needed.
6. **Render user-supplied text with `textContent`, never `innerHTML`.** This is
   how the booking form already builds its summary; keep it that way.
7. **No third-party anything.** Scripts, styles, fonts and images all come from this
   site; the CSP lists no outside host (fonts were moved off Google Fonts on purpose).
   Adding analytics, a widget, a CDN or a font host means widening CSP — ask first.
8. **Zero runtime dependencies.** The site ships no npm packages, so there is no
   dependency tree to patch. Keep it that way unless there is a real reason.
9. **Directory listing is off** (Vercel default) and build/runtime errors are
   never rendered to the visitor.

**Required before the booking database and admin page ship**

10. **Server-side validation.** Validate and length-cap every field on the server
    (or in a Postgres constraint). Client-side checks are for UX only.
11. **Parameterized queries only.** Use the Supabase client / prepared statements.
    Never concatenate values into SQL.
12. **Row Level Security on.** `bookings` is insert-only for anonymous visitors;
    reads are restricted to the owner's authenticated account.
13. **Rate limiting.** On the booking endpoint and, harder, on admin login —
    plus a Captcha (or equivalent bot check) on the public form.
14. **Hashed passwords.** Never store or compare a password directly; use
    Supabase Auth, which hashes with bcrypt. Strong password + 2FA on the admin
    account.
15. **CORS allowlist.** Only `https://hadeerhanafy.com` may call the API.
16. **Errors are logged server-side only.** The visitor sees a generic message;
    stack traces, SQL and keys never reach the browser.
17. **The owner's phone number stays off the public page.** WhatsApp is a
    `wa.me` link with the label "Message me" — never rendered as text.

## Deploying

1. Run `python3 tools/security-check.py` (it must pass) and test the page locally.
2. Push to `main`. Vercel builds and promotes to `hadeerhanafy.com` automatically.
3. Check the deployment reaches `READY` in Vercel.

Files under `/assets/` are cached as immutable for a year: a changed asset needs a **new file name**.

## Where everything lives (no secrets here, ever)

This section is the memory of the setup, so a new session or a new chat knows it without asking.
Passwords, recovery codes and authenticator seeds are **never** written in this repo; the owner keeps them herself.

- **Domain** `hadeerhanafy.com` is registered with **Cloudflare Registrar**, not Vercel (Vercel's Domains page says
  "registered with a third party"; the site's A record points at Vercel). Registered on 2026-10-06 for one year, **through
  2027-10-06**. Cloudflare's own email says it renews 30 days before expiry *if auto-renew is on*, and a second email five
  minutes after the purchase says **auto-renew was disabled**: the owner must switch it back on in the Cloudflare dashboard
  (Domain Registration → Manage Domains → hadeerhanafy.com) or renew by hand before 2027-10-06. Update this line once done.
  Expiry, auto-renew, lock and nameservers live in that Cloudflare account, which needs two-factor sign-in too.
  `www.hadeerhanafy.com` redirects (308) to the bare domain. HTTPS certificates are issued and renewed by Vercel (renewal "Auto").
- **Hosting** Vercel project `hadeerhanafy` (id `prj_eQppw1Um6uygHoRN8rgEjaPb2Qx9`), no framework, no build step.
  Production deploys from `main` of the GitHub repo.
- **Code** GitHub `hadeerhanafy17-ui/hadeerhanafy-site` (public). Secret scanning and push protection are on.
  Two-factor sign-in is on for the GitHub account. Still to be done by the owner in the GitHub web UI:
  protect `main` against force-push and deletion, and turn on private vulnerability reporting.
- **Contact** Instagram `@hadeerhanafy17`, email on the page, WhatsApp through a `wa.me` link only (rule 17).
- Claude Code sessions cannot open `hadeerhanafy.com`, change GitHub repo settings, or read the domain registration;
  they can read Vercel deployments. Verify the live site from a phone.
- The Arabic page lives at `/ar` and must be kept in step with `index.html` (same ids, same sections).
