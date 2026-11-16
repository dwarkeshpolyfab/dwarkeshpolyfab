/**
 * score-opportunities.js
 * Opportunity Scoring & Page Approval Governance Engine
 * Location: seo-city-engine/scripts/score-opportunities.js
 */

const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const dataDir = path.join(rootDir, 'data');

const rawClusters = JSON.parse(fs.readFileSync(path.join(dataDir, 'raw-keyword-clusters.json'), 'utf8'));
const cities = JSON.parse(fs.readFileSync(path.join(dataDir, 'cities.json'), 'utf8'));
const products = JSON.parse(fs.readFileSync(path.join(dataDir, 'products.json'), 'utf8'));
const transportRates = JSON.parse(fs.readFileSync(path.join(dataDir, 'transport-rates.json'), 'utf8'));

// Build lookup maps
const cityMap = {};
cities.forEach(c => { cityMap[c.city_id] = c; });

const productMap = {};
products.forEach(p => { productMap[p.product_id] = p; });

const scoredOpportunities = [];

rawClusters.forEach(item => {
  const city = cityMap[item.city_id] || {};
  const product = productMap[item.product_id] || {};

  let score = 0;
  const scoreBreakdown = {
    industrial_synergy: 0,
    logistics_feasibility: 0,
    search_intent_clarity: 0,
    cannibalization_status: 0
  };

  // 1. Industrial Synergy & Demand Evidence (Max: 35 points)
  const isRecommended = (city.recommended_products || []).includes(item.product_id);
  if (isRecommended) {
    scoreBreakdown.industrial_synergy = 35;
  } else {
    // Check keyword overlap with local industries
    const localIndustries = (city.key_local_industries || []).join(' ').toLowerCase();
    const productCategory = (product.category || '').toLowerCase();
    if (localIndustries.includes('agro') || localIndustries.includes('grain') || localIndustries.includes('chemical')) {
      scoreBreakdown.industrial_synergy = 25;
    } else {
      scoreBreakdown.industrial_synergy = 15;
    }
  }

  // 2. Logistics & Transport Feasibility (Max: 25 points)
  const distance = city.approx_distance_from_morbi_km || 1000;
  if (distance < 300) {
    scoreBreakdown.logistics_feasibility = 25; // Local Gujarat next-day freight
  } else if (distance <= 800) {
    scoreBreakdown.logistics_feasibility = 22; // Quick transit (1-2 days)
  } else if (['ludhiana', 'delhi', 'mumbai', 'jalandhar', 'amritsar'].includes(item.city_id)) {
    scoreBreakdown.logistics_feasibility = 20; // High-volume established freight corridors
  } else {
    scoreBreakdown.logistics_feasibility = 16;
  }

  // 3. Search Intent Clarity & Buyer Value (Max: 20 points)
  if (item.product_id === 'leno-bags' && (city.state === 'Punjab' || item.city_id === 'nashik' || item.city_id === 'nagpur')) {
    scoreBreakdown.search_intent_clarity = 20; // Potato/onion/citrus packaging peak seasonal volume
  } else if (item.product_id === 'tile-adhesive-bopp-bags' && ['morbi', 'rajkot', 'ahmedabad', 'delhi', 'pune'].includes(item.city_id)) {
    scoreBreakdown.search_intent_clarity = 20; // Direct Morbi ceramic cluster synergy
  } else if (item.product_id === 'rice-packaging-bags' && ['amritsar', 'ludhiana', 'gandhidham', 'kolkata', 'hyderabad'].includes(item.city_id)) {
    scoreBreakdown.search_intent_clarity = 20; // Basmati export & major milling zones
  } else if (item.product_id === 'ldpe-liner-bags' && (city.state === 'Gujarat' || city.state === 'Maharashtra')) {
    scoreBreakdown.search_intent_clarity = 19; // Heavy chemical GIDC corridors
  } else {
    scoreBreakdown.search_intent_clarity = 15;
  }

  // 4. Cannibalization & Safety (Max: 20 points)
  if (item.cannibalization_status === 'CLEAN') {
    scoreBreakdown.cannibalization_status = 20;
  } else {
    scoreBreakdown.cannibalization_status = 5; // Penalty for existing un-migrated blog pages
  }

  // Calculate Total Score (0-100)
  score = scoreBreakdown.industrial_synergy +
          scoreBreakdown.logistics_feasibility +
          scoreBreakdown.search_intent_clarity +
          scoreBreakdown.cannibalization_status;

  // Status Assignment Workflow:
  // Score >= 85: APPROVED (Top Tier Opportunities)
  // Score 70-84: APPROVED_SECONDARY (Ready for Wave 2 expansion)
  // Score < 70: RESEARCH (Kept in backlog)
  let status = 'RESEARCH';
  let priority = 'Normal';

  if (score >= 85) {
    status = 'APPROVED';
    priority = 'Tier 1 Priority (Immediate Build)';
  } else if (score >= 70) {
    status = 'APPROVED_SECONDARY';
    priority = 'Tier 2 Expansion';
  } else {
    status = 'RESEARCH';
    priority = 'Tier 3 Backlog';
  }

  // Highlight pilot candidate explicitly
  const isPilotCandidate = (item.product_id === 'leno-bags' && item.city_id === 'ludhiana');
  if (isPilotCandidate) {
    priority = '⭐ PILOT CANDIDATE (Phase 5 Target)';
    status = 'APPROVED';
  }

  scoredOpportunities.push({
    opportunity_id: item.opportunity_id,
    product_name: item.product_name,
    product_slug: product.product_slug,
    city_name: item.city_name,
    state: item.state,
    distance_km: city.approx_distance_from_morbi_km,
    transit_days: city.estimated_transit_days,
    freight_rate_per_kg: city.freight_rate_per_kg,
    primary_keyword: item.primary_keyword,
    secondary_keywords: item.secondary_keywords,
    target_url: item.target_url,
    quality_score: score,
    priority: priority,
    approval_status: status,
    cannibalization_status: item.cannibalization_status,
    conflicting_url: item.conflicting_url,
    score_breakdown: scoreBreakdown
  });
});

