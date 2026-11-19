import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import os from 'node:os';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.map': 'application/json; charset=utf-8'
};

function lanAddress() {
  const nets = os.networkInterfaces();
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] || []) {
      if (net.family === 'IPv4' && !net.internal) return net.address;
    }
  }
  return '127.0.0.1';
}

function createServer(defaultFile, rewrites = {}) {
  return http.createServer((req, res) => {
    let pathname;
    try {
      pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    } catch {
      res.writeHead(400);
      res.end('Bad request');
      return;
    }

    if (pathname === '/') pathname = '/' + defaultFile;
    if (rewrites[pathname]) pathname = '/' + rewrites[pathname];
    const filePath = path.resolve(ROOT, '.' + pathname);
    if (!filePath.startsWith(ROOT + path.sep) && filePath !== ROOT) {
      res.writeHead(403);
      res.end('Forbidden');
      return;
    }

    fs.stat(filePath, (statErr, stat) => {
      if (statErr || !stat.isFile()) {
        res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
        res.end('404 Not Found');
        return;
      }
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, {
        'Content-Type': MIME[ext] || 'application/octet-stream',
        'Cache-Control': 'no-store'
      });
      fs.createReadStream(filePath).pipe(res);
    });
  });
}

const lan = lanAddress();
const servers = [];

function listen(port, defaultFile, label, rewrites) {
  const server = createServer(defaultFile, rewrites);
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') console.error(`端口 ${port} 已被占用，无法启动 ${label}`);
    else console.error(`${label} 启动失败：`, err.message);
  });
  server.listen(port, '0.0.0.0', () => {
    console.log(`${label}: http://localhost:${port}  |  局域网 http://${lan}:${port}`);
  });
  servers.push(server);
}

const legacyRewrites = {
  '/index.html': 'web/calendar-desktop.html',
  '/h5.html': 'web/calendar-mobile.html',
  '/growth.html': 'web/growth-desktop.html',
  '/growth-h5.html': 'web/growth-mobile.html'
};

listen(8001, 'web/calendar-desktop.html', '桌面版', {
  ...legacyRewrites,
  '/growth': 'web/growth-desktop.html'
});
listen(8002, 'web/calendar-mobile.html', '移动版', {
  ...legacyRewrites,
  '/growth': 'web/growth-mobile.html',
  '/growth.html': 'web/growth-mobile.html'
});

process.on('SIGINT', () => {
  servers.forEach((s) => s.close());
  process.exit(0);
});
