/**
 * Submits all canonical site URLs (main pages, blogs, products, calculators,
 * llms.txt, and all 4,134 manufacturer route pages) to IndexNow (Bing / Copilot / Search).
 *
 * Usage:
 *   node seo-city-engine/scripts/submit-indexnow.js [--dry-run] [--key=<hex>]
 */

const fs = require('fs');
const path = require('path');
const https = require('https');

const siteRoot = path.resolve(__dirname, '..', '..');
const dryRun = process.argv.includes('--dry-run');
const keyArg = process.argv.find(a => a.startsWith('--key='));
const indexNowKey = keyArg ? keyArg.split('=')[1].trim() : '9c8b7a6e5d4f3a2b1c0e9d8f7a6b5c4d';
const host = 'www.dwarkeshpolyfab.com';
const keyLocation = `https://${host}/${indexNowKey}.txt`;

function extractLocs(xmlPath) {
  if (!fs.existsSync(xmlPath)) return [];
  const xml = fs.readFileSync(xmlPath, 'utf8');
  const locs = [];
  const re = /<loc>\s*(https?:\/\/[^<\s]+)\s*<\/loc>/gi;
  let m;
  while ((m = re.exec(xml)) !== null) {
    locs.push(m[1].trim());
  }
  return locs;
}

const sitemapFiles = [
  'sitemap-main.xml',
  'sitemap-manufacturers-1.xml',
  'sitemap-manufacturers-2.xml',
  'sitemap-manufacturers-3.xml',
  'sitemap-manufacturers-4.xml'
];

const urlSet = new Set([
  `https://${host}/llms.txt`,
  `https://${host}/llms-full.txt`,
  `https://${host}/manufacturers/printed-pp-bags/changodar.html`,
  `https://${host}/manufacturers/printed-pp-bags/anand.html`,
  `https://${host}/manufacturers/pp-woven-bags/hazaribagh.html`,
  `https://${host}/manufacturers/multicolour-pp-woven-bags/agra.html`
]);

for (const file of sitemapFiles) {
  for (const url of extractLocs(path.join(siteRoot, file))) {
    urlSet.add(url);
  }
}

const allUrls = Array.from(urlSet);
console.log(`Collected ${allUrls.length} unique URLs across sitemaps + AI manifests.`);

// Update indexnow-submit.json with core site pages + sample hub URLs (keep compact)
const mainLocs = extractLocs(path.join(siteRoot, 'sitemap-main.xml'));
const coreManifestUrls = Array.from(new Set([
  ...mainLocs,
  `https://${host}/llms.txt`,
  `https://${host}/llms-full.txt`,
  `https://${host}/manufacturers/printed-pp-bags/changodar.html`,
  `https://${host}/manufacturers/printed-pp-bags/anand.html`,
  `https://${host}/manufacturers/pp-woven-bags/hazaribagh.html`,
  `https://${host}/manufacturers/multicolour-pp-woven-bags/agra.html`
]));

fs.writeFileSync(
  path.join(siteRoot, 'indexnow-submit.json'),
  JSON.stringify({ host, key: indexNowKey, keyLocation, urlList: coreManifestUrls }, null, 2) + '\n',
  'utf8'
);

if (dryRun) {
  console.log(`Dry run complete. Ready to submit ${allUrls.length} URLs using key ${indexNowKey}.`);
  process.exit(0);
}

function postJson(endpoint, payloadObj) {
  return new Promise((resolve, reject) => {
    const body = JSON.stringify(payloadObj);
    const urlObj = new URL(endpoint);
    const req = https.request({
      hostname: urlObj.hostname,
      port: 443,
      path: urlObj.pathname,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'Content-Length': Buffer.byteLength(body)
      }
    }, res => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => resolve({ endpoint, status: res.statusCode, body: data }));
    });
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

(async () => {
  // IndexNow accepts up to 10,000 URLs per POST
  const batchSize = 5000;
  for (let i = 0; i < allUrls.length; i += batchSize) {
    const batch = allUrls.slice(i, i + batchSize);
    const payload = { host, key: indexNowKey, keyLocation, urlList: batch };
    const res = await postJson('https://api.indexnow.org/indexnow', payload);
    console.log(`IndexNow batch (${batch.length} URLs) -> HTTP ${res.status} ${res.body || 'OK'}`);
  }
})();
