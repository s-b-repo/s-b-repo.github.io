# Cyber Sec (website)

A fast, static, SEO-optimised site for **Cyber Sec**,
an enterprise cybersecurity firm. No build step, no dependencies —
plain HTML/CSS/JS that drops straight onto **GitHub Pages**.

```
.
├── index.html            # home — services, case studies, open-source proof, FAQ
├── about.html            # about the practice
├── services.html         # service catalogue
├── store.html            # productized tooling & engagements
├── contact.html          # contact page
├── resources.html        # resources & insights
├── facts.html            # "current cyber struggle" + submission form
├── article-*.html        # 12 full resource articles
├── 404.html              # GitHub Pages custom 404 (noindex, absolute asset paths)
├── assets/
│   ├── styles.css        # all styling (dark "tactical" theme)
│   ├── main.js           # canvases, reveals, mobile nav, terminal typing, forms
│   ├── favicon.svg       # favicon
│   └── og-image.png      # 1200×630 social share card
├── .well-known/
│   └── security.txt      # RFC 9116 disclosure policy — keep Expires in the future
├── robots.txt
├── sitemap.xml           # must list every indexable page (19 URLs)
├── .nojekyll             # serve files as-is (skip Jekyll)
├── CNAME                 # custom domain
├── CNAME.example
├── LICENSE               # MIT
└── README.md
```

---

## 1. Deploy to GitHub Pages (5 minutes)

1. Create a new repository for your site.
2. Put these files in the repo root and push:
   ```bash
   git init && git add . && git commit -m "Launch site"
   git branch -M main
   git remote add origin https://github.com/YOUR-ORG/YOUR-REPO.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: "Deploy from a
   branch" → Branch: `main` / `(root)` → Save.**
4. Your site goes live in ~1 minute.

### Custom domain (optional, recommended for SEO/branding)
1. Buy a domain (e.g. `cybersec.org.za`).
2. `mv CNAME.example CNAME` and put your bare domain inside it.
3. In your DNS, add the GitHub Pages records (A records to GitHub's IPs +
   a `www` CNAME to your GitHub Pages domain) — see GitHub's
   *"Managing a custom domain"* docs.
4. Settings → Pages → Custom domain → enter the domain → **Enforce HTTPS**.

---

## 2. Set your real URL (do this once)

The SEO tags use **`https://cybersec.org.za`**. If you deploy to a
different domain, replace it in all files:

```bash
# from the project root — change the URL to your actual site:
grep -rl 'cybersec.org.za' . | xargs sed -i 's#https://cybersec.org.za#https://YOUR-REAL-URL#g'
```

Then submit the site to **Google Search Console** and **Bing Webmaster Tools**
and add the sitemap (`/sitemap.xml`) for indexing.

---

## 3. Contact form

By default the form **opens the visitor's email app** with a pre-filled message
to `stephanbotesIT@proton.me` — works instantly on GitHub Pages with no backend.

Want submissions delivered without the visitor needing an email client? Wire up a
free form backend (no server required):