// Sort by quality score descending
scoredOpportunities.sort((a, b) => b.quality_score - a.quality_score);

// Save JSON
const matrixJsonPath = path.join(dataDir, 'keyword-matrix.json');
fs.writeFileSync(matrixJsonPath, JSON.stringify(scoredOpportunities, null, 2), 'utf8');

// Save CSV for non-programmers / Excel viewing
const csvHeaders = [
  'Opportunity ID', 'Quality Score', 'Priority', 'Approval Status', 'Product Name',
  'City Name', 'State', 'Distance (km)', 'Transit Days', 'Freight Rate (INR/kg)',
  'Primary Keyword', 'Target URL', 'Cannibalization Status', 'Conflicting URL', 'Secondary Keywords'
];

const csvRows = [csvHeaders.join(',')];

scoredOpportunities.forEach(row => {
  const escapeCsv = (str) => '"' + String(str || '').replace(/"/g, '""').replace(/\r?\n/g, ' ') + '"';
  csvRows.push([
    escapeCsv(row.opportunity_id),
    row.quality_score,
    escapeCsv(row.priority),
    escapeCsv(row.approval_status),
    escapeCsv(row.product_name),
    escapeCsv(row.city_name),
    escapeCsv(row.state),
    row.distance_km,
    escapeCsv(row.transit_days),
    row.freight_rate_per_kg,
    escapeCsv(row.primary_keyword),
    escapeCsv(row.target_url),
    escapeCsv(row.cannibalization_status),
    escapeCsv(row.conflicting_url),
    escapeCsv(row.secondary_keywords.join('; '))
  ].join(','));
});

const matrixCsvPath = path.join(dataDir, 'keyword-matrix.csv');
fs.writeFileSync(matrixCsvPath, csvRows.join('\n'), 'utf8');

console.log(`Successfully scored ${scoredOpportunities.length} opportunities.`);
console.log(`- Tier 1 Approved: ${scoredOpportunities.filter(o => o.approval_status === 'APPROVED').length}`);
console.log(`- Tier 2 Secondary: ${scoredOpportunities.filter(o => o.approval_status === 'APPROVED_SECONDARY').length}`);
console.log(`- Research Backlog: ${scoredOpportunities.filter(o => o.approval_status === 'RESEARCH').length}`);
console.log(`Saved matrix to: \n  ${matrixJsonPath}\n  ${matrixCsvPath}`);
