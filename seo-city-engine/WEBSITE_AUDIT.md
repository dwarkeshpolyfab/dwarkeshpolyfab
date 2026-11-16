# Comprehensive Technical Website Audit
**Website:** [https://www.dwarkeshpolyfab.com/](https://www.dwarkeshpolyfab.com/)  
**Company:** Dwarkesh Polyfab  
**Location:** Morbi-Halwad Road, Nichimandal, Morbi, Gujarat - 363641, India  
**Industry:** PP (Polypropylene) & BOPP Woven Packaging Manufacturing  
**Brand Identity:** Deep Blue (`#112A46`), Gold (`#D4AF37` / `#C9A64B`), Font: Poppins  
**Audit Date:** November 15, 2026  
**Auditor:** Technical SEO Architect & B2B Industrial Strategist  

---

## 1. Executive Summary

Dwarkesh Polyfab is a direct factory manufacturer of PP woven bags and BOPP laminated bags situated in Morbi, Gujarat—the manufacturing epicenter of ceramic, agro-commodity, and chemical packaging in western India. 

The website operates on a **high-speed static architecture** (HTML5, CSS3, vanilla JavaScript) hosted via a GitHub repository (`dwarkeshpolyfab/dwarkeshpolyfab`) and deployed through Vercel's Edge Network. 

### Key Audit Findings:
1. **Strengths:**
   - Ultra-fast Time-to-First-Byte (TTFB) and high Core Web Vitals performance due to static HTML files.
   - Rich internal industrial logic already coded in `calculators/rates.js` and `calculators/calculator-core.js` (accurate polymer base rates, coating grams, film micron weights, and fabrication margins).
   - High-quality, original product images (`.webp` format) and verified manufacturing specifications.
   - Clean, crawlable breadcrumb structures and responsive mobile design.

2. **Critical Deficiencies & Technical Bottlenecks:**
   - **Fragmented Location Strategy:** 11 location-targeted pages were previously created under the `/blog/` folder with inconsistent naming (`pp_bag_in_MUMBAI.html` with uppercase letters and underscores vs `pp-bag-in-surat.html` with hyphens). This dilutes topical authority and mixes commercial transactional intent with informational blog content.
   - **Tracking & Analytics Disconnect:** Google Tag Manager (`GTM-5B5HNFFQ`) is active on only 15 sub-pages and is **missing from 47 pages, including the homepage (`index.html`)**! Microsoft Clarity (`xobm18n8i7`) is only installed on 2 pages (`index.html` and `products/index.html`).
   - **Schema Gaps:** 14 public pages completely lack JSON-LD structured data, and 2 pages (`products/jumbo-bags.html` and `blog/capsacks-packaging-bags.html`) have residual double-angle brackets (`>>`) in their meta tag markup.
   - **Lead Capture Friction:** WhatsApp buttons currently initiate generic messages without structured product specification parameters (GSM, size, quantity, destination city, freight estimate).

---

## 2. Repository Folder & File Structure Audit

The workspace contains **177 total files**, of which **70 are HTML files**:
```
D:\dwarkeshpolyfab-main\dwarkeshpolyfab\
├── assets/
│   ├── css/
│   │   ├── style.css                 # Core design, responsive typography & theme variables
│   │   └── product-page.css          # Product grids, spec tables, breadcrumbs
│   └── images/                       # 95 WebP/PNG/SVG product & industrial assets
├── blog/                             # 35 HTML articles (informational + ad-hoc city posts)
├── calculators/                      # 2 HTML pages + 2 JS calculation engines
│   ├── bopp-bag-calculator.html     # Interactive BOPP specification calculator
│   ├── calculator-core.js            # Precise mathematical formulas for bag weight/cost
│   ├── index.html                    # PP woven bag cost calculator
│   └── rates.js                      # Centralized raw material & manufacturing rates
├── components/                       # 8 reusable HTML snippets (fetched asynchronously)
│   ├── blog-preview.html
│   ├── faq.html
│   ├── footer.html
│   ├── header.html
│   ├── hero.html
│   ├── industries.html
│   ├── products.html
│   └── whatsapp-float.html
├── industries/                       # 7 HTML sector pages (rice, fertilizer, cement, etc.)
├── pages/                            # 3 HTML corporate pages (about, contact, manufacturer-data)
├── products/                         # 14 HTML product pages (core manufacturing catalog)
├── seo-city-engine/                  # [NEW] Isolated Programmatic SEO Engine module
├── index.html                        # Global homepage
├── indexnow-submit.json              # IndexNow automated submission config
├── robots.txt                        # Search engine crawling rules
├── sitemap.xml                       # Public XML sitemap (61 URLs)
└── vercel.json                       # Deployment, 301 redirects & security headers
```

---

## 3. Detailed Component & Page Audit

### 3.1 Homepage (`index.html`)
- **Metadata:** Title is well-optimized (`PP Woven Bags & BOPP Bags Manufacturer | Dwarkesh Polyfab` - 59 chars). Meta description is 144 chars with direct call-to-action and phone number.
- **Structured Data:** Implements `@type: Organization` and `@type: WebSite` with phone and physical factory address in Morbi.
- **Hero & Content:** Includes hero slider, core product showcase, industry applications, live calculator callout banner, blog preview, and FAQ section.
- **Component Fetching:** Header, footer, and WhatsApp float are fetched via `loadComponent()` JavaScript calls into placeholder `<div>` containers. Critical fallback `<noscript>` markup is implemented.

### 3.2 Product Pages (`products/*.html` - 14 Files)
- 13 active indexable product pages + 1 legacy redirect page (`products/laminated-pp-bags.html` 301-redirects to `bopp-laminated-bags.html`).
- **Catalog Breakdown:**
  1. `pp-woven-bags.html` (Foundational product)
  2. `bopp-laminated-bags.html` (High-demand, high-margin product)
  3. `rice-packaging-bags.html` (Major seasonal agricultural volume)
  4. `tile-adhesive-bopp-bags.html` (Direct synergy with Morbi ceramic cluster)
  5. `fertilizer-bags.html` (Heavy-duty chemical & agro packaging)
  6. `cement-bags.html` (Valve and block bottom packaging)
  7. `anti-slip-bags.html` (Specialty export palletization)
  8. `ldpe-liner-bags.html` (Moisture-barrier liner bags)
  9. `leno-bags.html` (Ventilated vegetable/potato/onion packaging)
  10. `jumbo-bags.html` (FIBC bulk bags)
  11. `multicolour-pp-woven-bags.html` (High-definition flexo printed bags)
  12. `printed-pp-bags.html` (Custom brand-printed polybags)
  13. `index.html` (Category listing hub)
- **Schema Implementation:** Uses `@type: Product` with `AggregateOffer` pricing ranges (e.g. ₹8.50 - ₹35.00).

### 3.3 Calculator Subsystem (`calculators/`)
- A major competitive asset for Dwarkesh Polyfab.
- `rates.js` stores verified industrial parameters:
  - PP fabric grades: Janta (₹118), Silver (₹125), Gold (₹135), Natural (₹180).
  - Lamination: Natural (₹210), Milky (₹140).
  - Printing: One side (₹0.80), Two side (₹1.10).
  - BOPP film density (0.91), micron thickness (12µ), coating grams (0.70g), glossy (₹510) vs matt (₹560).
- `calculator-core.js` computes precise cutting length (+1 inch stitching allowance), planar bag weight, lamination weight, film weight, and liner stitching charges.

### 3.4 Blog Pages (`blog/` - 35 Files)
- Divided into two distinct categories:
  1. **Informational Guides (24 pages):** E.g. `what-is-gsm-in-pp-bags.html`, `crude-oil-to-plastic-process.html`, `how-to-order-custom-printed-bags.html`. High topical value.
  2. **Ad-hoc Location Pages (11 pages):** E.g. `pp_bag_in_MUMBAI.html`, `pp-bag-in-surat.html`, `pp-bags-pithampur.html`, `pp-bag-gondal.html`, `bulk-rice-bag-gandhidham-24x36.html`.
- **Finding:** Having location landing pages mixed inside `/blog/` under differing URL schemes creates search intent confusion. These must remain active for now to preserve established indexing, but future programmatic city pages must reside in a dedicated, clean directory structure.

### 3.5 Header & Footer Architecture
- Modular components loaded dynamically on client-side via JavaScript `fetch()`.
- Static crawler fallbacks (`<noscript>`) exist across pages to ensure link discovery for bots that do not execute JavaScript.
- Header provides direct links to Products, Calculators, Industries, Blog, Contact, and WhatsApp.
- Footer features rich internal linking to all product lines, target industries, and company registration details.

---

## 4. Technical SEO Infrastructure Audit

| Parameter | Current Status | Audit Evaluation |
|---|---|---|
| **Crawling & robots.txt** | Clean | Allows all crawlers, disallows `/components/`, defines Bingbot 1s delay, points to sitemap. |
| **Sitemap (`sitemap.xml`)** | 61 URLs | Includes all 60 core pages + homepage. Well structured with `<lastmod>` timestamps. |
| **Canonical Tags** | 100% Present | All 62 public pages have canonical tags matching their live URLs. |
| **URL Rewrites & 301s** | 12 Redirects | Handled cleanly in `vercel.json` without redirect loops. Non-www to www enforced. |
| **Page Speed & Core Web Vitals** | Excellent | Zero external heavy frameworks (no React, Next.js, or heavy jQuery). Static HTML renders instantly. |
| **Mobile Responsiveness** | Fully Responsive | CSS media queries at 768px and 420px; touch-friendly tap targets (>48px). |
| **Title Tags** | 100% Compliant | All titles within 45–65 characters; zero truncations in SERPs. |
| **Meta Descriptions** | 100% Compliant | All descriptions within 120–155 characters; action-oriented with phone number. |
| **Headings (H1)** | 98.4% Compliant | 61 pages have exactly one `<h1>`. Only `products/laminated-pp-bags.html` lacks one (expected as it is a redirect stub). |
| **Analytics (GTM/GA4)** | Incomplete | `GTM-5B5HNFFQ` is present on only 15 pages; missing on homepage and 46 others. |
| **Heatmaps (Clarity)** | Incomplete | `xobm18n8i7` present on only 2 pages (`index.html` and `products/index.html`). |
| **WhatsApp CTAs** | Semi-optimized | Functional floating button, but lacks dynamic pre-filled specification parameters. |

---

## 5. Existing Assets Reusable in Programmatic Engine

We do **not** need to reinvent the wheel. The following battle-tested modules will be directly repurposed in the new Programmatic SEO engine:
1. **Mathematical Pricing & Weight Logic:** Reusing `calculators/rates.js` and `calculators/calculator-core.js` to power the city landed-cost estimator.
2. **Brand Visual Assets:** 95 existing WebP images (`/assets/images/products/*.webp`).
3. **Core CSS Layouts:** `style.css` and `product-page.css` provide the exact CSS classes for spec tables, product grids, breadcrumbs, and badges.
4. **Header/Footer Components:** The engine templates will natively incorporate the existing navigation and footer links.
5. **WhatsApp Gateway:** The official phone number `+91 8320525550` and floating button layout.

---

## 6. Recommendations Summary Table

| Area | Current Situation | Proposed Improvement | Reason | Files Affected | Potential SEO Risk |
|---|---|---|---|---|---|
| **Location Architecture** | Ad-hoc city pages buried in `/blog/` with inconsistent slugs | Create a clean, dedicated programmatic route structure in `seo-city-engine/` | Separates commercial intent from informational content; prevents cannibalization | New generator in `seo-city-engine/` | Zero risk to existing pages; new URLs will be added gradually |
| **Syntax Cleanup** | Double angle brackets (`>>`) in meta tags on 2 pages | Fix HTML syntax to `>` | Eliminates W3C parsing errors and prevents snippet truncation | `products/jumbo-bags.html`, `blog/capsacks-packaging-bags.html` | Zero risk; improves crawl accuracy |
| **Analytics Tracking** | GTM present on only 15 pages; missing on homepage | Standardize GTM container `GTM-5B5HNFFQ` across all pages and future engine templates | Enables complete tracking of user journeys, calculator events, and conversion rates | All pages lacking GTM | Zero risk; improves data fidelity |
| **Clarity Heatmaps** | Clarity tracking on only 2 pages | Include Clarity script across all product and landing pages | Provides visual recording of user drop-offs on spec tables and freight calculators | All HTML pages | Negligible (asynchronous script with zero render blocking) |
| **Schema Completeness** | 14 pages lack JSON-LD structured data | Add standard `BreadcrumbList` and `Article`/`Product` schemas | Enhances rich snippet eligibility in Google & Bing | 14 specific pages | Zero risk; adheres to Schema.org standards |
| **WhatsApp Inquiries** | Generic WhatsApp message | Generate pre-filled, spec-rich inquiry strings (Product, Size, GSM, Destination, Qty) | Drastically increases inquiry qualification and speed of quotation | Inquiry buttons across site & engine | Zero risk; improves sales conversion |

---
*Audit completed and filed in `seo-city-engine/WEBSITE_AUDIT.md`.*