1. Create a free form at **[Formspree](https://formspree.io)** or
   **[Web3Forms](https://web3forms.com)** and copy your endpoint URL.
2. In each page's form tag, set the `data-endpoint` attribute:
   ```html
   <form class="contact-form card reveal" id="brief-form"
         data-endpoint="https://formspree.io/f/yourid">
   ```
That's it — `main.js` will POST submissions there as JSON and show a success message.

---

## 4. Editing content

- **Services / solutions / about**: edit the matching `<section>` in each HTML
  file — they're plain, well-commented HTML.
- **Colours / fonts**: change the CSS variables at the top of `assets/styles.css`
  (`--acc` is the accent colour; fonts are loaded from Google Fonts in the
  `<head>`).
- **Social card**: edit the source SVG and re-export:
  ```bash
  magick -density 144 -background "#080c0e" assets/og-image.svg -resize 1200x630 assets/og-image.png
  ```

---

## 5. Things that will silently rot

A few files carry values that go stale and produce no error when they do:

- **`.well-known/security.txt` → `Expires:`** — an expired `security.txt` is treated as
  invalid by tooling. Bump it once a year.
- **`sitemap.xml`** — hand-maintained. Adding a page without adding a `<url>` entry is
  invisible until you notice the page never gets indexed (`facts.html` was missing this way).
  Quick check: `ls *.html | wc -l` should equal `grep -c '<url>' sitemap.xml` + 1 for `404.html`.
- **The FAQ on `index.html`** exists twice — once as visible `<details>` markup and once as
  `FAQPage` JSON-LD. Google requires the answers to be visible on the page, so **edit both
  or neither**.
- **Nav breakpoint** — `900px` in `assets/styles.css` and `(min-width: 901px)` in
  `assets/main.js` must stay in step, or the hamburger and the desktop nav disagree.
- **The `lite` device gate** in `assets/main.js` and the `@media (pointer:coarse) and
  (max-width:1023px)` rule hiding `#bg-canvas` describe the same set of devices. Change one
  and change the other, or phones will composite a full-screen canvas nothing draws to.

---

## 6. Security headers

GitHub Pages cannot send response headers, so every page carries a
`<meta http-equiv="Content-Security-Policy">` instead. It allows only same-origin scripts,
Google Fonts for CSS/fonts, and `formspree.io` / `api.web3forms.com` for form POSTs.

**If you add a third-party script, widget, or analytics tag, it will be blocked until you add
its origin to the CSP in every HTML file.** `frame-ancestors` is deliberately absent — it is
ignored in a `<meta>` tag and only logs a console warning; clickjacking protection needs a real
header, which means moving off Pages or putting a CDN in front.

### Cloudflare Web Analytics

The domain sits behind Cloudflare, which injects its Web Analytics beacon into HTML
responses. The beacon is not in this repo — it appears at the edge — so it broke silently
the moment the CSP went in. Two origins are allowed for it:

- `https://static.cloudflareinsights.com` in `script-src` — the loader
- `https://cloudflareinsights.com` in `connect-src` — where the RUM payload is POSTed

If you turn Web Analytics off in the Cloudflare dashboard, remove both again. Note the
tradeoff is smaller than it looks: Cloudflare already terminates TLS for the whole site and
therefore already sees every visitor, so the beacon discloses nothing to a party that did not
already have it. That is *not* true of Google Fonts, which is a separate origin getting data
it would otherwise never see.

---

## Fonts

Self-hosted from `assets/fonts/`, declared by the `@font-face` block at the top of
`assets/styles.css`. Nothing is fetched from Google — `fonts.googleapis.com` and
`fonts.gstatic.com` are gone from both the markup and the CSP.

**IBM Plex Sans and JetBrains Mono are variable fonts.** Google returns the *same file* for
every weight you ask for, so one file each covers the whole axis (`font-weight: 100 700` and
`400 800` respectively). Requesting three weights of each naively yields three identical
45KB and 31KB files — 150KB of pure duplication. Chakra Petch is static, hence two files.
Chakra Petch 500 was in the old URL but used nowhere, so it is not shipped.

To regenerate (e.g. to add a weight), fetch the CSS with a modern browser UA so Google
serves woff2, keep only the `latin` `@font-face` blocks, download those URLs into
`assets/fonts/`, and **checksum the results before adding new `@font-face` rules** — matching
md5s mean it is one variable font, not several static ones.

Deliberately *not* done: subsetting to only the glyphs the site currently uses. Measured at
just 14% (94.7KB → 81.0KB) and it makes the fonts silently break on any character future copy
introduces. Not worth it.

---

## 7. SEO checklist (already done)

- Descriptive `<title>` + meta description + canonical
- Open Graph + Twitter Card with a 1200x630 image
- JSON-LD structured data: `Organization` + `ProfessionalService` + `WebSite`
- Semantic landmarks, alt text, skip link, `aria` labels, reduced-motion support
- Custom `404.html`, `security.txt`, CSP + referrer policy, AA colour contrast
- `robots.txt` + `sitemap.xml`
- Mobile-responsive, fast (no frameworks), accessible colour contrast

**After deploy:** test the share card at
[opengraph.xyz](https://www.opengraph.xyz/) and the structured data at
[Google's Rich Results Test](https://search.google.com/test/rich-results).

---

*Authorized testing only. All services are scoped and authorized in writing.*
