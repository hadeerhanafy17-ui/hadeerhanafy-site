#!/usr/bin/env python3
"""Guardrail for the standing security rules in CLAUDE.md. Standard library only.
Run it before every push:  python3 tools/security-check.py
It also runs on GitHub for every push and pull request. Exit code 1 = something is wrong."""
import base64, hashlib, json, os, re, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
os.chdir(ROOT)
problems = []
def bad(msg): problems.append(msg)

def read(p):
    with open(p, encoding='utf-8') as f: return f.read()

tracked = subprocess.run(['git', 'ls-files'], capture_output=True, text=True).stdout.split()
pages = [p for p in tracked if p.endswith('.html')]
code = [p for p in tracked if p.endswith(('.html', '.js', '.css', '.json', '.txt', '.xml', '.md', '.py', '.yml'))]

# 1. headers (rules 2-4)
cfg = json.loads(read('vercel.json'))
hdr = {h['key']: h['value'] for r in cfg['headers'] if r['source'] == '/(.*)' for h in r['headers']}
for k in ['Content-Security-Policy', 'Strict-Transport-Security', 'X-Content-Type-Options', 'X-Frame-Options', 'Referrer-Policy',
          'Permissions-Policy', 'Cross-Origin-Opener-Policy']:
    if k not in hdr: bad(f'vercel.json: header {k} is missing (rule 3)')
csp = hdr.get('Content-Security-Policy', '')
def directive(name):
    m = re.search(r'(?:^|;)\s*' + name + r'\s+([^;]*)', csp); return m.group(1) if m else ''
for need in ['frame-ancestors', 'object-src', 'base-uri', 'form-action', 'upgrade-insecure-requests']:
    if need not in csp: bad(f'CSP: {need} is missing')
if re.search(r"'unsafe-(inline|eval)'", directive('script-src')): bad("CSP: script-src must not allow 'unsafe-inline' or 'unsafe-eval' (rule 4)")
if "'unsafe-inline'" in directive('style-src'): bad("CSP: style-src must not allow 'unsafe-inline'")
if 'preload' not in hdr.get('Strict-Transport-Security', '') and 'max-age' not in hdr.get('Strict-Transport-Security', ''): bad('HSTS looks wrong')
for d in ('script-src', 'style-src', 'font-src', 'img-src', 'connect-src', 'media-src'):
    for src in directive(d).split():
        if src.startswith('http'): bad(f'CSP: {d} allows an outside host {src}. Rule 7: ask the owner first')

# 2. inline scripts must match the CSP hashes exactly (rule 4)
hashes = set(re.findall(r"'sha256-([A-Za-z0-9+/=]+)'", directive('script-src')))
used = set()
for p in pages:
    for m in re.finditer(r'<script(?![^>]*\bsrc=)([^>]*)>(.*?)</script>', read(p), re.S):
        if 'ld+json' in m.group(1): continue
        h = base64.b64encode(hashlib.sha256(m.group(2).encode()).digest()).decode(); used.add(h)
        if h not in hashes: bad(f'{p}: an inline script has hash sha256-{h} which is not in the CSP (the page would stop working)')
for h in hashes - used: bad(f'CSP: script hash sha256-{h[:12]}… is not used by any inline script (remove it)')

# 3. forbidden code patterns (rules 5-7)
rules = [(r'\son[a-z]+\s*=\s*["\']', 'inline event handler (rule 5)', pages), (r'<[^>]+\sstyle\s*=', 'style= attribute (rule 5)', pages),
         (r'\.(innerHTML|outerHTML)\s*[=+]|insertAdjacentHTML|document\.write\(', 'unsafe HTML sink (rule 6)', ['app.js', 'fx.js', 'i18n-ar.js']),
         (r'\beval\(|new Function\(', 'eval / new Function', ['app.js', 'fx.js', 'i18n-ar.js']),
         (r'<script[^>]+src=["\']https?:', 'third-party script (rule 7)', pages), (r'<link[^>]+href=["\']https?://[^"\']*\.(css|js)', 'third-party stylesheet (rule 7)', pages),
         (r'<link[^>]+href=["\']https://fonts\.', 'third-party font host (fonts are self-hosted)', pages)]
for rx, label, files in rules:
    for p in files:
        if p in tracked and re.search(rx, read(p)): bad(f'{p}: {label}')
for p in pages:
    for m in re.finditer(r'<a\b[^>]*target="_blank"[^>]*>', read(p)):
        if 'noopener' not in m.group(0): bad(f'{p}: target="_blank" without rel="noopener": {m.group(0)[:70]}')
    if re.search(r'(?:src|href)=["\']http://', read(p)): bad(f'{p}: plain http:// link (rule 2)')

# 4. secrets and sensitive files (rule 1)
for p in tracked:
    if re.search(r'(^|/)(\.env(\..*)?|.*\.(pem|key|p12|pfx))$', p) and not p.endswith('.env.example'): bad(f'{p}: sensitive file is tracked (rule 1)')
secret = re.compile(r'AKIA[0-9A-Z]{16}|gh[pousr]_[A-Za-z0-9]{30,}|sk-[A-Za-z0-9_-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|eyJhbGciOi[A-Za-z0-9_-]{20,}|xox[baprs]-[A-Za-z0-9-]{10,}')
for p in code:
    if p == 'tools/security-check.py': continue
    if secret.search(read(p)): bad(f'{p}: looks like a secret or token (rule 1)')

# 5. the owner's phone number only inside wa.me links (rule 17)
for p in code:
    t = re.sub(r'https://wa\.me/\d+', '', read(p))
    if re.search(r'\+?20\s?1\d{2}[\s-]?\d{3}[\s-]?\d{4}|01\d{9}|201\d{9}', t): bad(f'{p}: a phone number is written as text (rule 17)')

# 6. every local file that a page, script or stylesheet points to must exist
for p in pages + ['app.js', 'i18n-ar.js', 'styles.css']:
    for ref in set(re.findall(r'[("\'=]\s*/(assets/[^"\')\s?#]+|[A-Za-z0-9_.-]+\.(?:js|css))', read(p))):
        if not os.path.exists(ref): bad(f'{p}: points to /{ref} which does not exist')

# 7. the English and Arabic pages must keep the same structure
ids = lambda p: sorted(set(re.findall(r'\sid="([^"]+)"', read(p))))
if 'index.html' in pages and 'ar/index.html' in pages and ids('index.html') != ids('ar/index.html'):
    bad('index.html and ar/index.html have different element ids: ' + ', '.join(sorted(set(ids('index.html')) ^ set(ids('ar/index.html')))))

if problems:
    print('SECURITY CHECK FAILED'); [print(' -', m) for m in problems]; sys.exit(1)
print(f'Security check passed ({len(pages)} pages, {len(code)} text files, {len(tracked)} tracked files).')
