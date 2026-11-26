const fs = require('fs');
const path = require('path');

const siteRoot = 'D:\\dwarkeshpolyfab-main\\dwarkeshpolyfab';
const dataDir = path.join(siteRoot, 'seo-city-engine', 'data');
const targetManufacturersDir = path.join(siteRoot, 'manufacturers');

// Read master datasets
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
const cities = JSON.parse(fs.readFileSync(path.join(dataDir, 'cities.json'), 'utf8'));

// Read real header and footer components
const rawHeaderHtml = fs.readFileSync(path.join(siteRoot, 'components', 'header.html'), 'utf8');
const rawFooterHtml = fs.readFileSync(path.join(siteRoot, 'components', 'footer.html'), 'utf8');

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Group cities by State for optgroup
const citiesByState = {};
for (const c of cities) {
  if (!citiesByState[c.state]) citiesByState[c.state] = [];
  citiesByState[c.state].push(c);
}

// Pre-compute cached City Options HTML for all 318 cities
console.log('Pre-caching city and product dropdown options...');
const cityOptionsCache = {};
for (const selectedCity of cities) {
  let html = '';
  for (const stateName of Object.keys(citiesByState)) {
    const stateCities = citiesByState[stateName];
    html += `<optgroup label="${escapeHtml(stateName)} (${stateCities.length} Hubs)">\n`;
    for (const c of stateCities) {
      const isSel = c.city_slug === selectedCity.city_slug ? ' selected' : '';
      html += `  <option value="${c.city_slug}"${isSel}>${escapeHtml(c.city_name)} (${c.state_code})</option>\n`;
    }
    html += `</optgroup>\n`;
  }
  cityOptionsCache[selectedCity.city_slug] = html;
}

// Pre-compute cached Product Options HTML for all 13 products
const productOptionsCache = {};
for (const selectedProd of products) {
  productOptionsCache[selectedProd.product_slug] = products.map(p => {
    const isSel = p.product_slug === selectedProd.product_slug ? ' selected' : '';
    const name = p.clean_name || p.product_name;
    return `<option value="${p.product_slug}"${isSel}>${escapeHtml(name)}</option>`;
  }).join('\n');
}

// Curated sidebar hubs
const CURATED_SIDEBAR_HUBS = [
  { name: "Morbi", slug: "morbi", state: "Gujarat" },
  { name: "Rajkot", slug: "rajkot", state: "Gujarat" },
  { name: "Ahmedabad", slug: "ahmedabad", state: "Gujarat" },
  { name: "Surat", slug: "surat", state: "Gujarat" },
  { name: "Vadodara", slug: "vadodara", state: "Gujarat" },
  { name: "Vapi", slug: "vapi", state: "Gujarat" },
  { name: "Ankleshwar", slug: "ankleshwar", state: "Gujarat" },
  { name: "Gandhidham", slug: "gandhidham", state: "Gujarat" },
  { name: "Unjha", slug: "unjha", state: "Gujarat" },
  { name: "Mehsana", slug: "mehsana", state: "Gujarat" },
  { name: "Mumbai", slug: "mumbai", state: "Maharashtra" },
  { name: "Bhiwandi", slug: "bhiwandi", state: "Maharashtra" },
  { name: "Pune", slug: "pune", state: "Maharashtra" },
  { name: "Nashik", slug: "nashik", state: "Maharashtra" },
  { name: "Kolhapur", slug: "kolhapur", state: "Maharashtra" },
  { name: "Nagpur", slug: "nagpur", state: "Maharashtra" },
  { name: "Ludhiana", slug: "ludhiana", state: "Punjab" },
  { name: "Amritsar", slug: "amritsar", state: "Punjab" },
  { name: "Jalandhar", slug: "jalandhar", state: "Punjab" },
  { name: "Bathinda", slug: "bathinda", state: "Punjab" },
  { name: "Panipat", slug: "panipat", state: "Haryana" },
  { name: "Karnal", slug: "karnal", state: "Haryana" },
  { name: "Jaipur", slug: "jaipur", state: "Rajasthan" },
  { name: "Kota", slug: "kota", state: "Rajasthan" },
  { name: "Kanpur", slug: "kanpur", state: "Uttar Pradesh" },
  { name: "Indore", slug: "indore", state: "Madhya Pradesh" },
  { name: "Raipur", slug: "raipur", state: "Chhattisgarh" },
  { name: "Hyderabad", slug: "hyderabad", state: "Telangana" },
  { name: "Bengaluru", slug: "bengaluru", state: "Karnataka" },
  { name: "Chennai", slug: "chennai", state: "Tamil Nadu" },
  { name: "Guntur", slug: "guntur", state: "Andhra Pradesh" },
  { name: "Kolkata", slug: "kolkata", state: "West Bengal" }
];

