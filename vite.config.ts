import { defineConfig, type Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { cpSync, existsSync } from 'node:fs';
import { resolve } from 'node:path';

// 精确复制内容资产：docs/posts/image（文章图片/视频）→ dist/posts/image，
// docs/public（favicon/beian/posts.json）→ dist/public。
// 并为 History 路由生成 404.html（= index.html，作为 nginx try_files 之外的兜底）。
// build 时关闭 publicDir 全量复制（copyPublicDir: false），避免把 .md 源文件也复制进产物。
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
      // History 路由兜底：直接访问 /posts/xxx 时若服务器未配 try_files，返回该页
      const indexHtml = resolve(__dirname, 'dist/index.html');
      if (existsSync(indexHtml)) {
        cpSync(indexHtml, resolve(__dirname, 'dist/404.html'));
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [vue(), copyContentAssets()],
  // dev 时 docs 作为静态资源根（/posts/image/...、/public/... 可访问）；
  // build 时 copyPublicDir=false，产物只含插件复制的内容资产，不含 .md 源码
  publicDir: 'docs',
  resolve: {
    alias: {
      // WinUIonWeb 控件库（submodule）源码根，抹平 仓库根/WinUIonWeb/src 三层嵌套
      winui: resolve(__dirname, 'winuionweb/WinUIonWeb/src'),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    copyPublicDir: false,
  },
});
