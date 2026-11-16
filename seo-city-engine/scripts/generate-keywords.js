/**
 * generate-keywords.js
 * Rule-Based Keyword Combination & Intent Clustering Engine
 * Location: seo-city-engine/scripts/generate-keywords.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
const cities = JSON.parse(fs.readFileSync(path.join(dataDir, 'cities.json'), 'utf8'));

// Read existing inventory to detect cannibalization risks
const inventoryCsv = fs.readFileSync(path.join(rootDir, 'EXISTING_URL_INVENTORY.csv'), 'utf8');
const existingUrls = inventoryCsv.split('\n').map(line => {
  const parts = line.split(',');
  return (parts[1] || '').replace(/"/g, '').toLowerCase().trim();
});

console.log(`Loaded ${products.length} products and ${cities.length} cities.`);
console.log(`Loaded ${existingUrls.length} existing inventory URLs for cannibalization check.`);

// Intent Modifier Matrix
const buyerModifiers = [
  'manufacturer',
  'manufacturers',
  'suppliers',
  'factory dispatch',
  'wholesale supplier',
  'direct manufacturer'
];

const commercialModifiers = [
  'price',
  'bulk order quotation',
  'wholesale price',
  'rate per bag',
  'landed cost'
];

const clusters = [];

// Generate clusters: 1 Opportunity = 1 Clean Target Landing Page
products.forEach(product => {
  cities.forEach(city => {
    const targetUrl = `/manufacturers/${product.product_slug}/${city.city_slug}.html`;

    // 1. Primary Keyword Recommendation (Highest B2B Commercial Intent)
    const primaryKeyword = `${product.product_name} Manufacturers in ${city.city_name}`;

    // 2. Secondary Keywords (Grouped on the same page to avoid keyword cannibalization)
    const secondaryKeywords = [
      `${product.product_name} suppliers in ${city.city_name}`,
      `${product.product_name} factory price in ${city.city_name}`,
      `Direct ${product.product_name} manufacturer for ${city.city_name} buyers`,
      `Bulk ${product.product_name} supply ${city.state}`,
      `${product.capacity_options[0] || '25 KG'} ${product.product_name} in ${city.city_name}`
    ];

    // Add product-specific long-tail keywords
    if (product.product_slug === 'leno-bags') {
      secondaryKeywords.push(`Potato mesh bags manufacturer in ${city.city_name}`);
      secondaryKeywords.push(`Onion packaging leno bags ${city.city_name}`);
    } else if (product.product_slug === 'bopp-laminated-bags') {
      secondaryKeywords.push(`Printed BOPP polybags manufacturer ${city.city_name}`);
      secondaryKeywords.push(`BOPP laminated bags wholesale rate ${city.city_name}`);
    } else if (product.product_slug === 'tile-adhesive-bopp-bags') {
      secondaryKeywords.push(`Wall putty and tile adhesive bags supplier ${city.city_name}`);
      secondaryKeywords.push(`Morbi tile adhesive packaging bags for ${city.city_name}`);
    } else if (product.product_slug === 'rice-packaging-bags') {
      secondaryKeywords.push(`Basmati rice packaging bags in ${city.city_name}`);
      secondaryKeywords.push(`Custom printed rice bags manufacturer ${city.city_name}`);
    } else if (product.product_slug === 'ldpe-liner-bags') {
      secondaryKeywords.push(`Chemical packaging LDPE liner bags ${city.city_name}`);
      secondaryKeywords.push(`Moisture proof PP bags with liner ${city.city_name}`);
    }

    // 3. Cannibalization Detection
    let cannibalizationRisk = 'CLEAN';
    let conflictingUrl = '';

    const citySlugLower = city.city_slug.toLowerCase();
    const productSlugLower = product.product_slug.toLowerCase();

    existingUrls.forEach(url => {
      if (url.includes(citySlugLower) && (url.includes(productSlugLower) || url.includes('pp-bag') || url.includes('pp_bag'))) {
        cannibalizationRisk = 'WARNING_EXISTING_PAGE';
        conflictingUrl = url;
      }
    });

    // 4. Intent Classification
    const searchIntent = 'Transactional / Commercial B2B (Bulk Direct Factory Order)';

    clusters.push({
      opportunity_id: `${product.product_slug}__${city.city_slug}`,
      product_id: product.product_id,
      product_name: product.product_name,
      city_id: city.city_id,
      city_name: city.city_name,
      state: city.state,
      primary_keyword: primaryKeyword,
      secondary_keywords: secondaryKeywords,
      target_url: targetUrl,
      search_intent: searchIntent,
      cannibalization_status: cannibalizationRisk,
      conflicting_url: conflictingUrl,
      status: 'RESEARCH' // Default initial status
    });
  });
});

const outputPath = path.join(dataDir, 'raw-keyword-clusters.json');
fs.writeFileSync(outputPath, JSON.stringify(clusters, null, 2), 'utf8');

console.log(`Generated ${clusters.length} total keyword-page clusters.`);
console.log(`Output saved to: ${outputPath}`);