function generatePageHtml(product, city, isHubPage, relativeRoot) {
  const cleanName = product.clean_name || product.product_name.replace(/\s*\([^)]*\)/, '');
  const cityName = city.city_name;
  const stateName = city.state;

  // Adapt header links
  let pageHeader = rawHeaderHtml
    .replace(/href="\/"/g, `href="${relativeRoot}index.html"`)
    .replace(/href="\/products\/"/g, `href="${relativeRoot}products/index.html"`)
    .replace(/href="\/calculators\/index\.html"/g, `href="${relativeRoot}calculators/index.html"`)
    .replace(/href="\/industries\/index\.html"/g, `href="${relativeRoot}industries/index.html"`)
    .replace(/href="\/blog\/index\.html"/g, `href="${relativeRoot}blog/index.html"`)
    .replace(/href="\/pages\/about\.html"/g, `href="${relativeRoot}pages/about.html"`)
    .replace(/href="\/pages\/contact\.html"/g, `href="${relativeRoot}pages/contact.html"`)
    .replace(/src="\/assets\/images\//g, `src="${relativeRoot}assets/images/`);

  // Adapt footer links
  let pageFooter = rawFooterHtml
    .replace(/href="\/"/g, `href="${relativeRoot}index.html"`)
    .replace(/href="\/products\/"/g, `href="${relativeRoot}products/index.html"`)
    .replace(/href="\/products\/([^"]+)"/g, `href="${relativeRoot}products/$1"`)
    .replace(/href="\/calculators\/index\.html"/g, `href="${relativeRoot}calculators/index.html"`)
    .replace(/href="\/industries\/index\.html"/g, `href="${relativeRoot}industries/index.html"`)
    .replace(/href="\/blog\/index\.html"/g, `href="${relativeRoot}blog/index.html"`)
    .replace(/href="\/pages\/about\.html"/g, `href="${relativeRoot}pages/about.html"`)
    .replace(/href="\/pages\/contact\.html"/g, `href="${relativeRoot}pages/contact.html"`)
    .replace(/href="\/pages\/manufacturer-data\.html"/g, `href="${relativeRoot}pages/manufacturer-data.html"`)
    .replace(/src="\/assets\/images\//g, `src="${relativeRoot}assets/images/`);

  let pageTitle;
  let metaDesc;
  if (isHubPage) {
    pageTitle = 'PP & BOPP Bags Manufacturers India (318 Cities) | Morbi';
    metaDesc = 'Direct Morbi factory PP woven, BOPP, rice, fertilizer & leno bag supply to 318 Indian cities. Check freight cost, calculators & WhatsApp rates.';
  } else {
    const t1 = `${cleanName} Manufacturer in ${cityName} | Morbi Factory`;
    const t2 = `${cleanName} in ${cityName} (${city.state_code}) | Morbi Factory`;
    const t3 = `${cleanName} in ${cityName} | Morbi`;
    pageTitle = t1.length <= 64 ? t1 : (t2.length <= 64 ? t2 : t3.slice(0, 64));
    metaDesc = `Direct Morbi factory ${cleanName} for ${cityName} (${city.state_code}). Distance ${city.approx_distance_from_morbi_km}KM, freight ₹${city.freight_rate_per_kg.toFixed(2)}/kg, transit ${city.estimated_transit_days}. WhatsApp rate.`;
  }
  const canonicalUrl = isHubPage
    ? 'https://www.dwarkeshpolyfab.com/manufacturers/index.html'
    : `https://www.dwarkeshpolyfab.com/manufacturers/${product.product_slug}/${city.city_slug}.html`;

  const defaultQty = 25000;
  const bagWeightKg = product.est_weight_kg || 0.080;
  const basePricePerBag = product.est_base_price || 10.50;
  const totalShipmentKg = Math.round(defaultQty * bagWeightKg);
  const totalFreight = Math.round(totalShipmentKg * city.freight_rate_per_kg);
  const freightPerBag = (totalFreight / defaultQty).toFixed(2);
  const landedPricePerBag = (basePricePerBag + parseFloat(freightPerBag)).toFixed(2);

  const initialWaMsg = `Hello Dwarkesh Polyfab,

I am requesting an industrial quotation:
• Product: ${product.product_name}
• Destination: ${cityName}, ${stateName}
• Order Quantity: ${defaultQty.toLocaleString('en-IN')} Bags
• Est. Weight: ${totalShipmentKg.toLocaleString('en-IN')} KG
• Est. Road Freight: ₹${city.freight_rate_per_kg.toFixed(2)}/kg (Morbi to ${cityName})
• Route: Morbi Plant ➔ ${city.primary_transport_hub.split('/')[0]}

Please share proforma quotation, technical datasheet, and delivery timeline.`;

  const waUrl = `https://wa.me/918320525550?text=${encodeURIComponent(initialWaMsg)}`;

  let calcLink = `${relativeRoot}calculators/index.html`;
  if (product.product_slug === 'bopp-laminated-bags' || product.product_slug === 'tile-adhesive-bopp-bags') {
    calcLink = `${relativeRoot}calculators/bopp-bag-calculator.html`;
  }

  function getCityChipHref(targetCitySlug) {
    if (isHubPage) {
      return `./${product.product_slug}/${targetCitySlug}.html`;
    } else {
      return `./${targetCitySlug}.html`;
    }
  }

  // Schema.org JSON-LD
  const schemaJson = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Product",
        "name": `${product.product_name} - Supply to ${cityName}`,
        "description": `Direct factory supply of ${product.product_name} to industrial and agricultural businesses in ${cityName}, ${stateName}. Dispatched from Morbi manufacturing unit.`,
        "image": `https://www.dwarkeshpolyfab.com${product.image_url}`,
        "brand": {
          "@type": "Brand",
          "name": "Dwarkesh Polyfab"
        },
        "manufacturer": {
          "@type": "Organization",
          "name": "Dwarkesh Polyfab",
          "url": "https://www.dwarkeshpolyfab.com",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Morbi-Halwad Road, Near Nichimandal",
            "addressLocality": "Morbi",
            "addressRegion": "Gujarat",
            "postalCode": "363641",
            "addressCountry": "IN"
          }
        },
        "offers": {
          "@type": "AggregateOffer",
          "priceCurrency": "INR",
          "lowPrice": (basePricePerBag * 0.9).toFixed(2),
          "highPrice": (basePricePerBag * 1.3).toFixed(2),
          "offerCount": "100",
          "availability": "https://schema.org/InStock"
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://www.dwarkeshpolyfab.com/"
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": "Manufacturers",
            "item": "https://www.dwarkeshpolyfab.com/manufacturers/index.html"
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": cleanName,
            "item": `https://www.dwarkeshpolyfab.com/products/${product.product_slug}.html`
          },
          {
            "@type": "ListItem",
            "position": 4,
            "name": `${cityName} Supply`,
            "item": canonicalUrl
          }
        ]
      },
      {
        "@type": "FAQPage",
        "mainEntity": [
          {
            "@type": "Question",
            "name": `Does Dwarkesh Polyfab deliver ${cleanName} directly to ${cityName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Yes. Dwarkesh Polyfab manufactures ${cleanName} at our plant on Morbi-Halwad Road, Morbi, Gujarat and dispatches bulk consignments directly to commercial premises and logistics parks in ${cityName} via Full Truckload (FTL) and scheduled parcel freight.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the estimated freight cost from Morbi to ${cityName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The benchmark road freight from Morbi to ${cityName} is approximately ₹${city.freight_rate_per_kg.toFixed(2)} per KG. For an order of 25,000 bags (approx. ${totalShipmentKg.toLocaleString('en-IN')} kg), freight adds approximately ₹${freightPerBag} per bag.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the transit duration from Morbi to ${cityName}?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `Average road transit time from our Morbi factory to ${cityName} is ${city.estimated_transit_days} via ${city.primary_highway_corridor}.`
            }
          },
          {
            "@type": "Question",
            "name": `What is the Minimum Order Quantity (MOQ) for ${cityName} dispatch?`,
            "acceptedAnswer": {
              "@type": "Answer",
              "text": `The standard Minimum Order Quantity (MOQ) for ${cleanName} is ${product.moq}. Custom printing, color matching, and size specifications are tailored to buyer requirements.`
            }
          }
        ]
      }
    ]
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(pageTitle)}</title>
  <meta name="description" content="${escapeHtml(metaDesc)}">
  <link rel="canonical" href="${canonicalUrl}">
  <meta name="robots" content="index, follow">

  <!-- Open Graph / Social -->
  <meta property="og:title" content="${escapeHtml(pageTitle)}">
  <meta property="og:description" content="${escapeHtml(metaDesc)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:image" content="https://www.dwarkeshpolyfab.com${product.image_url}">
  <meta property="og:site_name" content="Dwarkesh Polyfab">

  <!-- Favicon -->
  <link rel="icon" type="image/png" href="${relativeRoot}assets/images/favicon.png">

  <!-- Fonts & Main Site CSS -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700;800;900&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="${relativeRoot}assets/css/style.css">
  <link rel="stylesheet" href="${relativeRoot}assets/css/product-page.css">

  <!-- Structured Data JSON-LD -->
  <script type="application/ld+json">
  ${JSON.stringify(schemaJson, null, 2)}
  </script>

  <style>
    /* REDBUS PROGRAMMATIC B2B CONSOLE STYLING */
    :root {
      --primary-blue: #112a46;
      --secondary-blue: #1a3d65;
      --gold-accent: #d4af37;
      --gold-hover: #c9a64b;
      --light-bg: #f8fafc;
      --card-bg: #ffffff;
      --text-dark: #0f172a;
      --text-muted: #475569;
      --border-color: #e2e8f0;
      --success-green: #16833f;
    }

    body {
      font-family: 'Poppins', -apple-system, BlinkMacSystemFont, sans-serif;
      color: var(--text-dark);
      background-color: var(--light-bg);
      margin: 0;
      padding: 0;
      line-height: 1.6;
    }

    /* REDBUS SEARCH BAR TOP CONSOLE */
    .rb-console-container {
      background: linear-gradient(135deg, #112a46 0%, #17375e 100%);
      padding: 26px 20px 30px;
      border-bottom: 3px solid var(--gold-accent);
      box-shadow: 0 10px 30px rgba(0,0,0,0.18);
    }
    .rb-console-inner {
      max-width: 1240px;
      margin: 0 auto;
    }
    .rb-console-tagline {
      color: var(--gold-accent);
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 1.2px;
      text-transform: uppercase;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    .rb-search-bar {
      background: #ffffff;
      border-radius: 12px;
      padding: 8px;
      display: grid;
      grid-template-columns: 1.1fr 1.3fr 1.2fr 0.8fr auto;
      gap: 8px;
      box-shadow: 0 12px 32px rgba(0,0,0,0.22);
      border: 2px solid #e2e8f0;
      align-items: center;
    }
    .rb-cell {
      padding: 8px 14px;
      border-right: 1px solid #e2e8f0;
      display: flex;
      flex-direction: column;
    }
    .rb-cell:last-of-type { border-right: none; }
    .rb-cell label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
      display: flex;
      align-items: center;
      gap: 5px;
    }
    .rb-cell select,
    .rb-cell input {
      border: none;
      background: transparent;
      font-family: inherit;
      font-size: 14.5px;
      font-weight: 600;
      color: #0f172a;
      outline: none;
      cursor: pointer;
      width: 100%;
    }
    .rb-cell optgroup {
      font-weight: 700;
      color: var(--primary-blue);
      background: #f1f5f9;
    }
    .rb-cell option {
      font-weight: 500;
      color: #0f172a;
      background: #ffffff;
    }
    .rb-fixed-origin {
      background: #f8fafc;
      border-radius: 8px;
      cursor: default;
    }
    .rb-fixed-origin .origin-val {
      font-size: 14.5px;
      font-weight: 700;
      color: #1e3a8a;
      display: flex;
      align-items: center;
      gap: 6px;
    }

    /* BAG COSTING CALCULATOR BUTTON */
    .rb-calc-btn {
      background: linear-gradient(135deg, #112a46 0%, #1a3d65 100%);
      color: #ffffff;
      border: 1.5px solid var(--gold-accent);
      padding: 12px 20px;
      border-radius: 8px;
      font-size: 13.5px;
      font-weight: 700;
      cursor: pointer;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      text-decoration: none;
      transition: all 0.25s ease;
      white-space: nowrap;
      box-shadow: 0 4px 12px rgba(17, 42, 70, 0.25);
    }
    .rb-calc-btn:hover {
      background: linear-gradient(135deg, #d4af37 0%, #c9a64b 100%);
      color: #0f172a;
      border-color: #d4af37;
      transform: translateY(-2px);
      box-shadow: 0 6px 18px rgba(212, 175, 55, 0.45);
    }

    /* Live Route Tracker Bar under search */
    .rb-tracker-bar {
      margin-top: 14px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: #cbd5e1;
      font-size: 13px;
      flex-wrap: wrap;
      gap: 10px;
    }
    .rb-tracker-route {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #f1f5f9;
      font-weight: 600;
    }
    .rb-tracker-route strong {
      color: #facc15;
      font-size: 14px;
    }
    .rb-url-pill {
      background: rgba(0,0,0,0.3);
      padding: 5px 14px;
      border-radius: 50px;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 12px;
      color: #94a3b8;
      border: 1px solid rgba(255,255,255,0.1);
    }
    .rb-url-pill span { color: #38bdf8; }

    /* Breadcrumbs */
    .p-breadcrumbs {
      max-width: 1240px;
      margin: 16px auto 0;
      padding: 0 20px;
      font-size: 13px;
      color: var(--text-muted);
    }
    .p-breadcrumbs a { color: var(--secondary-blue); text-decoration: none; }
    .p-breadcrumbs span { margin: 0 6px; color: #9ca3af; }

    /* Hero Banner */
    .hero-strip {
      background: #ffffff;
      padding: 35px 20px 40px;
      border-bottom: 1px solid var(--border-color);
    }
    .hero-strip-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1.3fr 0.7fr;
      gap: 40px;
      align-items: center;
    }
    .badge-origin-trust {
      display: inline-flex;
      align-items: center;
      gap: 8px;
      background: #fefce8;
      border: 1px solid #fde047;
      color: #854d0e;
      padding: 6px 14px;
      border-radius: 50px;
      font-size: 12px;
      font-weight: 700;
      text-transform: uppercase;
      margin-bottom: 14px;
    }
    .hero-h1 {
      font-size: 32px;
      font-weight: 800;
      line-height: 1.25;
      margin: 0 0 14px;
      color: var(--primary-blue);
    }
    .hero-h1 span { color: #b91c1c; }
    .hero-intro {
      font-size: 15px;
      line-height: 1.7;
      color: #475569;
      margin-bottom: 22px;
    }
    .hero-kpis {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px;
      margin-bottom: 26px;
    }
    .kpi-row {
      display: flex;
      align-items: center;
      gap: 10px;
      font-size: 13.5px;
      font-weight: 600;
      color: #334155;
    }
    .kpi-check { color: var(--success-green); font-weight: 800; }

    .hero-actions {
      display: flex;
      gap: 14px;
      flex-wrap: wrap;
    }
    .btn-wa-direct {
      background: var(--success-green);
      color: #ffffff;
      padding: 13px 26px;
      border-radius: 8px;
      font-weight: 700;
      font-size: 14.5px;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 10px;
      box-shadow: 0 4px 14px rgba(22, 131, 63, 0.4);
      transition: transform 0.2s;
    }
    .btn-wa-direct:hover { transform: translateY(-2px); }

    .hero-img-box {
      background: var(--light-bg);
      padding: 16px;
      border-radius: 12px;
      border: 1px solid var(--border-color);
      text-align: center;
      box-shadow: 0 10px 25px rgba(0,0,0,0.06);
    }
    .hero-img-box img {
      max-width: 100%;
      height: 270px;
      object-fit: cover;
      border-radius: 8px;
    }
    .hero-img-title {
      margin-top: 10px;
      font-size: 13.5px;
      font-weight: 700;
      color: var(--primary-blue);
    }

    /* Main Grid Structure */
    .content-grid-wrap {
      max-width: 1240px;
      margin: 35px auto;
      padding: 0 20px;
      display: grid;
      grid-template-columns: 2fr 1fr;
      gap: 35px;
    }

    /* Content Cards */
    .c-card {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 28px;
      margin-bottom: 28px;
      box-shadow: 0 4px 12px rgba(17, 42, 70, 0.05);
    }
    .c-card-title {
      font-size: 20px;
      font-weight: 700;
      color: var(--primary-blue);
      margin-top: 0;
      margin-bottom: 18px;
      border-bottom: 2px solid var(--light-bg);
      padding-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    /* Direct Factory Transparency Notice */
    .transparency-box {
      background: #fdfbf2;
      border: 1px solid #fae69e;
      border-left: 5px solid var(--gold-accent);
      border-radius: 8px;
      padding: 16px 20px;
      margin-bottom: 24px;
    }
    .transparency-box h3 {
      margin: 0 0 6px;
      font-size: 15px;
      font-weight: 700;
      color: #8c6d12;
    }
    .transparency-box p {
      margin: 0;
      font-size: 13.5px;
      line-height: 1.6;
      color: #594715;
    }

    /* Logistics Specs Grid */
    .log-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 14px;
      margin: 18px 0;
    }
    .log-item {
      background: var(--light-bg);
      border: 1px solid #dce4ec;
      border-radius: 8px;
      padding: 14px 18px;
    }
    .log-item .label {
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      color: #64748b;
      margin-bottom: 4px;
    }
    .log-item .val {
      font-size: 16px;
      font-weight: 800;
      color: var(--primary-blue);
    }

    /* Specification Table */
    .tbl-wrap {
      width: 100%;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 14px 0;
      border: 1px solid var(--border-color);
      border-radius: 8px;
    }
    .spec-tbl {
      width: 100%;
      min-width: 440px;
      border-collapse: collapse;
      margin: 0;
      font-size: 13px;
    }
    .spec-tbl th {
      background: var(--primary-blue);
      color: #ffffff;
      text-align: left;
      padding: 10px 12px;
      font-weight: 600;
    }
    .spec-tbl td {
      padding: 9px 12px;
      border-bottom: 1px solid var(--border-color);
    }
    .spec-tbl tr:nth-child(even) { background-color: #fafbfc; }
    .spec-tbl td:first-child {
      font-weight: 600;
      color: var(--secondary-blue);
      width: 35%;
    }

    /* Landed Cost Calculator Box */
    .calc-card {
      background: #f8fafc;
      border: 2px solid #e2e8f0;
      border-radius: 12px;
      padding: 22px;
      margin: 18px 0;
    }
    .calc-inputs-row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 18px;
    }
    .calc-inp-group label {
      display: block;
      font-size: 12px;
      font-weight: 700;
      color: #475569;
      margin-bottom: 6px;
    }
    .calc-inp-group input, .calc-inp-group select {
      width: 100%;
      box-sizing: border-box;
      padding: 10px 12px;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      font-size: 14px;
      font-weight: 600;
      color: #0f172a;
      background: #ffffff;
    }
    .calc-results-grid {
      background: #ffffff;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      padding: 16px;
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 14px;
      text-align: center;
      margin-bottom: 18px;
    }
    .calc-res-item .res-lbl {
      font-size: 11px;
      font-weight: 700;
      color: #64748b;
      text-transform: uppercase;
      margin-bottom: 4px;
    }
    .calc-res-item .res-val {
      font-size: 18px;
      font-weight: 800;
      color: #1e3a8a;
    }
    .calc-res-item.highlight .res-val {
      color: #b91c1c;
      font-size: 20px;
    }
    .btn-calc-quote {
      display: block;
      width: 100%;
      box-sizing: border-box;
      text-align: center;
      background: linear-gradient(135deg, #16833f 0%, #15803d 100%);
      color: #ffffff;
      font-weight: 700;
      padding: 14px;
      border-radius: 8px;
      text-decoration: none;
      font-size: 15px;
      transition: background 0.2s, transform 0.2s;
    }
    .btn-calc-quote:hover {
      background: #15803d;
      transform: translateY(-2px);
    }

    /* FAQ Accordion Styling */
    .faq-block {
      border: 1px solid var(--border-color);
      border-radius: 8px;
      margin-bottom: 12px;
      overflow: hidden;
    }
    .faq-q {
      background: #f8fafc;
      padding: 14px 18px;
      font-size: 14.5px;
      font-weight: 700;
      color: var(--primary-blue);
      cursor: pointer;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .faq-a {
      padding: 14px 18px;
      font-size: 13.5px;
      line-height: 1.6;
      color: #475569;
      border-top: 1px solid var(--border-color);
      background: #ffffff;
    }

    /* Sidebar Styling */
    .sidebar-widget {
      background: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 22px;
      margin-bottom: 24px;
      box-shadow: 0 4px 12px rgba(17, 42, 70, 0.05);
    }
    .sidebar-widget-title {
      font-size: 16px;
      font-weight: 700;
      color: var(--primary-blue);
      margin-top: 0;
      margin-bottom: 14px;
      border-bottom: 2px solid var(--light-bg);
      padding-bottom: 8px;
    }
    .city-chip-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 8px;
    }
    .city-chip-btn {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 6px;
      padding: 8px 10px;
      font-size: 12px;
      font-weight: 600;
      color: #334155;
      cursor: pointer;
      text-align: center;
      transition: all 0.2s;
      text-decoration: none;
      display: block;
    }
    .city-chip-btn:hover, .city-chip-btn.active {
      background: #112a46;
      color: #ffffff;
      border-color: #112a46;
    }

    /* RESPONSIVE & MOBILE DESIGN (Clean, compact, content-friendly) */
    @media (max-width: 992px) {
      .rb-search-bar { grid-template-columns: 1fr; }
      .hero-strip-inner { grid-template-columns: 1fr; }
      .content-grid-wrap { grid-template-columns: 1fr; }
      .log-grid { grid-template-columns: 1fr 1fr; }
      .calc-results-grid { grid-template-columns: repeat(3, 1fr); }
    }

    @media (max-width: 768px) {
      body { font-size: 13px; line-height: 1.55; }

      /* Search & Route Console */
      .rb-console-container { padding: 14px 12px 16px; }
      .rb-console-tagline { font-size: 9.5px; letter-spacing: 0.8px; margin-bottom: 8px; }
      .rb-search-bar {
        padding: 6px;
        gap: 6px;
        border-radius: 8px;
      }
      .rb-cell {
        padding: 6px 10px;
        border-right: none;
        border-bottom: 1px solid #f1f5f9;
      }
      .rb-cell:last-of-type { border-bottom: none; }
      .rb-cell label { font-size: 10px; margin-bottom: 2px; }
      .rb-cell select, .rb-cell input { font-size: 12.5px; }
      .origin-val { font-size: 12px; }
      .rb-calc-btn {
        width: 100%;
        box-sizing: border-box;
        text-align: center;
        justify-content: center;
        padding: 10px 14px;
        font-size: 12px;
        border-radius: 6px;
      }

      /* Live Route Tracker Bar */
      .rb-tracker-bar {
        flex-direction: column;
        align-items: flex-start;
        gap: 6px;
        margin-top: 10px;
        font-size: 11px;
      }
      .rb-tracker-route {
        font-size: 11px;
        line-height: 1.45;
        flex-wrap: wrap;
      }
      .rb-tracker-route strong { font-size: 11.5px; }
      .rb-url-pill {
        font-size: 9.5px;
        padding: 3px 8px;
        word-break: break-all;
      }

      /* Breadcrumbs */
      .p-breadcrumbs {
        padding: 0 12px;
        margin-top: 10px;
        font-size: 11px;
        white-space: nowrap;
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
      }

      /* Hero Section */
      .hero-strip { padding: 16px 12px 20px; }
      .hero-strip-inner { gap: 16px; }
      .badge-origin-trust { font-size: 9.5px; padding: 3px 8px; margin-bottom: 8px; }
      .hero-h1 {
        font-size: 18px;
        line-height: 1.35;
        margin-bottom: 8px;
        font-weight: 700;
      }
      .hero-intro {
        font-size: 12px;
        line-height: 1.55;
        margin-bottom: 12px;
      }
      .hero-kpis {
        grid-template-columns: 1fr;
        gap: 6px;
        margin-bottom: 14px;
      }
      .kpi-row { font-size: 11.5px; gap: 6px; }
      .btn-wa-direct {
        width: 100%;
        box-sizing: border-box;
        justify-content: center;
        text-align: center;
        padding: 10px 14px;
        font-size: 13px;
        border-radius: 6px;
      }
      .hero-img-box {
        padding: 8px;
        border-radius: 8px;
      }
      .hero-img-box img {
        height: 170px;
        width: 100%;
        object-fit: cover;
        border-radius: 6px;
      }
      .hero-img-title { font-size: 11.5px; margin-top: 6px; }

      /* Content Grid & Cards */
      .content-grid-wrap {
        margin: 14px auto;
        padding: 0 10px;
        gap: 14px;
      }
      .c-card {
        padding: 14px 12px;
        margin-bottom: 14px;
        border-radius: 8px;
      }
      .c-card-title {
        font-size: 15px;
        line-height: 1.35;
        margin-bottom: 10px;
        padding-bottom: 6px;
        gap: 6px;
      }
      .c-card p {
        font-size: 12px;
        line-height: 1.6;
        margin-bottom: 10px;
      }
      .c-card ul {
        padding-left: 16px;
        margin-bottom: 10px;
      }
      .c-card li {
        font-size: 11.5px;
        line-height: 1.55;
        margin-bottom: 4px;
      }

      /* Transparency Notice */
      .transparency-box {
        padding: 10px 12px;
        border-radius: 6px;
        border-left-width: 4px;
        margin-bottom: 12px;
      }
      .transparency-box h3 { font-size: 12px; margin-bottom: 4px; }
      .transparency-box p { font-size: 11px; line-height: 1.5; }

      /* Logistics Grid */
      .log-grid {
        grid-template-columns: 1fr 1fr;
        gap: 6px;
        margin: 10px 0;
      }
      .log-item {
        padding: 8px 10px;
        border-radius: 6px;
      }
      .log-item .label { font-size: 9px; margin-bottom: 2px; }
      .log-item .val { font-size: 12.5px; }

      /* Landed Cost Calculator */
      .calc-card {
        padding: 12px 10px;
        border-radius: 8px;
        margin: 12px 0;
      }
      .calc-inputs-row {
        grid-template-columns: 1fr;
        gap: 8px;
        margin-bottom: 10px;
      }
      .calc-inp-group label { font-size: 10.5px; margin-bottom: 3px; }
      .calc-inp-group input, .calc-inp-group select {
        padding: 7px 9px;
        font-size: 12px;
        border-radius: 5px;
      }
      .calc-results-grid {
        grid-template-columns: repeat(3, 1fr);
        padding: 8px 4px;
        gap: 4px;
        margin-bottom: 10px;
      }
      .calc-res-item .res-lbl { font-size: 8px; margin-bottom: 2px; }
      .calc-res-item .res-val { font-size: 12px; }
      .calc-res-item.highlight .res-val { font-size: 13px; }
      .btn-calc-quote {
        padding: 10px 12px;
        font-size: 12px;
        border-radius: 6px;
      }

      /* Table inside wrap */
      .spec-tbl { font-size: 11px; min-width: 380px; }
      .spec-tbl th { padding: 6px 8px; font-size: 11px; }
      .spec-tbl td { padding: 5px 8px; font-size: 11px; }

      /* FAQ Accordion */
      .faq-q { padding: 8px 10px; font-size: 12px; line-height: 1.35; }
      .faq-a { padding: 8px 10px; font-size: 11px; line-height: 1.5; }

      /* Sidebar Widgets */
      .sidebar-widget {
        padding: 12px 10px;
        margin-bottom: 12px;
        border-radius: 8px;
      }
      .sidebar-widget-title {
        font-size: 13px;
        margin-bottom: 8px;
        padding-bottom: 5px;
      }
      .city-chip-grid { gap: 5px; }
      .city-chip-btn {
        padding: 5px 7px;
        font-size: 10px;
        border-radius: 4px;
      }
    }

    @media (max-width: 480px) {
      .hero-h1 { font-size: 17px; }
      .hero-img-box img { height: 150px; }
      .log-grid { grid-template-columns: 1fr; }
      .calc-results-grid { grid-template-columns: 1fr; gap: 6px; }
      .calc-res-item { padding: 6px; background: #f8fafc; border-radius: 4px; }
    }

    /* HUB GATEWAY STYLES: Welcome Ribbon, Trust Explorer Cards, Delayed Modal & Mobile Dock */
    .hub-welcome-ribbon {
      background: linear-gradient(90deg, #fffbeb 0%, #fef3c7 100%);
      border-bottom: 1.5px solid #e5b842;
      padding: 10px 18px;
      font-size: 13px;
      color: #112a46;
    }
    .hub-ribbon-inner {
      max-width: 1240px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 12px;
      flex-wrap: wrap;
    }
    .hub-ribbon-actions {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    .hub-rbtn {
      padding: 6px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
      text-decoration: none;
      display: inline-flex;
      align-items: center;
      gap: 5px;
      cursor: pointer;
    }
    .hub-rbtn-navy { background: #112a46; color: #facc15; border: 1px solid #112a46; }
    .hub-rbtn-outline { background: #ffffff; color: #112a46; border: 1px solid #112a46; }
    .hub-rbtn-hide { background: transparent; color: #64748b; border: 1px solid #cbd5e1; font-family: inherit; }

    .hub-trust-wrap {
      max-width: 1240px;
      margin: 22px auto 0;
      padding: 0 20px;
    }
    .hub-trust-card {
      background: linear-gradient(135deg, #112a46 0%, #1a3d65 100%);
      border-radius: 12px;
      padding: 22px 24px;
      color: #ffffff;
      border: 1.5px solid var(--gold-accent);
    }
    .hub-trust-card h2 {
      color: #facc15;
      font-size: 18px;
      margin: 0 0 6px;
      font-weight: 800;
    }
    .hub-trust-card > p {
      color: #cbd5e1;
      font-size: 13px;
      margin: 0 0 16px;
    }
    .hub-explorer-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
    }
    .hub-exp-item {
      background: rgba(255,255,255,0.08);
      border: 1px solid rgba(212,175,55,0.35);
      border-radius: 9px;
      padding: 14px;
      text-decoration: none;
      color: #ffffff;
      transition: transform 0.2s, background 0.2s;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
    }
    .hub-exp-item:hover {
      background: rgba(255,255,255,0.14);
      transform: translateY(-2px);
    }
    .hub-exp-item strong { color: #facc15; font-size: 14px; display: block; margin-bottom: 4px; }
    .hub-exp-item span { font-size: 12px; color: #cbd5e1; line-height: 1.45; }

    /* Non-intrusive delayed popup modal (hub only) */
    .hub-modal-backdrop {
      display: none;
      position: fixed;
      inset: 0;
      background: rgba(15, 23, 42, 0.62);
      z-index: 99999;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    .hub-modal-backdrop.open { display: flex; }
    .hub-modal-box {
      background: #ffffff;
      border-radius: 14px;
      max-width: 470px;
      width: 100%;
      overflow: hidden;
      box-shadow: 0 24px 60px rgba(0,0,0,0.35);
      border: 2px solid #d4af37;
    }
    .hub-modal-head {
      background: linear-gradient(135deg, #112a46 0%, #1a3d65 100%);
      color: #ffffff;
      padding: 20px 22px;
      position: relative;
    }
    .hub-modal-head h3 { margin: 0 0 4px; color: #facc15; font-size: 18px; }
    .hub-modal-head p { margin: 0; color: #cbd5e1; font-size: 12.5px; }
    .hub-modal-close {
      position: absolute;
      top: 12px;
      right: 12px;
      background: rgba(255,255,255,0.15);
      border: none;
      color: #ffffff;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      cursor: pointer;
      font-weight: 700;
    }
    .hub-modal-body { padding: 18px 22px 22px; }
    .hub-modal-links { display: grid; gap: 10px; margin-bottom: 14px; }
    .hub-modal-btn {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 11px 14px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 700;
      font-size: 13.5px;
    }
    .hub-modal-btn.primary { background: #112a46; color: #facc15; }
    .hub-modal-btn.calc { background: #f0fdf4; color: #166534; border: 1px solid #86efac; }
    .hub-modal-btn.guide { background: #f8fafc; color: #1e293b; border: 1px solid #cbd5e1; }
    .hub-modal-dismiss {
      width: 100%;
      padding: 9px;
      border-radius: 7px;
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      color: #475569;
      font-size: 12.5px;
      font-weight: 600;
      cursor: pointer;
      font-family: inherit;
    }

    /* Mobile sticky quick-nav dock (hub only) */
    .hub-mobile-dock {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      background: #112a46;
      border-top: 2px solid #d4af37;
      z-index: 9998;
      padding: 6px 8px;
      box-shadow: 0 -4px 16px rgba(0,0,0,0.22);
    }
    .hub-dock-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr) auto;
      gap: 4px;
      align-items: center;
    }
    .hub-dock-link {
      color: #ffffff;
      text-decoration: none;
      text-align: center;
      font-size: 10.5px;
      font-weight: 700;
      padding: 5px 2px;
      border-radius: 5px;
    }
    .hub-dock-link.wa { background: #16833f; color: #ffffff; }
    .hub-dock-hide {
      background: transparent;
      border: none;
      color: #94a3b8;
      font-size: 14px;
      padding: 4px 6px;
      cursor: pointer;
    }
    @media (max-width: 992px) {
      .hub-explorer-grid { grid-template-columns: repeat(2, 1fr); }
    }
    @media (max-width: 768px) {
      .hub-mobile-dock { display: block; }
      .hub-explorer-grid { grid-template-columns: 1fr; }
      .hub-trust-wrap { padding: 0 10px; }
      .hub-trust-card { padding: 14px 12px; }
    }
  </style>
</head>
<body>

  <!-- ATTACHED REAL WEBSITE HEADER (components/header.html) -->
  ${pageHeader}

  ${isHubPage ? `
  <!-- DISMISSIBLE TOP WELCOME RIBBON (Hub Gateway) -->
  <div id="hub-welcome-ribbon" class="hub-welcome-ribbon">
    <div class="hub-ribbon-inner">
      <div>🏭 <strong>Dwarkesh Polyfab Factory Hub (Morbi, Gujarat):</strong> Explore our full plant story, instant costing tools &amp; all 13 bag lines.</div>
      <div class="hub-ribbon-actions">
        <a href="${relativeRoot}index.html" class="hub-rbtn hub-rbtn-navy">🏠 Visit Homepage</a>
        <a href="${relativeRoot}calculators/index.html" class="hub-rbtn hub-rbtn-outline">🧮 Bag Calculator</a>
        <a href="${relativeRoot}products/index.html" class="hub-rbtn hub-rbtn-outline">📦 All Products</a>
        <button type="button" id="hub-ribbon-hide" class="hub-rbtn hub-rbtn-hide">✕ Hide</button>
      </div>
    </div>
  </div>
  ` : ''}

  <!-- REDBUS SEARCH BAR TOP CONSOLE -->
  <section class="rb-console-container">
    <div class="rb-console-inner">
      <div class="rb-console-tagline">
        ⚡ DIRECT FACTORY SUPPLY CONSOLE • MORBI PLANT TO ANY COMMERCIAL DESTINATION
      </div>

      <div class="rb-search-bar">
        <!-- Field 1: Origin (Morbi Plant - Fixed) -->
        <div class="rb-cell rb-fixed-origin">
          <label>🏭 Dispatch Origin</label>
          <div class="origin-val">Morbi, Gujarat (Plant)</div>
        </div>

        <!-- Field 2: Destination City Selector (Organized by States with 318 Hubs) -->
        <div class="rb-cell">
          <label for="rb-city-select">📍 Destination City (${cities.length} Hubs)</label>
          <select id="rb-city-select">
            ${cityOptionsCache[city.city_slug]}
          </select>
        </div>

        <!-- Field 3: Product Selector -->
        <div class="rb-cell">
          <label for="rb-product-select">📦 Product Category</label>
          <select id="rb-product-select">
            ${productOptionsCache[product.product_slug]}
          </select>
        </div>

        <!-- Field 4: Quantity -->
        <div class="rb-cell">
          <label for="rb-qty-input">🔢 Order Quantity</label>
          <input type="number" id="rb-qty-input" value="${defaultQty}" min="5000" step="5000">
        </div>

        <!-- Action Button: Bag Costing Calculator -->
        <a href="${calcLink}" class="rb-calc-btn" title="Open Custom Bag Costing & GSM Calculator">
          🧮 Bag Costing Calculator
        </a>
      </div>

      <!-- Live Route Tracker Strip -->
      <div class="rb-tracker-bar">
        <div class="rb-tracker-route">
          Active Route: <strong>Morbi Factory ➔ ${cityName} (${stateName})</strong> • Distance: <strong>${city.approx_distance_from_morbi_km} KM</strong> • Est. Freight: <strong>₹${city.freight_rate_per_kg.toFixed(2)}/kg</strong>
        </div>
        <div class="rb-url-pill">
          Route URL: <span>/manufacturers/${product.product_slug}/${city.city_slug}.html</span>
        </div>
      </div>
    </div>
  </section>

  <!-- BREADCRUMBS -->
  <nav class="p-breadcrumbs" aria-label="Breadcrumb">
    <a href="${relativeRoot}index.html">Home</a>
    <span>/</span>
    <a href="${isHubPage ? '#' : (relativeRoot + 'manufacturers/index.html')}">Manufacturers</a>
    <span>/</span>
    <a href="${relativeRoot}products/${product.product_slug}.html">${cleanName}</a>
    <span>/</span>
    <span style="color:#112a46;font-weight:600;">${cityName} Supply</span>
  </nav>

  <!-- HERO BANNER -->
  <section class="hero-strip">
    <div class="hero-strip-inner">
      <div>
        <div class="badge-origin-trust">
          ${isHubPage
            ? '🏭 Morbi, Gujarat Factory Hub • Direct Bulk Dispatch to 318 Indian Cities'
            : `🏭 Factory in Morbi, Gujarat • Bulk Direct Dispatch to ${cityName}`}
        </div>
        <h1 class="hero-h1">
          ${isHubPage
            ? 'Pan-India PP Woven &amp; BOPP Bags Manufacturer — <span>318 Cities Direct Dispatch</span>'
            : `${cleanName} Manufacturer for <span>${cityName}, ${stateName}</span>`}
        </h1>
        <p class="hero-intro">
          Dwarkesh Polyfab delivers factory-direct, virgin-grade ${product.product_name} directly from our manufacturing plant in Morbi, Gujarat to industrial clusters, processing mills, and logistics hubs across ${cityName}.
        </p>

        <div class="hero-kpis">
          <div class="kpi-row"><span class="kpi-check">✓</span> Road Distance: ${city.approx_distance_from_morbi_km} KM</div>
          <div class="kpi-row"><span class="kpi-check">✓</span> Transit Duration: ${city.estimated_transit_days}</div>
          <div class="kpi-row"><span class="kpi-check">✓</span> Est. Road Freight: ₹${city.freight_rate_per_kg.toFixed(2)} / KG</div>
          <div class="kpi-row"><span class="kpi-check">✓</span> Unloading Hub: ${city.primary_transport_hub.split('/')[0]}</div>
        </div>

        <div class="hero-actions">
          <a id="hero-wa-btn" href="${waUrl}" target="_blank" rel="noopener" class="btn-wa-direct">
            💬 Get Instant ${cityName} WhatsApp Quote
          </a>
        </div>
      </div>

      <div class="hero-img-box">
        <img id="page-product-img" src="${relativeRoot}${product.image_url.replace(/^\//, '')}" alt="${cleanName} Manufacturer ${cityName}">
        <div class="hero-img-title">${product.product_name} (Morbi Factory Stock)</div>
      </div>
    </div>
  </section>

  ${isHubPage ? `
  <!-- EXPLORE FULL WEBSITE & TOOLS (Builds Buyer Trust & Increases Session Depth) -->
  <section class="hub-trust-wrap">
    <div class="hub-trust-card">
      <h2>🏭 Explore Dwarkesh Polyfab — Full Website, Calculators &amp; Buyer Tools</h2>
      <p>Verify our Morbi factory infrastructure, calculate exact bag weight &amp; manufacturing rates online, and explore our full product &amp; freight guides:</p>
      <div class="hub-explorer-grid">
        <a href="${relativeRoot}index.html" class="hub-exp-item">
          <div><strong>🏠 Visit Full Homepage</strong><span>Explore our Morbi manufacturing unit, production lines, certifications &amp; export track record.</span></div>
        </a>
        <a href="${relativeRoot}calculators/index.html" class="hub-exp-item">
          <div><strong>🧮 PP Bag Price Calculator</strong><span>Calculate exact gram weight, GSM, lamination, liner cost &amp; rate per bag instantly.</span></div>
        </a>
        <a href="${relativeRoot}calculators/bopp-bag-calculator.html" class="hub-exp-item">
          <div><strong>✨ BOPP Laminated Calculator</strong><span>Instant pricing for 8-color glossy &amp; matte BOPP laminated woven sacks (5kg–50kg).</span></div>
        </a>
        <a href="${relativeRoot}blog/pan-india-pp-woven-bags-manufacturer-freight-cost-guide.html" class="hub-exp-item">
          <div><strong>📖 Pan-India Freight Guide</strong><span>See why direct Morbi factory procurement saves 12%–18% over regional middlemen.</span></div>
        </a>
      </div>
    </div>
  </section>
  ` : ''}

  <!-- MAIN CONTENT GRID -->
  <div class="content-grid-wrap">
    <main>

      <!-- Transparency Notice (Google Anti-Doorway Shield) -->
      <div class="transparency-box">
        <h3>📍 Direct Factory Supply Disclosure for ${cityName} Buyers</h3>
        <p>
          <strong>Dwarkesh Polyfab</strong> manufactures industrial packaging exclusively at our manufacturing facility on <strong>Morbi-Halwad Road, Nichimandal, Morbi, Gujarat</strong>. We do not operate local retail branches in ${cityName}. We dispatch bulk consignments (FTL) and scheduled parcel freight directly to <strong>${city.primary_transport_hub}</strong>, providing ${cityName} businesses with direct Gujarat factory wholesale rates without intermediary trading margins.
        </p>
      </div>

      <!-- Route Logistics Specifications -->
      <div class="c-card">
        <h2 class="c-card-title">🚚 Morbi to ${cityName} Dispatch &amp; Logistics</h2>
        <div class="log-grid">
          <div class="log-item">
            <div class="label">Factory Origin</div>
            <div class="val">Morbi Plant (Gujarat)</div>
          </div>
          <div class="log-item">
            <div class="label">Destination Unloading Hub</div>
            <div class="val">${city.primary_transport_hub}</div>
          </div>
          <div class="log-item">
            <div class="label">Highway Corridor</div>
            <div class="val">${city.primary_highway_corridor}</div>
          </div>
          <div class="log-item">
            <div class="label">Road Distance</div>
            <div class="val">${city.approx_distance_from_morbi_km} KM</div>
          </div>
          <div class="log-item">
            <div class="label">Estimated Transit Time</div>
            <div class="val">${city.estimated_transit_days}</div>
          </div>
          <div class="log-item">
            <div class="label">Benchmark Freight Rate</div>
            <div class="val">₹${city.freight_rate_per_kg.toFixed(2)} / KG</div>
          </div>
        </div>
      </div>

      <!-- Landed Cost & Freight Estimator -->
      <div class="c-card">
        <h2 class="c-card-title">💰 Landed Cost &amp; Freight Estimator for ${cityName}</h2>
        <p style="font-size:13.5px;color:#64748b;margin-bottom:16px;">
          Adjust bag quantity below to calculate total shipment weight, road freight, and estimated landed cost per bag in ${cityName}:
        </p>

        <div class="calc-card">
          <div class="calc-inputs-row">
            <div class="calc-inp-group">
              <label for="inp-calc-qty">Order Quantity (Bags)</label>
              <input type="number" id="inp-calc-qty" value="${defaultQty}" min="5000" step="5000">
            </div>
            <div class="calc-inp-group">
              <label>Delivery Destination</label>
              <input type="text" value="${cityName}, ${stateName}" readonly style="background:#f1f5f9;cursor:not-allowed;">
            </div>
          </div>

          <div class="calc-results-grid">
            <div class="calc-res-item">
              <div class="res-lbl">Total Weight</div>
              <div class="res-val" id="calc-weight-val">${totalShipmentKg.toLocaleString('en-IN')} KG</div>
            </div>
            <div class="calc-res-item">
              <div class="res-lbl">Total Road Freight</div>
              <div class="res-val" id="calc-freight-val">₹${totalFreight.toLocaleString('en-IN')}</div>
            </div>
            <div class="calc-res-item highlight">
              <div class="res-lbl">Est. Landed Price / Bag</div>
              <div class="res-val" id="calc-landed-val">₹${landedPricePerBag}</div>
            </div>
          </div>

          <a id="btn-calc-wa" href="${waUrl}" target="_blank" rel="noopener" class="btn-calc-quote">
            💬 Request Official ${cityName} Proforma Quotation on WhatsApp
          </a>
        </div>
      </div>

      <!-- Technical Specifications -->
      <div class="c-card">
        <h2 class="c-card-title">📦 ${product.product_name} Technical Specifications</h2>
        <div class="tbl-wrap">
          <table class="spec-tbl">
            <tr><th>Specification</th><th>Factory Details</th></tr>
            <tr><td>Material Grade</td><td>${product.materials}</td></tr>
            <tr><td>GSM Range</td><td>${product.gsm_range}</td></tr>
            <tr><td>Standard Capacities</td><td>${(product.capacity_options || []).join(', ')}</td></tr>
            <tr><td>Lamination Options</td><td>${Array.isArray(product.lamination_options) ? product.lamination_options.join(', ') : product.lamination_options}</td></tr>
            <tr><td>Printing Capabilities</td><td>${product.printing_colors}</td></tr>
            <tr><td>Stitching &amp; Finishing</td><td>${product.stitching_type}</td></tr>
            <tr><td>Liner Specification</td><td>${product.liner_options ? (Array.isArray(product.liner_options) ? product.liner_options.join(', ') : product.liner_options) : 'Standard / Custom'}</td></tr>
            <tr><td>Minimum Order Quantity (MOQ)</td><td>${product.moq}</td></tr>
            <tr><td>UV Protection</td><td>${product.uv_treatment}</td></tr>
          </table>
        </div>
      </div>

      <!-- Local Industrial Applications -->
      <div class="c-card">
        <h2 class="c-card-title">🌾 Industrial Application in ${cityName}</h2>
        <p style="font-size:14px;color:#334155;line-height:1.7;">
          ${cityName} is a leading commercial and manufacturing hub for <strong>${(city.key_local_industries || []).join(', ')}</strong>. Our ${product.product_name} are specifically engineered with high burst strength, precision weave, and rigorous drop-resistance to withstand bulk storage, high stacking, and long-distance transport typical of ${cityName}'s industrial ecosystem.
        </p>
      </div>

      <!-- B2B Procurement FAQs -->
      <div class="c-card">
        <h2 class="c-card-title">❓ Frequently Asked Questions (${cityName} Supply)</h2>

        <div class="faq-block">
          <div class="faq-q">Can Dwarkesh Polyfab deliver ${cleanName} directly to our facility in ${cityName}?</div>
          <div class="faq-a">Yes. We arrange direct factory dispatch from our Morbi plant to ${cityName} using dedicated Full Truckloads (FTL) for large consignments or scheduled Part Truckload (PTL) carriers with direct door delivery to your warehouse.</div>
        </div>

        <div class="faq-block">
          <div class="faq-q">How is road transport freight calculated for ${cityName}?</div>
          <div class="faq-a">Road freight from Morbi to ${cityName} is billed on actual weight at approx. ₹${city.freight_rate_per_kg.toFixed(2)} per KG via major transport carriers. On a standard order of 25,000 bags, freight adds approximately ₹${freightPerBag} per bag.</div>
        </div>

        <div class="faq-block">
          <div class="faq-q">What is the Minimum Order Quantity (MOQ)?</div>
          <div class="faq-a">Our standard MOQ for ${cityName} dispatch is ${product.moq}. We also provide sample swatches and trial test bags prior to bulk production.</div>
        </div>

        <div class="faq-block">
          <div class="faq-q">Can we print our brand logo and custom graphics?</div>
          <div class="faq-a">Yes. We offer high-definition flexographic and rotogravure printing up to 6 to 8 colors with custom cylinder engravings matching your brand guidelines.</div>
        </div>
      </div>

    </main>

    <!-- SIDEBAR -->
    <aside>
      <div class="sidebar-widget">
        <h3 class="sidebar-widget-title">⚡ Quick Switch Commercial Hub</h3>
        <p style="font-size:12px;color:#64748b;margin-bottom:12px;">Click any major commercial hub below to immediately navigate to its dedicated route page:</p>
        <div class="city-chip-grid">
          ${CURATED_SIDEBAR_HUBS.map(c => {
            const isCur = c.slug === city.city_slug;
            const chipHref = getCityChipHref(c.slug);
            return `<a class="city-chip-btn ${isCur ? 'active' : ''}" href="${chipHref}">${c.name}</a>`;
          }).join('\n          ')}
        </div>
      </div>

      <div class="sidebar-widget">
        <h3 class="sidebar-widget-title">📞 Direct Factory Sales Desk</h3>
        <p style="font-size:13px;color:#475569;margin-bottom:8px;"><strong>Manufacturing Plant:</strong></p>
        <p style="font-size:12.5px;color:#64748b;margin-top:0;margin-bottom:12px;">Dwarkesh Polyfab, Morbi-Halwad Road, Near Nichimandal, Morbi, Gujarat - 363641</p>
        <p style="font-size:13px;color:#475569;margin-bottom:4px;"><strong>Direct Inquiries:</strong></p>
        <p style="font-size:14px;font-weight:700;color:var(--primary-blue);margin:0;">
          <a href="tel:+918320525550" style="color:inherit;text-decoration:none;">📱 +91 8320525550</a>
        </p>
        <p style="font-size:13px;font-weight:600;color:#64748b;margin-top:4px;">
          ✉️ <a href="mailto:dwarkeshpolyfab@gmail.com" style="color:inherit;text-decoration:none;">dwarkeshpolyfab@gmail.com</a>
        </p>
      </div>
    </aside>
  </div>

  <!-- ATTACHED REAL WEBSITE FOOTER (components/footer.html) -->
  ${pageFooter}

  ${isHubPage ? `
  <!-- NON-INTRUSIVE DISCOVERY POPUP (Delayed 12s or 50% scroll, Dismissible, Session-Remembered) -->
  <div id="hub-discovery-modal" class="hub-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="hub-modal-title">
    <div class="hub-modal-box">
      <div class="hub-modal-head">
        <button type="button" id="hub-modal-x" class="hub-modal-close" aria-label="Hide popup">✕</button>
        <h3 id="hub-modal-title">🏭 Looking for Our Full Factory &amp; Calculators?</h3>
        <p>Explore Dwarkesh Polyfab's Homepage, Bag Weight Calculators &amp; all 13 product catalogs.</p>
      </div>
      <div class="hub-modal-body">
        <div class="hub-modal-links">
          <a href="${relativeRoot}index.html" class="hub-modal-btn primary">
            <span>🏠 Forward to Full Homepage</span><span>→</span>
          </a>
          <a href="${relativeRoot}calculators/index.html" class="hub-modal-btn calc">
            <span>🧮 Open PP Bag Weight &amp; Price Calculator</span><span>→</span>
          </a>
          <a href="${relativeRoot}products/index.html" class="hub-modal-btn guide">
            <span>📦 Browse All 13 Product Categories</span><span>→</span>
          </a>
          <a href="${relativeRoot}blog/index.html" class="hub-modal-btn guide">
            <span>📖 Buyer &amp; Freight Cost Guides</span><span>→</span>
          </a>
        </div>
        <button type="button" id="hub-modal-hide" class="hub-modal-dismiss">Hide &amp; Stay on Route Finder</button>
      </div>
    </div>
  </div>

  <!-- STICKY MOBILE QUICK-NAV DOCK -->
  <nav id="hub-mobile-dock" class="hub-mobile-dock" aria-label="Quick site navigation">
    <div class="hub-dock-grid">
      <a href="${relativeRoot}index.html" class="hub-dock-link">🏠<br>Home</a>
      <a href="${relativeRoot}calculators/index.html" class="hub-dock-link">🧮<br>Calc</a>
      <a href="${relativeRoot}products/index.html" class="hub-dock-link">📦<br>Products</a>
      <a href="${waUrl}" target="_blank" rel="noopener" class="hub-dock-link wa">💬<br>Quote</a>
      <button type="button" id="hub-dock-hide" class="hub-dock-hide" aria-label="Hide bar">✕</button>
    </div>
  </nav>
  ` : ''}

  <!-- REDBUS AUTOMATIC NAVIGATION JAVASCRIPT -->
  <script>
    (function() {
      var currentProdSlug = "${product.product_slug}";
      var currentCitySlug = "${city.city_slug}";
      var isHub = ${isHubPage ? 'true' : 'false'};
      var basePrice = ${basePricePerBag};
      var estWeightKg = ${bagWeightKg};
      var freightPerKg = ${city.freight_rate_per_kg};

      var selectCity = document.getElementById('rb-city-select');
      var selectProd = document.getElementById('rb-product-select');
      var inputQty = document.getElementById('rb-qty-input');

      var calcQtyInp = document.getElementById('inp-calc-qty');
      var calcWeightVal = document.getElementById('calc-weight-val');
      var calcFreightVal = document.getElementById('calc-freight-val');
      var calcLandedVal = document.getElementById('calc-landed-val');
      var btnCalcWa = document.getElementById('btn-calc-wa');
      var btnHeroWa = document.getElementById('hero-wa-btn');

      // FUNCTION: Automatic Route Navigation on Dropdown Change
      function executeRouteNavigation() {
        var targetCity = selectCity.value;
        var targetProd = selectProd.value;
        var qty = parseInt(inputQty.value, 10) || 25000;

        var isFileProto = window.location.protocol === 'file:';
        var destinationUrl = '';

        if (isFileProto) {
          // Relative file navigation for offline local disk testing
          var locPath = window.location.pathname.replace(/\\\\/g, '/');
          if (locPath.indexOf('/manufacturers/') !== -1 && !isHub) {
            destinationUrl = '../' + targetProd + '/' + targetCity + '.html';
          } else {
            destinationUrl = './' + targetProd + '/' + targetCity + '.html';
          }
        } else {
          // Standard web server navigation with search parameters
          destinationUrl = '/manufacturers/' + targetProd + '/' + targetCity + '.html' +
            '?fromCityName=Morbi&toCityName=' + encodeURIComponent(targetCity) +
            '&product=' + encodeURIComponent(targetProd) +
            '&qty=' + qty +
            '&ref=modifySearch';
        }

        window.location.href = destinationUrl;
      }

      selectCity.addEventListener('change', executeRouteNavigation);
      selectProd.addEventListener('change', executeRouteNavigation);

      function recalculateCosts(newQty) {
        var qty = parseInt(newQty, 10);
        if (isNaN(qty) || qty < 1000) qty = 25000;

        var totalKg = Math.round(qty * estWeightKg);
        var totalFreight = Math.round(totalKg * freightPerKg);
        var freightPerBag = totalFreight / qty;
        var landedPerBag = (basePrice + freightPerBag).toFixed(2);

        calcWeightVal.textContent = totalKg.toLocaleString('en-IN') + ' KG';
        calcFreightVal.textContent = '₹' + totalFreight.toLocaleString('en-IN');
        calcLandedVal.textContent = '₹' + landedPerBag;

        var waText = 'Hello Dwarkesh Polyfab,\\n\\n' +
          'I am requesting an industrial quotation:\\n' +
          '• Product: ${product.product_name}\\n' +
          '• Destination: ${cityName}, ${stateName}\\n' +
          '• Order Quantity: ' + qty.toLocaleString('en-IN') + ' Bags\\n' +
          '• Est. Total Weight: ' + totalKg.toLocaleString('en-IN') + ' KG\\n' +
          '• Est. Road Freight: ₹' + freightPerKg.toFixed(2) + '/kg (Morbi to ${cityName})\\n' +
          '• Est. Landed Cost: ₹' + landedPerBag + '/bag\\n\\n' +
          'Please share formal proforma invoice and delivery timeline.';

        var newWaUrl = 'https://wa.me/918320525550?text=' + encodeURIComponent(waText);
        if (btnCalcWa) btnCalcWa.href = newWaUrl;
        if (btnHeroWa) btnHeroWa.href = newWaUrl;
      }

      if (calcQtyInp) {
        calcQtyInp.addEventListener('input', function() {
          inputQty.value = calcQtyInp.value;
          recalculateCosts(calcQtyInp.value);
        });
      }
      if (inputQty) {
        inputQty.addEventListener('input', function() {
          if (calcQtyInp) calcQtyInp.value = inputQty.value;
          recalculateCosts(inputQty.value);
        });
      }

      if (isHubPage) {
        var ribbon = document.getElementById('hub-welcome-ribbon');
        var ribbonHide = document.getElementById('hub-ribbon-hide');
        if (ribbon && sessionStorage.getItem('dp_hub_ribbon_hidden') === '1') {
          ribbon.style.display = 'none';
        }
        if (ribbonHide && ribbon) {
          ribbonHide.addEventListener('click', function() {
            ribbon.style.display = 'none';
            sessionStorage.setItem('dp_hub_ribbon_hidden', '1');
          });
        }

        var dock = document.getElementById('hub-mobile-dock');
        var dockHide = document.getElementById('hub-dock-hide');
        if (dock && sessionStorage.getItem('dp_hub_dock_hidden') === '1') {
          dock.style.display = 'none';
        }
        if (dockHide && dock) {
          dockHide.addEventListener('click', function() {
            dock.style.display = 'none';
            sessionStorage.setItem('dp_hub_dock_hidden', '1');
          });
        }

        var modal = document.getElementById('hub-discovery-modal');
        var modalX = document.getElementById('hub-modal-x');
        var modalHide = document.getElementById('hub-modal-hide');
        function closeHubModal() {
          if (modal) modal.classList.remove('open');
          sessionStorage.setItem('dp_hub_modal_seen', '1');
        }
        if (modal && !sessionStorage.getItem('dp_hub_modal_seen')) {
          var timerId = setTimeout(function() {
            if (!sessionStorage.getItem('dp_hub_modal_seen')) {
              modal.classList.add('open');
            }
          }, 12000);
          window.addEventListener('scroll', function onHubScroll() {
            var scrolled = window.scrollY / Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
            if (scrolled > 0.5 && !sessionStorage.getItem('dp_hub_modal_seen')) {
              clearTimeout(timerId);
              modal.classList.add('open');
              window.removeEventListener('scroll', onHubScroll);
            }
          });
          if (modalX) modalX.addEventListener('click', closeHubModal);
          if (modalHide) modalHide.addEventListener('click', closeHubModal);
          modal.addEventListener('click', function(e) {
            if (e.target === modal) closeHubModal();
          });
        }
      }

    })();
  </script>
</body>
</html>`;
}

// 1. Ensure target directory structure exists
if (!fs.existsSync(targetManufacturersDir)) fs.mkdirSync(targetManufacturersDir, { recursive: true });
const engineDir = path.join(siteRoot, 'seo-city-engine');
const outputManufacturersDir = path.join(engineDir, 'output', 'manufacturers');
if (!fs.existsSync(outputManufacturersDir)) fs.mkdirSync(outputManufacturersDir, { recursive: true });

// 2. Generate Central Hub in site root (manufacturers/index.html) and output
const hubProduct = products[0]; // PP Woven Bags
const hubCity = cities.find(c => c.city_slug === 'mumbai') || cities[0];
const hubHtml = generatePageHtml(hubProduct, hubCity, true, '../');
fs.writeFileSync(path.join(targetManufacturersDir, 'index.html'), hubHtml, 'utf8');
fs.writeFileSync(path.join(engineDir, 'output', 'index.html'), hubHtml, 'utf8');
fs.writeFileSync(path.join(outputManufacturersDir, 'index.html'), hubHtml, 'utf8');
console.log('✓ Generated Central Hub: manufacturers/index.html');

// 3. Generate ALL physical route files for all products and all cities in site root & output
console.log(`Starting compilation of ${products.length * cities.length} route pages into manufacturers/...`);
const startTime = Date.now();
let count = 0;

for (const prod of products) {
  const prodDir = path.join(targetManufacturersDir, prod.product_slug);
  if (!fs.existsSync(prodDir)) fs.mkdirSync(prodDir, { recursive: true });
  const outputProdDir = path.join(outputManufacturersDir, prod.product_slug);
  if (!fs.existsSync(outputProdDir)) fs.mkdirSync(outputProdDir, { recursive: true });

  for (const city of cities) {
    const routeHtml = generatePageHtml(prod, city, false, '../../');
    const routeFilePath = path.join(prodDir, `${city.city_slug}.html`);
    fs.writeFileSync(routeFilePath, routeHtml, 'utf8');
    const outputRouteFilePath = path.join(outputProdDir, `${city.city_slug}.html`);
    fs.writeFileSync(outputRouteFilePath, routeHtml, 'utf8');
    count++;
  }
}

const duration = ((Date.now() - startTime) / 1000).toFixed(2);
console.log(`✓ Successfully compiled ${count} physical route HTML pages into manufacturers/ in ${duration}s!`);

// 4. Generate Split Production Sitemaps (4 files <= 220KB each for fast GSC fetch)
console.log('Generating split manufacturer sitemaps...');
const todayStr = new Date().toISOString().slice(0, 10);
const allRouteUrls = [];
for (const prod of products) {
  for (const city of cities) {
    allRouteUrls.push(`https://www.dwarkeshpolyfab.com/manufacturers/${prod.product_slug}/${city.city_slug}.html`);
  }
}

const numChunks = 4;
const chunkSize = Math.ceil(allRouteUrls.length / numChunks);
for (let i = 0; i < numChunks; i++) {
  const chunk = allRouteUrls.slice(i * chunkSize, (i + 1) * chunkSize);
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  for (const u of chunk) {
    xml += `  <url>\n    <loc>${u}</loc>\n    <lastmod>${todayStr}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.7</priority>\n  </url>\n`;
  }
  xml += `</urlset>\n`;
  fs.writeFileSync(path.join(siteRoot, `sitemap-manufacturers-${i + 1}.xml`), xml, 'utf8');
}
console.log(`✓ Updated sitemap-manufacturers-1..4.xml (${allRouteUrls.length} URLs, keeping sitemap.xml index & robots.txt intact)!`);
