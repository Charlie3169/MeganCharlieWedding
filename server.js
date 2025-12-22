const http = require('http');
const path = require('path');
const fs = require('fs');

const port = process.env.PORT || 2003;
const distDir = path.join(__dirname, 'dist');

const mimeTypes = {
  '.html': 'text/html; charset=UTF-8',
  '.css': 'text/css; charset=UTF-8',
  '.js': 'application/javascript; charset=UTF-8',
  '.svg': 'image/svg+xml',
  '.json': 'application/json; charset=UTF-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif'
};

function sendFile(filePath, res) {
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404);
      res.end('Not found');
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const urlPath = req.url === '/' ? '/index.html' : req.url;
  let decodedPath = urlPath;
  try {
    decodedPath = decodeURIComponent(urlPath);
  } catch (error) {
    decodedPath = urlPath;
  }
  const sanitized = path.normalize(decodedPath).replace(/^\.\.+/, '');
  const filePath = path.join(distDir, sanitized);
  if (filePath.startsWith(distDir) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    sendFile(filePath, res);
  } else if (!path.extname(filePath)) {
    sendFile(path.join(distDir, 'index.html'), res);
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

server.listen(port, () => {
  console.log(`Wedding site ready on http://localhost:${port}`);
});
