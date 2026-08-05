#!/usr/bin/env node
// 极简静态文件服务器：serve build 产物（dist/），带 SPA fallback（try_files 语义）。
// 用于本地验证打包产物（history 路由 F5 刷新 / 直达 / 资源路径）。
//
// 用法：
//   node scripts/serve.mjs            # 默认端口 4173，serve dist/
//   node scripts/serve.mjs --port 8080
//   node scripts/serve.mjs --root out  # 指定目录
//
// try_files 行为（与 nginx `try_files $uri $uri/ /index.html;` 等价）：
//   1. 请求路径命中真实文件 → 返回该文件
//   2. 否则回退到 index.html（SPA 接管路由）

import { createServer } from 'node:http';
import { createReadStream, existsSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = resolve(fileURLToPath(import.meta.url), '..');

// ---- 参数解析 ----
const args = process.argv.slice(2);
const argVal = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1] : fallback;
};
const PORT = Number(argVal('--port', '4173'));
const ROOT = resolve(process.cwd(), argVal('--root', 'dist'));

// ---- MIME 表 ----
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

const mimeOf = (filePath) => MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';

// ---- 路径安全：确保解析后的路径在 ROOT 内 ----
const safeResolve = (pathname) => {
  const decoded = decodeURIComponent(pathname);
  const target = normalize(join(ROOT, decoded));
  if (target !== ROOT && !target.startsWith(ROOT + sep)) return null; // 路径穿越防护
  return target;
};

const serveFile = (res, filePath) => {
  const stat = statSync(filePath);
  res.writeHead(200, {
    'Content-Type': mimeOf(filePath),
    'Content-Length': stat.size,
  });
  createReadStream(filePath).pipe(res);
};

const server = createServer((req, res) => {
  const pathname = (req.url ?? '/').split('?')[0];
  const filePath = safeResolve(pathname);

  if (!filePath) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  // try_files $uri：直接命中文件
  if (existsSync(filePath) && statSync(filePath).isFile()) {
    serveFile(res, filePath);
    return;
  }

  // try_files $uri/：目录 → 找 index.html
  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    const indexPath = join(filePath, 'index.html');
    if (existsSync(indexPath)) {
      serveFile(res, indexPath);
      return;
    }
  }

  // SPA fallback：回退 index.html（history 路由刷新/直达）
  const fallback = join(ROOT, 'index.html');
  if (existsSync(fallback)) {
    serveFile(res, fallback);
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

server.listen(PORT, () => {
  console.log(`Serving ${ROOT} at http://localhost:${PORT}/ (SPA fallback enabled)`);
});
