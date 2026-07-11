# Cyber Sec (website)

A fast, static, SEO-optimised site for **Cyber Sec**,
an enterprise cybersecurity firm. No build step, no dependencies —
plain HTML/CSS/JS that drops straight onto **GitHub Pages**.

```
.
├── index.html            # home (semantic HTML + full meta/JSON-LD)
├── about.html            # about the firm
├── services.html         # service catalogue
├── contact.html          # contact page
├── resources.html        # resources & insights
├── article-*.html        # 12 full resource articles
├── assets/
│   ├── styles.css        # all styling (dark "tactical" theme)
│   ├── main.js           # reveals, mobile nav, terminal typing, mailto forms
│   ├── favicon.svg       # favicon
│   └── og-image.png      # 1200×630 social share card
├── robots.txt
├── sitemap.xml
├── .nojekyll             # serve files as-is (skip Jekyll)
├── CNAME.example         # rename to CNAME for a custom domain
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

## 5. SEO checklist (already done)

- Descriptive `<title>` + meta description + canonical
- Open Graph + Twitter Card with a 1200x630 image
- JSON-LD structured data: `Organization` + `ProfessionalService` + `WebSite`
- Semantic landmarks, alt text, skip link, `aria` labels, reduced-motion support
- `robots.txt` + `sitemap.xml`
- Mobile-responsive, fast (no frameworks), accessible colour contrast

**After deploy:** test the share card at
[opengraph.xyz](https://www.opengraph.xyz/) and the structured data at
[Google's Rich Results Test](https://search.google.com/test/rich-results).

---

*Authorized testing only. All services are scoped and authorized in writing.*
