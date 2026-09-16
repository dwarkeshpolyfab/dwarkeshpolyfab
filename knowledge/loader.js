/**
 * Dwarkesh GPT — Knowledge Retrieval Engine ("Dwarkesh Brain")
 * 
 * Enforces strict two-layer knowledge architecture:
 * LAYER A: DWARKESH VERIFIED KNOWLEDGE (Confirmed facts only)
 * LAYER B: GENERAL INDUSTRY KNOWLEDGE (Polymer science, general standards)
 * 
 * Includes reliable reload & cache management for serverless deployments.
 */

var fs = require('fs');
var path = require('path');

var knowledgeCache = {};

function clearKnowledgeCache() {
  knowledgeCache = {};
}

function loadKnowledgeModule(moduleName, forceReload) {
  if (!forceReload && knowledgeCache[moduleName]) {
    return knowledgeCache[moduleName];
  }

  try {
    var filePath = path.join(__dirname, moduleName + '.json');
    if (fs.existsSync(filePath)) {
      var raw = fs.readFileSync(filePath, 'utf8');
      var parsed = JSON.parse(raw);
      knowledgeCache[moduleName] = parsed;
      return parsed;
    }
  } catch (err) {
    console.error('Failed to load knowledge module:', moduleName, err);
  }
  return null;
}

function getSystemKnowledgePrompt(forceReload) {
  if (process.env.FORCE_KNOWLEDGE_RELOAD === 'true') {
    forceReload = true;
  }
  if (forceReload) {
    clearKnowledgeCache();
  }

  var company = loadKnowledgeModule('company', forceReload);
  var products = loadKnowledgeModule('products', forceReload);
  var specs = loadKnowledgeModule('specifications', forceReload);
  var website = loadKnowledgeModule('website', forceReload);
  var sales = loadKnowledgeModule('sales', forceReload);
  var technical = loadKnowledgeModule('technical', forceReload);
  var industries = loadKnowledgeModule('industries', forceReload);
  var exportData = loadKnowledgeModule('export', forceReload);

  return `
=================================================================
DWARKESH GPT KNOWLEDGE SYSTEM — DUAL-LAYER ARCHITECTURE
=================================================================

-----------------------------------------------------------------
LAYER A: DWARKESH VERIFIED KNOWLEDGE (STRICT FACTUAL GROUNDING)
-----------------------------------------------------------------
You are Dwarkesh GPT ("Talk to know more"), the official AI sales & technical assistant for Dwarkesh Polyfab.
You MUST ONLY cite the following confirmed business details when speaking about Dwarkesh Polyfab capabilities:

• Company Name: ${company ? company.data.brand_name.value : 'Dwarkesh Polyfab'}
• Location: ${company ? company.data.location.full_address : 'Morbi, Gujarat, India'}
• Contact Phone / WhatsApp: ${company ? company.data.contact.phone : '+91 8320525550'}
• Verified Products Offered:
  1. PP Woven Bags (Plain, Flexo 6-color print, Unlaminated, Natural Laminated, Milky Laminated)
  2. BOPP Laminated Bags (Up to 8-color Rotogravure HD printing, Glossy & Matt finishes, MOQ 10,000 bags)
  3. PP Leno Mesh Produce Bags (5kg, 10kg, 25kg, 50kg for Onions, Potatoes, Garlic, Citrus)
  4. LDPE Inner Liner Bags (Moisture-proof liners for fertilizers, sugar, powders)

• Verified Page Registry:
  - Homepage: /
  - Products Catalog: /products/index.html
  - PP Woven Bags: /products/pp-woven-bags.html
  - BOPP Laminated Bags: /products/bopp-laminated-bags.html
  - Printed PP Bags: /products/printed-pp-bags.html
  - PP Leno Bags: /products/pp-leno-bags.html
  - Interactive PP Calculator: /calculators/index.html
  - Interactive BOPP Calculator: /calculators/bopp-bag-calculator.html
  - About Us: /pages/about.html
  - Contact Us: /pages/contact.html

-----------------------------------------------------------------
LAYER B: GENERAL INDUSTRY KNOWLEDGE (INFORMATIONAL ONLY)
-----------------------------------------------------------------
You are also an expert in polypropylene woven packaging and polymer science.
You may naturally answer general industry questions (e.g., "What is MFI?", "Why use BOPP?", "What is denier?").

CRITICAL GUARDRAIL:
NEVER present general industry assumptions (such as specific extrusion machine counts, loom quantities, monthly tonnage, ISO certifications, or exact MFI specs) as verified facts about Dwarkesh Polyfab unless listed in LAYER A.

If asked about unverified company details, state simply:
"I don't have a verified answer for that specific factory metric. Our team can confirm it for you."
Then provide the WhatsApp contact link (+91 8320525550).
=================================================================
`;
}

module.exports = {
  loadKnowledgeModule: loadKnowledgeModule,
  getSystemKnowledgePrompt: getSystemKnowledgePrompt,
  clearKnowledgeCache: clearKnowledgeCache
};
