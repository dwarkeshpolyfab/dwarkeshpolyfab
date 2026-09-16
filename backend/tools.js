/**
 * Dwarkesh GPT — Deterministic Tool Execution Engine
 * 
 * Reuses authoritative calculator formulas from /calculators/ repository
 * and provides strict, schema-validated tool execution for the OpenAI API.
 */

var loader = require('../knowledge/loader');

// OpenAI Tool Declarations (Schemas)
var toolDeclarations = [
  {
    type: 'function',
    function: {
      name: 'calculate_pp_bag_weight',
      description: 'Calculates the exact fabric weight in grams per bag and kg per 1,000 bags for PP Woven Bags using authoritative Dwarkesh calculator formulas.',
      parameters: {
        type: 'object',
        properties: {
          width: { type: 'number', description: 'Bag width in inches (e.g., 18, 19, 20)' },
          length: { type: 'number', description: 'Bag length in inches (e.g., 28, 34, 36)' },
          quality: { type: 'string', enum: ['janta', 'silver', 'gold', 'natural'], description: 'Quality grade (janta=100gsm, silver=120gsm, gold=135gsm, natural=140gsm)' },
          gsm: { type: 'number', description: 'Custom GSM override if specified' },
          lamination: { type: 'string', enum: ['none', 'natural', 'milky'], description: 'Lamination coating (none, natural clear +15gsm, milky white +18gsm)' }
        },
        required: ['width', 'length']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'calculate_bopp_bag_weight',
      description: 'Calculates the exact composite weight in grams per bag and kg per 1,000 bags for BOPP Laminated Woven Bags using authoritative Dwarkesh calculator formulas.',
      parameters: {
        type: 'object',
        properties: {
          width: { type: 'number', description: 'Bag width in inches (e.g., 16, 18, 20)' },
          length: { type: 'number', description: 'Bag length in inches (e.g., 24, 28, 32)' },
          fabric_gsm: { type: 'number', description: 'PP woven base fabric GSM (default 90 GSM for BOPP)' },
          finish: { type: 'string', enum: ['glossy', 'matt'], description: 'BOPP film finish (Glossy HD or Matt Soft-Touch)' },
          gusset: { type: 'number', description: 'Side gusset width in inches if applicable (default 0)' }
        },
        required: ['width', 'length']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'prepare_whatsapp_lead_inquiry',
      description: 'Generates an official pre-filled WhatsApp lead link to Dwarkesh sales desk (+91 8320525550) summarizing customer bag requirements.',
      parameters: {
        type: 'object',
        properties: {
          product: { type: 'string', description: 'Product or application (e.g., Tile Adhesive, Basmati Rice, Fertilizer)' },
          capacity: { type: 'string', description: 'Bag capacity (e.g., 20kg, 25kg, 50kg)' },
          size: { type: 'string', description: 'Dimensions in inches (e.g., 18x28 inch)' },
          bag_type: { type: 'string', description: 'Bag type (PP Woven, BOPP Laminated, Leno Mesh)' },
          quantity: { type: 'string', description: 'Quantity required (e.g., 10,000 bags)' },
          location: { type: 'string', description: 'Delivery location or destination' }
        },
        required: ['product']
      }
    }
  },
  {
    type: 'function',
    function: {
      name: 'get_website_action_link',
      description: 'Retrieves verified canonical website page URLs for navigation buttons.',
      parameters: {
        type: 'object',
        properties: {
          page_id: {
            type: 'string',
            enum: ['home', 'products_catalog', 'pp_woven_bags', 'bopp_laminated_bags', 'printed_pp_bags', 'pp_leno_bags', 'pp_calculator', 'bopp_calculator', 'about', 'contact'],
            description: 'The target website page identifier'
          }
        },
        required: ['page_id']
      }
    }
  }
];

// Execute Tools
function executeTool(name, args) {
  if (name === 'calculate_pp_bag_weight') {
    return runPPCalculator(args);
  }
  if (name === 'calculate_bopp_bag_weight') {
    return runBOPPCalculator(args);
  }
  if (name === 'prepare_whatsapp_lead_inquiry') {
    return runWhatsAppLead(args);
  }
  if (name === 'get_website_action_link') {
    return runWebsiteLink(args);
  }
  throw new Error('Unknown tool name requested: ' + name);
}

// 1. PP Calculator Logic (Authoritative Math from /calculators/index.html)
function runPPCalculator(args) {
  var w = parseFloat(args.width) || 0;
  var l = parseFloat(args.length) || 0;
  if (w <= 0 || l <= 0) {
    return { error: 'Invalid dimensions. Width and length must be positive numbers.' };
  }

  var quality = (args.quality || 'silver').toLowerCase();
  var baseGsmMap = { janta: 100, silver: 120, gold: 135, natural: 140 };
  var baseGsm = parseFloat(args.gsm) || baseGsmMap[quality] || 120;

  var lam = (args.lamination || 'none').toLowerCase();
  var lamGsmMap = { none: 0, natural: 15, milky: 18 };
  var lamGsm = lamGsmMap[lam] || 0;

  var totalGsm = baseGsm + lamGsm;
  var lengthWithStitch = l + 1.0; // 1-inch stitch allowance
  var areaSqM = (w * 0.0254) * (lengthWithStitch * 0.0254) * 2; // Tubular double layer
  var weightKg = (areaSqM * totalGsm) / 1000;
  var weightGrams = weightKg * 1000;
  var weightKgPer1000 = weightKg * 1000;

  return {
    success: true,
    width_inch: w,
    length_inch: l,
    quality_grade: quality,
    total_gsm: totalGsm,
    weight_grams_per_bag: parseFloat(weightGrams.toFixed(1)),
    weight_kg_per_bag: parseFloat(weightKg.toFixed(4)),
    weight_kg_per_1000_bags: parseFloat(weightKgPer1000.toFixed(1)),
    disclaimer: 'Calculated fabric weight. Final pricing depends on current PP resin market index and quotation.'
  };
}

// 2. BOPP Calculator Logic (Authoritative Math from /calculators/bopp-bag-calculator.html)
function runBOPPCalculator(args) {
  var w = parseFloat(args.width) || 0;
  var l = parseFloat(args.length) || 0;
  if (w <= 0 || l <= 0) {
    return { error: 'Invalid dimensions. Width and length must be positive numbers.' };
  }

  var gusset = parseFloat(args.gusset) || 0;
  var fabricGsm = parseFloat(args.fabric_gsm) || 90;
  var finish = (args.finish || 'glossy').toLowerCase();

  var effectiveWidth = w + gusset;
  var lengthWithStitch = l + 1.5; // 1.5-inch seam & fold allowance
  var compositeAddGsm = 29; // 18g lamination + 11g 12-micron BOPP film
  var totalGsm = fabricGsm + compositeAddGsm;

  var areaSqM = (effectiveWidth * 0.0254) * (lengthWithStitch * 0.0254) * 2;
  var weightGrams = areaSqM * totalGsm;
  var weightKg = weightGrams / 1000;
  var weightKgPer1000 = weightKg * 1000;

  return {
    success: true,
    width_inch: w,
    length_inch: l,
    gusset_inch: gusset,
    finish: finish === 'matt' ? 'Matt Soft-Touch Finish' : 'High Glossy HD Rotogravure',
    composite_gsm: totalGsm,
    weight_grams_per_bag: parseFloat(weightGrams.toFixed(1)),
    weight_kg_per_bag: parseFloat(weightKg.toFixed(4)),
    weight_kg_per_1000_bags: parseFloat(weightKgPer1000.toFixed(1)),
    moq: 10000,
    disclaimer: 'Calculated BOPP composite weight. Final pricing depends on current resin rates and cylinder approval.'
  };
}

// 3. WhatsApp Lead Generator
function runWhatsAppLead(args) {
  var phone = '918320525550'; // Verified Dwarkesh Contact Number
  var parts = ['Hi Dwarkesh Polyfab, I want to inquire about:'];

  if (args.product) parts.push('• Product/Application: ' + args.product);
  if (args.capacity) parts.push('• Capacity: ' + args.capacity);
  if (args.size) parts.push('• Bag Size: ' + args.size);
  if (args.bag_type) parts.push('• Bag Type: ' + args.bag_type);
  if (args.quantity) parts.push('• Quantity: ' + args.quantity);
  if (args.location) parts.push('• Location: ' + args.location);
  parts.push('\nPlease share today\'s official quotation and production timeline.');

  var messageText = parts.join('\n');
  var waUrl = 'https://wa.me/' + phone + '?text=' + encodeURIComponent(messageText);

  return {
    success: true,
    action_type: 'whatsapp',
    label: '📱 Send Requirement on WhatsApp',
    url: waUrl
  };
}

// 4. Website Link Lookup
function runWebsiteLink(args) {
  var siteData = loader.loadKnowledgeModule('website');
  if (!siteData || !siteData.routes) {
    return { error: 'Website route registry unavailable.' };
  }

  var found = siteData.routes.find(function(r) { return r.page_id === args.page_id; });
  if (found) {
    return {
      success: true,
      page_id: found.page_id,
      title: found.title,
      url: found.url
    };
  }

  return { error: 'Page not found in verified registry: ' + args.page_id };
}

module.exports = {
  toolDeclarations: toolDeclarations,
  executeTool: executeTool,
  runPPCalculator: runPPCalculator,
  runBOPPCalculator: runBOPPCalculator
};
