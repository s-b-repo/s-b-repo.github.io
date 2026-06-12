# SID — Security Innovation &amp; Development (website)

A fast, static, SEO-optimised site for **SID — Security Innovation & Development**,
the offensive-security practice of Stephan Botes. No build step, no dependencies —
plain HTML/CSS/JS that drops straight onto **GitHub Pages**.

```
.
├── index.html            # home (semantic HTML + full meta/JSON-LD)
├── facts.html            # "The Current Cyber Struggle" — industry problems + submit form
├── assets/
│   ├── styles.css        # all styling (dark "tactical" theme; shared by both pages)
│   ├── main.js           # reveals, mobile nav, terminal typing, mailto forms
│   ├── favicon.svg       # reticle monogram
│   ├── og-image.png      # 1200×630 social share card (+ og-image.svg source)
│   └── stephan-botes.jpg # about photo
├── robots.txt
├── sitemap.xml
├── .nojekyll             # serve files as-is (skip Jekyll)
├── CNAME.example         # rename to CNAME for a custom domain
└── README.md
```

---

## 1. Deploy to GitHub Pages (5 minutes)

1. Create a new repository, e.g. **`s-b-repo/stephanbotes-site`**
   (or name it **`s-b-repo.github.io`** to serve at the root domain).
2. Put these files in the repo root and push:
   ```bash
   cd stephan-botes-security
   git init && git add . && git commit -m "Launch security site"
   git branch -M main
   git remote add origin https://github.com/s-b-repo/stephanbotes-site.git
   git push -u origin main
   ```
3. On GitHub: **Settings → Pages → Build and deployment → Source: “Deploy from a
   branch” → Branch: `main` / `(root)` → Save.**
4. Your site goes live in ~1 minute at
   `https://s-b-repo.github.io/stephanbotes-site/`
   (or `https://s-b-repo.github.io/` if you used the `*.github.io` repo name).

### Custom domain (optional, recommended for SEO/branding)
1. Buy a domain (e.g. `stephanbotes.dev`).
2. `mv CNAME.example CNAME` and put your bare domain inside it.
3. In your DNS, add the GitHub Pages records (A records to GitHub's IPs +
   a `www` CNAME to `s-b-repo.github.io`) — see GitHub's
   *“Managing a custom domain”* docs.
4. Settings → Pages → Custom domain → enter the domain → **Enforce HTTPS**.

---

## 2. ⚠️ Set your real URL (do this once)

The SEO tags use the placeholder **`https://stephanbotes.dev`**. Replace it with
your real URL in three files so Open Graph, canonical and the sitemap are correct:

```bash
# from the project root — change the URL to your actual site:
grep -rl 'stephanbotes.dev' . | xargs sed -i 's#https://stephanbotes.dev#https://YOUR-REAL-URL#g'
```
Files affected: `index.html`, `sitemap.xml`, `robots.txt`.

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
2. In `index.html`, set it on the form tag:
   ```html
   <form class="contact-form card reveal" id="brief-form"
         data-endpoint="https://formspree.io/f/yourid">
   ```
That's it — `main.js` will POST submissions there as JSON and show a success message.

---

## 4. Editing content

- **Services / certifications / repos**: edit the matching `<section>` in
  `index.html` — they're plain, well-commented HTML.
- **Colours / fonts**: change the CSS variables at the top of `assets/styles.css`
  (`--acc` is the lime signal colour; fonts are loaded from Google Fonts in the
  `<head>`).
- **Social card**: edit `assets/og-image.svg` and re-export:
  ```bash
  magick -density 144 -background "#080c0e" assets/og-image.svg -resize 1200x630 assets/og-image.png
  ```

---

## 5. SEO checklist (already done ✅)

- Descriptive `<title>` + meta description + canonical
- Open Graph + Twitter Card with a 1200×630 image
- JSON-LD structured data: `Person` + `ProfessionalService` + `WebSite`
- Semantic landmarks, alt text, skip link, `aria` labels, reduced-motion support
- `robots.txt` + `sitemap.xml`
- Mobile-responsive, fast (no frameworks), accessible colour contrast

**After deploy:** test the share card at
[opengraph.xyz](https://www.opengraph.xyz/) and the structured data at
[Google's Rich Results Test](https://search.google.com/test/rich-results).

---

*Authorized testing only. All services are scoped and authorized in writing.*
