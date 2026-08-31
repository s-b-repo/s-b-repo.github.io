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
├── article-*.html        # 13 full resource articles
├── research.html          # research & technical reports index
├── research-*.html        # research reports (browser editions)
├── papers/                # downloadable report PDFs
├── 404.html               # GitHub Pages custom 404 (noindex, absolute asset paths)
├── assets/
│   ├── styles.css        # all styling (dark "tactical" theme)
│   ├── main.js           # canvases, reveals, mobile nav, terminal typing, forms
│   ├── favicon.svg       # favicon
│   ├── fonts/            # self-hosted woff2 (preloaded in every page head)
│   └── og-image.png      # 1200×630 social share card
├── .well-known/
│   └── security.txt      # RFC 9116 disclosure policy — keep Expires in the future
├── robots.txt
├── feed.xml              # Atom feed — pinged by readers; update when adding an article
├── sitemap.xml           # must list every indexable page (25 URLs incl. feed.xml)
├── d36cc885471936f7a89115da13f8df68.txt   # IndexNow key file (see §9)
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
  Quick check: `grep -c '<url>' sitemap.xml` should equal `ls *.html | wc -l` − 5 (the noindex
  `404.html` + the four noindex legal pages) **+ 1** for `feed.xml` **+ 1** per paper PDF
  listed (the root URL stands in for `index.html`). Today: 31 − 5 + 2 = 28.
- **The FAQ on `index.html`** exists twice — once as visible `<details>` markup and once as
  `FAQPage` JSON-LD. Google requires the answers to be visible on the page, so **edit both
  or neither**.
- **Nav breakpoint** — `900px` in `assets/styles.css` and `(min-width: 901px)` in
  `assets/main.js` must stay in step, or the hamburger and the desktop nav disagree.
- **Asset stamps.** The domain is behind Cloudflare: HTML is `cf-cache-status: DYNAMIC`
  (never cached) but assets return `HIT` with `max-age=14400`. For four hours after a
  deploy, visitors otherwise get new HTML paired with old CSS/JS — which is how moving
  `@font-face` into `styles.css` briefly left the live site rendering in system fonts.
  **Run `python3 tools/stamp-assets.py` after touching anything in `assets/` and before
  committing.** It is idempotent.
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

## 7. Legal pages — INCOMPLETE, do not link publicly yet

`privacy.html` (POPIA), `terms.html` (ECTA s43), `disclosure.html`, `paia.html` (s51).

They are deliberately **`noindex`, absent from `sitemap.xml`, and not linked from the footer**,
because three facts are still placeholders. Search the pages for `legal-todo` — each renders as
a visible amber marker:

| Placeholder | Needed for |
|---|---|
| Registered company name | POPIA responsible party, ECTA s43(1)(a), PAIA head of body |
| CIPC registration number | ECTA s43(1)(f) |

The Information Officer is **not** a placeholder. POPIA defines it by reference to PAIA's
"head of a private body", which for a company is the CEO or equivalent, or whoever acts as
such — so with a single director it is Stephan Botes by operation of law, not by appointment.
No deputies are designated: POPIA s56 requires them only as far as needed to keep the body
accessible for requests, and one published address already does that.

Being the Information Officer and *registering* as one are separate. Section 55 and
Regulation 4 require registration with the Regulator via its eServices portal before taking
up the duties. **That obligation is unaffected by anything on this website.**

**To publish once those are filled:** remove the `noindex` meta from all four, add them to
`sitemap.xml`, add footer links, and run `python3 tools/stamp-assets.py`.

Two known gaps recorded on purpose:
- **No physical address.** ECTA s43(1)(c) requires one from anyone offering goods or services
  online. The pages say so openly rather than pretending otherwise.
- **Not reviewed by an attorney.** Each page carries a "not legal advice" notice.

Also confirm the current PAIA prescribed fees before relying on `paia.html` — the manual
deliberately does not quote amounts, since they are revised by regulation.

---

## 8. SEO checklist (already done)

- Descriptive `<title>` + meta description + canonical
- **hreflang cluster on every page** (`en`, `en-ZA`, `x-default`) — one URL serves
  every region; there are deliberately **no per-country doorway pages** (a Google
  manual-action magnet). Rankings abroad come from content + backlinks, not geo pages.
- Open Graph + Twitter Card with a 1200x630 image, `og:locale` + `en_US`/`en_GB` alternates
- Articles carry `article:published_time` and `BreadcrumbList`; store pages carry
  `Product` + `Offer` (real prices) + `BreadcrumbList`. **Never add `aggregateRating`
  without real reviews** — fabricated ratings are a structured-data spam penalty.
- Atom feed (`feed.xml`) linked from every page head
- Font preloads (Chakra Petch 600/700 + IBM Plex Sans) for faster text render
- JSON-LD structured data: `Organization` + `ProfessionalService` + `WebSite` + `FAQPage`
- Semantic landmarks, alt text, skip link, `aria` labels, reduced-motion support
- Custom `404.html`, `security.txt`, CSP + referrer policy, AA colour contrast
- `robots.txt` + `sitemap.xml`
- Mobile-responsive, fast (no frameworks), accessible colour contrast

**After deploy:** test the share card at
[opengraph.xyz](https://www.opengraph.xyz/) and the structured data at
[Google's Rich Results Test](https://search.google.com/test/rich-results).

---

## 9. Search-engine handoff (one-time + per-deploy)

Ranking abroad is won outside this repo: verified consoles, sitemap submission, and
backlinks from real sites. The markup here only makes the site *eligible*.

**One-time (do after first deploy):**

1. **Google Search Console** — [search.google.com/search-console](https://search.google.com/search-console)
   → add `cybersec.org.za` (Domain property, DNS TXT verification) → Sitemaps → submit `sitemap.xml`.
2. **Bing Webmaster Tools** — [bing.com/webmasters](https://www.bing.com/webmasters)
   → "Import from Google Search Console" (covers DuckDuckGo + Yahoo too) → submit `sitemap.xml`.
3. **Yandex Webmaster** — [webmaster.yandex.com](https://webmaster.yandex.com) — dominant in Russia/CIS.
4. **Seznam** — [search.seznam.cz/webmaster](https://search.seznam.cz/webmaster/) (Czechia).
5. **Naver Search Advisor** — [searchadvisor.naver.com](https://searchadvisor.naver.com) (South Korea).
6. Add **hreflang coverage** check: after indexing, spot-check
   `site:cybersec.org.za` from a few countries' Google domains to confirm serving.

**Every deploy that adds/changes a page — IndexNow ping (Bing/Yandex/Seznam/Naver):**

```bash
curl -s "https://api.indexnow.org/indexnow?url=https%3A%2F%2Fcybersec.org.za%2F&key=d36cc885471936f7a89115da13f8df68"
```

The key file `d36cc885471936f7a89115da13f8df68.txt` must stay in the repo root — search
engines fetch it to verify pings. To notify multiple changed URLs at once, POST a JSON
list to `api.indexnow.org/IndexNow.json` (see indexnow.org docs). Do not ping more than
needed; repeated pings of unchanged URLs is exactly the kind of behaviour that gets a
host rate-limited.

**When adding an article:** add its `<url>` to `sitemap.xml`, add an `<entry>` to
`feed.xml` (newest-first — bump the feed's top `<updated>`), and ping IndexNow once.

---

*Authorized testing only. All services are scoped and authorized in writing.*
