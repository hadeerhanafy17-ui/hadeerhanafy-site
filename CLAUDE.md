# hadeerhanafy.com

Hadeer Hanafy's portfolio — live at https://hadeerhanafy.com, deployed on
Vercel from `main` (no build step; the repo root is served as-is).

## Layout

- `index.html` — markup, styles, and one small inline bootstrap script
- `app.js` — all behaviour (character sprite loop, scroll reveals, work grid,
  process panel, booking modal, video lightbox)
- `assets/` — character sprite sheet, portraits, film loops (`w*-loop.webp`),
  films (`w*.mp4`), social card
- `vercel.json` — security headers, CSP, caching

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
   `<script>` in `index.html` invalidates its hash — recompute the sha256 of each
   inline script body and update `script-src` in `vercel.json` in the same commit,
   or the page silently stops working. Prefer putting new code in `app.js`.
5. **No inline event handlers** (`onclick=`, `onerror=`, …) and no `style=`
   attributes — both are blocked by CSP and neither is needed.
6. **Render user-supplied text with `textContent`, never `innerHTML`.** This is
   how the booking form already builds its summary; keep it that way.
7. **No third-party scripts.** Only Google Fonts (CSS + font files) is allowed
   off-origin, and only because CSP lists those two hosts. Adding an analytics or
   widget script means widening CSP — ask first.
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

Push to `main`. Vercel builds and promotes to `hadeerhanafy.com` automatically.
