# shuiping233 Blog

自研 WinUI 3 风格博客框架：Vue 3 + Vite + [WinUIonWeb](https://github.com/shuiping233/WinUIonWeb) 控件库（git submodule），Markdown 渲染用 [markstream-vue](https://github.com/Simon-He95/markstream-vue) + [github-markdown-css](https://github.com/sindresorhus/github-markdown-css)。

> 已彻底移除 VitePress，迁移细节见 [Migration.md](./Migration.md)。

## 环境配置

```bash
pnpm install
npx husky init
```

> WinUIonWeb 控件库通过 git submodule 挂在 `winuionweb/`：
> ```bash
> git submodule update --init --recursive
> ```

## 命令

- `pnpm dev` — 启动 dev 服务器（Vite，默认 5173 端口）
- `pnpm build` — 类型检查 + 构建到 `dist/`
- `pnpm preview` — 预览构建产物
- `pnpm img:conv` — 转换图片为 webp
- `pnpm md:metadata` — 为 md 补齐 frontmatter 元数据
- `pnpm gen:posts-json` — 生成归档索引 `docs/public/posts.json`

## 内容

- 文章：`docs/posts/*.md`（frontmatter 支持 `title` / `createAt` / `updateAt`）
- 首页内容：`docs/index.md`
- 图片/视频：`docs/posts/image/**`，md 里用相对路径 `image/xxx` 引用

## 开发

本项目配置了 vsc `launch.json`，安装对应插件后即可 `f5` 一键启用调试和 edge 浏览器。
