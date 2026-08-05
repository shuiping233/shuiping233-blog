import { defineConfig, type Plugin, type Connect } from 'vite';
import vue from '@vitejs/plugin-vue';
import { createReadStream, cpSync, existsSync, statSync } from 'node:fs';
import { extname, resolve } from 'node:path';

const MIME: Record<string, string> = {
  '.webp': 'image/webp',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.mp4': 'video/mp4',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.json': 'application/json',
  '.ttf': 'font/ttf',
};

// dev 模式：把内容资产（docs/posts/image、docs/public）以中间件方式 serve，
// 使 /posts/image/...、/public/... 可访问。不设 publicDir 指向 docs——
// 否则 docs 下的 .md 会变成 public 资产，无法从 JS import（import.meta.glob 会报错）。
function serveContentAssets(): Plugin {
  return {
    name: 'serve-content-assets',
    apply: 'serve',
    configureServer(server) {
      const middleware: Connect.NextHandleFunction = (req, res, next) => {
        // URL 里的中文/空格是百分号编码的，需 decode 后才能匹配文件系统路径
        const url = decodeURIComponent((req.url ?? '').split('?')[0]);
        let filePath: string | null = null;
        if (url.startsWith('/posts/image/')) {
          filePath = resolve(__dirname, 'docs', url.slice(1));
        } else if (url.startsWith('/public/')) {
          filePath = resolve(__dirname, 'docs', url.slice(1));
        }
        if (filePath && existsSync(filePath) && statSync(filePath).isFile()) {
          const mime = MIME[extname(filePath).toLowerCase()] ?? 'application/octet-stream';
          res.setHeader('Content-Type', mime);
          createReadStream(filePath).pipe(res);
          return;
        }
        next();
      };
      server.middlewares.use(middleware);
    },
  };
}

// 构建产物：精确复制内容资产 docs/posts/image → dist/posts/image、
// docs/public → dist/public，并生成 404.html（History 路由兜底）。
function copyContentAssets(): Plugin {
  return {
    name: 'copy-content-assets',
    apply: 'build',
    closeBundle() {
      const copy = (from: string, to: string) => {
        if (existsSync(from)) cpSync(from, to, { recursive: true });
      };
      copy(
        resolve(__dirname, 'docs/posts/image'),
        resolve(__dirname, 'dist/posts/image'),
      );
      copy(
        resolve(__dirname, 'docs/public'),
        resolve(__dirname, 'dist/public'),
      );
      const indexHtml = resolve(__dirname, 'dist/index.html');
      if (existsSync(indexHtml)) {
        cpSync(indexHtml, resolve(__dirname, 'dist/404.html'));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), serveContentAssets(), copyContentAssets()],
  resolve: {
    alias: {
      // WinUIonWeb 控件库（submodule）源码根，抹平 仓库根/WinUIonWeb/src 三层嵌套
      winui: resolve(__dirname, 'winuionweb/WinUIonWeb/src'),
    },
  },
  server: {
    port: 5173,
    watch: {
      // .vscode-edge-debug 是 VS Code Edge 调试器（F5）留下的 profile/session，
      // 文件被 Edge 进程锁定，chokidar watch 会 EBUSY 崩溃，需忽略
      ignored: ['**/.vscode-edge-debug/**', '**/.reasonix/**'],
    },
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  },
});
