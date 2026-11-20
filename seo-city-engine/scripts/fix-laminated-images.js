// Fix laminated-pp-bags pages: replace old broken image src with correct one
const fs = require('fs');
const path = require('path');

const siteRoot = path.resolve(__dirname, '../../');
const lamDir = path.join(siteRoot, 'manufacturers', 'laminated-pp-bags');
const outputDir = path.join(siteRoot, 'seo-city-engine', 'output', 'manufacturers', 'laminated-pp-bags');

const OLD_SRC_PATTERN = /src="\.\.\/\.\.\/assets\/images\/products\/pp-woven-bags\.png"/g;
const NEW_SRC = 'src="../../assets/images/products/laminated-pp-bags.webp"';

let fixed = 0, skipped = 0;

function fixDir(dir) {
  if (!fs.existsSync(dir)) { console.log('Dir not found:', dir); return; }
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html'));
  for (const file of files) {
    const fpath = path.join(dir, file);
    let content = fs.readFileSync(fpath, 'utf8');
    if (content.includes('pp-woven-bags.png')) {
      content = content.replace(OLD_SRC_PATTERN, NEW_SRC);
      fs.writeFileSync(fpath, content, 'utf8');
      fixed++;
    } else {
      skipped++;
    }
  }
}

fixDir(lamDir);
fixDir(outputDir);

console.log(`Done! Fixed: ${fixed}, Already OK: ${skipped}`);
