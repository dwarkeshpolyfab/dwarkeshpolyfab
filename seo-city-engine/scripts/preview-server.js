const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;
const siteRoot = 'D:\\dwarkeshpolyfab-main\\dwarkeshpolyfab';
const engineOutput = path.join(siteRoot, 'seo-city-engine', 'output');

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff'
};

const server = http.createServer((req, res) => {
  let reqUrl = req.url.split('?')[0];
  console.log(`[${new Date().toLocaleTimeString()}] ${req.method} ${req.url}`);

  // Route mapping:
  let filePath = '';

  if (reqUrl === '/' || reqUrl === '/index.html' || reqUrl === '/manufacturers' || reqUrl === '/manufacturers/') {
    filePath = path.join(engineOutput, 'index.html');
  } else if (reqUrl.startsWith('/manufacturers/')) {
    filePath = path.join(engineOutput, reqUrl);
  } else {
    // Serve static assets from site root
    filePath = path.join(siteRoot, reqUrl);
  }

  // Normalize path
  filePath = path.normalize(filePath);

  fs.stat(filePath, (err, stats) => {
    if (err || !stats.isFile()) {
      res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(`<h1>404 Not Found</h1><p>The requested file does not exist: <code>${reqUrl}</code></p>`);
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache'
    });

    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  });
});

server.listen(PORT, () => {
  console.log('================================================================');
  console.log(`🚀 RedBus pSEO Engine Preview Server Running!`);
  console.log(`🔗 Open in your browser: http://localhost:${PORT}`);
  console.log(`📌 Test Route: http://localhost:${PORT}/manufacturers/bopp-laminated-bags/mumbai.html`);
  console.log(`📌 Test Route: http://localhost:${PORT}/manufacturers/leno-bags/ludhiana.html`);
  console.log('================================================================');
});
