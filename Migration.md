# Migration.md — 从 VitePress 迁出，自建博客框架（WinUIonWeb 控件）

> 目标：**彻底移除 `vitepress` 及其默认主题**，用 [WinUIonWeb](https://github.com/furry-xiyi/WinUIonWeb) 控件库
> （Vue 组件）自建博客 UI。文章内容（`docs/` 下的 `.md` 与图片）保持不变，只替换渲染与框架层。
>
> 本文档是**迁出 VitePress 的注意事项清单**，供重构时对照，避免漏掉 VitePress 隐式提供的能力。
> 与 `WinUIonWeb` 仓库内 `Migration/MIGRATION.md`（把 blog 迁入 WinUIonWeb 的说明）配合阅读。

---

## 0. 当前状态（2026-08 已完成）

新框架已落地并验证通过，VitePress 已彻底移除：

- **技术栈**：Vue 3.5 + Vite 8（rolldown）+ TypeScript + pnpm；控件库通过 git submodule 挂
  `winuionweb/`（alias `winui` → `winuionweb/WinUIonWeb/src`，见 `vite.config.ts`）
- **Markdown 渲染**：`markstream-vue`（`<MarkdownRender custom-id="blog" :content>` + `:custom-markdown-it`）+ 
  `github-markdown-css`（`.markdown-body` 容器），样式见 `src/blog/styles/blog.css`
- **渲染能力**：emoji 短码（`:tada:`）通过 `markdown-it-emoji` 插件注入（`src/blog/markdown.ts`）；GitHub Alert
  （`> [!WARNING]`）在数据层预转换为 markstream 原生 `::: warning` 容器（`src/blog/data/posts.ts` 的
  `convertGithubAlerts`，支持 NOTE/TIP/IMPORTANT/WARNING/CAUTION）；`::: tip` 等容器、表格、代码块、
  `<video>` 原生 HTML 均正常渲染
- **页面结构**（`src/blog/`）：
  - `App.vue` — WinTitleBar + WinNavigationView（首页 + 分类「未分类」+ 文章标题）+ WinAutoSuggestBox 搜索 + FooterMenuItems「设置」
  - **URL 路由（History 模式）**：`/` → 首页、`/posts/:slug` → 文章（中文/空格 slug 经 encodeURIComponent）、
    `/settings` → 设置；`navigate()` 统一 pushState，加载时解析 `location.pathname`（支持刷新/直达），
    监听 `popstate`（前进/后退）；构建时生成 `404.html`（= index.html）作回退兜底
  - `pages/HomePage.vue` — 渲染 `docs/index.md`（欢迎语 + 项目列表）
  - `pages/ArticlePage.vue` — markstream-vue 渲染文章
  - `pages/SettingsPage.vue` — 外观 → 主题 → WinRadioButtons 一行（跟随系统/浅色/深色），默认跟随系统
  - `data/posts.ts` — `import.meta.glob` 扫描 `docs/posts/*.md`，解析 frontmatter
  - **分类**：frontmatter `category: 分类名`（单值字符串），数据层动态构建分类列表，未指定归「未分类」；
    分类 id 由分类名派生（kebab-case）
  - **footer**：`components/BlogFooter.vue` — CC BY-NC-SA 4.0 + 粤ICP备2026039817号 + 粤公网安备44060402003189号
  - **图片查看器**：`components/CustomImageNode.vue` 包装 markstream ImageNode，点击用 viewerjs 灯箱
- **构建**：`pnpm build` = `vue-tsc --noEmit && vite build`；dist 只含 `assets/`、`posts/image/`（图片视频，由
  vite 插件复制）、`public/`（favicon/beian/posts.json）、`index.html`、`404.html`
- **性能**：页面级懒加载（defineAsyncComponent），markstream（约 650KB）按需加载，首屏主 chunk ≈ 179KB
- **已删除**：`.vitepress/`、`docs/posts-list.md`、`docs/friend-links.md`、vitepress/vitepress-sidebar 依赖
- **已知待补**：暂无阻塞项（分类/viewerjs/footer/懒加载均已完成）；后续可考虑 SSG 预渲染提升 SEO

下方注意事项仍有效，供后续扩展（路由、分类、图片查看器等）对照。

---

## 1. 现状盘点：VitePress 隐式提供了什么

当前博客（`shuiping233-blog`）表面上只有几篇 md，但框架层大量能力来自 VitePress 及其默认主题：

```
docs/
├── index.md              # 首页：layout: home 逻辑（含项目列表）
├── posts-list.md         # 文章列表页：<PostsList /> 组件（fetch /posts.json 按日期归档）
├── friend-links.md       # 友情链接
├── posts/*.md            # 文章（frontmatter: title/createAt/updateAt）
├── posts/image/**        # 文章图片（webp、mp4），md 里用相对路径引用
└── public/
    ├── posts.json        # gen-posts-json.ts 生成的归档索引
    ├── beian.png         # 公安备案图标
    └── vitepress-logo-mini.svg  # favicon

.vitepress/
├── config.mts            # transformPageData（字数/阅读时间）、md 插件、local search、gzip
└── theme/
    ├── index.ts          # 默认主题扩展：footer 备案、doc-before 元信息、viewerjs
    ├── custom.css        # viewerjs 样式 + footer/备案样式
    └── components/PostsList.vue

scripts/                  # 与 VitePress 无关，可原样保留（见 §4）
.github/workflows/deploy.yml  # pnpm build → SCP dist/* → 远端 update_blog.sh
.husky/pre-commit         # lint-staged（md 元数据）+ gen-posts-json
```

### VitePress 提供、自研必须替代的能力

| # | VitePress 能力 | 现状实现位置 | 自研替代方案 |
| --- | --- | --- | --- |
| 1 | Markdown → HTML（代码高亮、表格、`::: tip` 容器、GitHub Alert、emoji 短码） | `config.mts` `markdown` | `markdown-it` + 插件（可复用 `markdown-it-image-lazy-loading`；高亮建议 `markdown-it-shiki` 或 `highlight.js`） |
| 2 | frontmatter 解析 | VitePress 内置 | `gray-matter` 或自研解析器（`scripts/add-md-metadata.ts` 里已有简化版可参考） |
| 3 | 文件系统路由（`docs/posts/hello.md` → `/posts/hello`） | VitePress 内置 | 构建期生成路由表，或 `import.meta.glob` 扫描 `.md` 文件 |
| 4 | SSG 静态生成（每页预渲染 HTML、`404.html`、SEO title/meta） | VitePress 构建 | 注意：WinUIonWeb 雏形是纯 SPA（内存路由）。若在乎 SEO/首屏，文章页需构建期预渲染（vite-ssg / 自写构建脚本） |
| 5 | 本地搜索（minisearch，中文友好） | `themeConfig.search` | WinUIonWeb 的 `WinAutoSuggestBox`（雏形已有，按标题过滤） |
| 6 | 侧栏自动生成（vitepress-sidebar） | `withSidebar(...)` | `WinNavigationView` 两级菜单（分类 → 文章标题，见 §3.1） |
| 7 | 深浅色主题（`--vp-*` 变量、`theme-dark` 类） | 默认主题 + custom.css | WinUIonWeb `theme.css`（`html.theme-light`/`html.theme-dark`，雏形已有切换逻辑） |
| 8 | 阅读时间/字数 | `transformPageData`（基于去掉 frontmatter 的正文） | 数据层保留 `reading-time` 计算，注意口径要一致：**先剥掉 `---` frontmatter 再算** |
| 9 | 图片懒加载 | `markdown-it-image-lazy-loading` | 保留同款 markdown-it 插件 |
| 10 | 图片查看器 viewerjs | `theme/index.ts`（挂在 `.vp-doc` 容器） | 保留 viewerjs，选择器换成新文章容器 |
| 11 | 构建产物 gzip 压缩 | `vite-plugin-compression` | 原样搬到新 `vite.config.ts` |
| 12 | footer 备案（CC BY-NC-SA 4.0 + 粤ICP备 + 公安备案） | `theme/index.ts` `layout-bottom` 插槽 | 自定义 footer 组件，文案/链接照抄 |
| 13 | 文章元信息条（📅 发布/🔄 更新/📝 字数/⌛ 阅读时间） | `theme/index.ts` `doc-before` 插槽 | 新 `ArticlePage` 里渲染 |
| 14 | 首页（`layout: home` + 项目列表） | `docs/index.md` | 新 `HomePage` 数据化（雏形已有 hero/统计/卡片） |
| 15 | 文章列表页（按日期归档、可折叠） | `PostsList.vue` + `posts.json` | 保留 `gen-posts-json.ts` 生成数据，列表页换 WinUI 风格组件 |

---

## 2. 关键约束与坑（务必逐条看）

### 2.1 WinNavigationView 菜单只支持两级
Left 面板菜单**最多两级展开**（顶级项 → 一层叶子子项）。所以侧栏结构必须是：

```
首页（叶子）
分类A（顶级，可展开）
  └─ 文章1（叶子）
  └─ 文章2（叶子）
分类B（顶级，可展开）
  └─ ...
```

- 分类顶级项必须 `SelectsOnInvoked: false`（点击只展开、不改选中页）。
- **不要**做「分类 → 子分类 → 文章」三级，控件不支持，除非改控件库。
- 选中态同步：`selectedItem` 用 computed，get 从菜单树按 `currentPage` 反查、set 触发导航
  （照抄 WinUIonWeb `App.vue` 的 `findMenuItem`）。

### 2.2 `import.meta.glob` 导入 md 原文的写法
```
import.meta.glob('../posts/*.md', { eager: true, query: '?raw', import: 'default' })
```
**不能用 `as: 'raw'`**（Vite 8 / rolldown 下报 ParseError）。必须 `query: '?raw'` + `import: 'default'`。
（这是 WinUIonWeb 雏形里踩过的坑，见 `data/posts.ts`。）

### 2.3 文章里的图片/视频是相对路径
md 里写的是 `![x](image/hello/1776084507027.webp)`、`<video src="./image/hello/xxx.mp4">`。
- VitePress 构建时会打包进 `dist/assets/` 并重写 URL；自研框架要么把图片作为模块资源让 Vite 处理，
  要么放到 `public/` 用绝对路径，**必须自己决定并统一**。
- 注意 `docs/posts/image/...` 现在跟着文章目录走，迁移时别弄丢（mp4 61KB、webp 66KB 等）。

### 2.4 文章正文里有裸 HTML 和 VitePress 专属语法
`hello.md` 里实际包含：`<video>` 标签、`::: info/tip/warning/danger/details` 容器、
`> [!WARNING]` GitHub Alert、`:tada:` emoji 短码、表格、多语言代码块（bash/json/md/xml）。
选 markdown-it 插件时这些都要覆盖：
- 容器：`markdown-it-container`（或直接选已内置容器的封装）
- emoji：`markdown-it-emoji`
- GFM 表格：markdown-it 自带 `table` 规则即可
- 裸 HTML 默认允许（`html: true`）

### 2.5 WinTextBlock 的坑（未接渲染器前的过渡方案）
雏形用 `WinTextBlock` 显示 md 原文：
- 不要传 `TextWrapping`（组件会内联覆盖 `white-space`），用 class 控制
  `white-space: pre-wrap; overflow-wrap: break-word;` + 等宽字体。
- 接上 markdown 渲染器后，只需替换 `ArticlePage.vue` 里这个节点，数据层不用动。

### 2.6 阅读时间口径
`config.mts` 的 `transformPageData` 是**先 `replace(/^---[\s\S]*?---/, '')` 剥掉 frontmatter**，
再用 `reading-time` 计算。自研数据层必须保持同一口径，否则字数/分钟数和旧站不一致。

### 2.7 滚动容器
内容区 `overflow: hidden`，滚动必须由每页自己的 `WinScrollViewer` 管
（`VerticalScrollBarVisibility="Auto"` + `VerticalScrollMode="Auto"`）。页面切换用
`<Transition name="blog-fade" mode="out-in">`。

### 2.8 部署链路
- `.github/workflows/deploy.yml`：`pnpm build` → `appleboy/scp-action` 把 `dist/*` 传到
  `/tmp/shuiping233-blog` → ssh 执行远端 `bash /usr/local/sbin/update_blog.sh`。
- 自研后 **dist 目录结构/入口文件名变了**，SCP 的 `source: "dist/*"` 一般不用改，但远端
  `update_blog.sh` 假设的产物路径（如 `index.html`、`assets/`）要核对。
- gzip 产物（`.gz`）由 vite-plugin-compression 生成，远端 nginx 是否开启 gzip_static 需确认。

### 2.9 前端路由与 404
已实现 **History 路由**（`/`、`/posts/:slug`、`/settings`），dist 含 `404.html`（= index.html）兜底。
**部署时服务器必须配回退**，否则刷新/直达文章页会 404：
- nginx：`location / { try_files $uri $uri/ /index.html; }`
- 若用 `vite preview` / `serve`：`npx serve -s dist`（`-s` 即 SPA fallback）
- 纯静态托管（GitHub Pages 等）：用 404.html 兜底 trick（dist 已生成）
- 部署脚本 `deploy.yml` 目前 SCP `dist/*`，远端 `update_blog.sh` 需确认 nginx 已配 `try_files`

**性能 / 缓存配置**（Lighthouse 建议，nginx 一并配置）：
```nginx
# 预压缩 gzip 文件直出（dist 已生成 *.gz）
gzip_static on;

# 带 hash 的静态资源（assets/**）可长缓存
location /assets/ {
    expires 30d;
    add_header Cache-Control "public, immutable";
}

# 无 hash 的 HTML 不缓存（保证更新即时可见）
location = /index.html {
    add_header Cache-Control "no-cache";
}
```
- `.gz` 文件由 `vite-plugin-compression` 生成，nginx `gzip_static on` 直接服务预压缩文件（省 CPU）
- 字体 `SEGOEICONS.TTF`（454KB）在 `/assets/` 内，长缓存 + `font-display: swap`（blog.css 已配）避免阻塞渲染

### 2.10 SEO / meta
VitePress 自动输出 `title`、`lang`、`meta description`。雏形 `main.ts` 只有
`document.title = 'WinUI 博客'`。自研时按文章设置 `document.title`（frontmatter title），
`index.html` 里补 `lang="zh-CN"` 与 description。

---

## 3. WinUIonWeb 仓库已有的雏形（能直接用的别重写）

`C:\programing\frontend\WinUIonWeb\WinUIonWeb\`（注意：仓库根在**嵌套一层**的 `WinUIonWeb\WinUIonWeb\`）：

```
src/blog/
├── main.ts          # 挂载 App、import theme.css/animations.css、provide 中文 i18n
├── App.vue          # 应用外壳：WinTitleBar + WinNavigationView + WinAutoSuggestBox + 页面切换 + 主题
├── data/posts.ts    # categories/posts 目录 + import.meta.glob 导入 md 原文
├── posts/*.md       # 4 篇示例文章（WinUI 主题）
└── pages/
    ├── HomePage.vue     # hero + 统计卡片 + 分类卡片 + 最近文章
    └── ArticlePage.vue  # 只读 WinTextBlock 显示 md 原文（待换渲染器）
```

**可复用**：App 外壳与导航/搜索/主题机制、HomePage 布局、`data/posts.ts` 的 glob 写法、
`Migration/vite.config.ts` 的多入口配置（`main` + `blog`）。
**缺口（迁移要补）**：markdown 渲染器、文章列表页（PostsList 归档）、友情链接页、
首页项目列表（AstrBot 等）、footer 备案、阅读时间/字数展示、URL 路由、viewerjs、404。

引入方式（**已定**）：git **submodule**，挂在博客仓库**根目录** `winuionweb/`（与 `src/` 平级）。

```
shuiping233-blog/
├── src/          # 博客自己的代码
├── winuionweb/   # ← git submodule → git@github.com:shuiping233/WinUIonWeb.git
│   └── WinUIonWeb/
│       └── src/
│           ├── components/  styles/  assets/  i18n/  ...
│           └── blog/  Migration/  blog.html   ← 见下方「待提交」警告
```

- 添加命令：`git submodule add git@github.com:shuiping233/WinUIonWeb.git winuionweb`
- **vite alias 抹平嵌套**（仓库根 → `WinUIonWeb/` 项目根 → `src/`，三层嵌套）：
  ```ts
  // vite.config.ts
  import { resolve } from 'node:path'
  resolve: {
    alias: {
      winui: resolve(__dirname, 'winuionweb/WinUIonWeb/src'),
    },
  },
  ```
  博客代码里 `import WinButton from 'winui/components/WinButton.vue'`，嵌套对代码不可见；
  将来控件库发 npm 包时删掉 alias 即可。
- **CI 必须补一步**：`actions/checkout` 默认不拉子模块，`.github/workflows/deploy.yml` 的
  Checkout 步骤后加：
  ```yaml
  - name: Checkout submodules
    run: git submodule update --init --recursive
  ```
- 控件库自身依赖 `vue`（`^3.5.32`），博客也装同版本 vue；Vite 按向上查找从博客根
  `node_modules` 解析，版本要一致避免双实例。

> ⚠️ **待提交警告**：当前 WinUIonWeb 远端 master（submodule 指向的 `476a7b45`）**不含**
> `src/blog/`、`Migration/`、`blog.html` 及 package.json/vite.config.ts 的改动——这些仍是
> WinUIonWeb 仓库里的**未提交本地文件**（`git status` 显示 `?? WinUIonWeb/src/blog/` 等）。
> 要复用雏形，需先在 WinUIonWeb 仓库 commit + push，再 `git submodule update --remote`
> 把博客侧指针前移。

---

## 4. 与框架无关、原样保留的资产

- `scripts/add-md-metadata.ts` — husky pre-commit 强制刷 `updateAt`、补 `createAt`
- `scripts/gen-posts-json.ts` — 扫描 `docs/posts` 生成 `docs/public/posts.json`（归档数据源）
- `scripts/convert-webp.ts` — sharp 转 webp 并改 md 引用
- `.husky/pre-commit` — `npx lint-staged` + `gen-posts-json.ts`
- `package.json` 里 `lint-staged` 配置（`docs/**/*.md`、图片）
- `docs/` 全部内容与图片、`env.d.ts`
- 依赖：`viewerjs`、`reading-time`、`markdown-it-image-lazy-loading`、`sharp`、`tsx`、`glob`、
  `vite-plugin-compression`、`cross-env`、`husky`、`lint-staged`

---

## 5. 迁移步骤 Checklist

1. **数据层**：把 `docs/posts/*.md` 拷进新框架（如 `src/blog/posts/`），写 `data/posts.ts` 生成
   目录（`slug/title/category/date`）。建议直接用 `gen-posts-json.ts` 的 frontmatter 解析思路，
   把 `createAt/updateAt` 也读进来，去重手写目录。
2. **渲染**：接 markdown-it 渲染器（含 §2.4 的插件），替换 `ArticlePage` 的 `WinTextBlock`；
   处理代码高亮样式 + viewerjs + 图片懒加载。
3. **页面**：HomePage（补项目列表）、ArticlePage、文章列表页（PostsList 归档，复用 posts.json）、
   友情链接页。
4. **外壳**：WinNavigationView 菜单树（首页 + 分类 + 文章，两级约束）、WinAutoSuggestBox 搜索、
   主题切换、footer 备案（CC BY-NC-SA + 粤ICP备2026039817号 + 公安备案 + beian.png）。
5. **路由**：决定 hash / history / SSG 三选一（见 §2.9），绑定 `currentPage`。
6. **构建**：合并多入口 vite 配置（保留 gzip 插件），`base` 按部署方式设（服务器根路径 or 子路径）。
7. **部署**：核对 deploy.yml 与远端 `update_blog.sh` 的产物假设，补 `404.html`。
8. **清理**：删 `.vitepress/`、`vitepress`/`vitepress-sidebar` 依赖、`docs/` 旧布局页
   （`index.md`/`posts-list.md`/`friend-links.md` 的内容并入新组件）。

### 验证标准
- `pnpm build` 通过，产物可被 `preview`/服务器正常访问
- 侧栏：首页 + 分类展开 + 文章标题，点击切换、高亮正确
- 搜索：输入过滤标题，回车/选中跳转
- 文章页：md 渲染（代码高亮/容器/emoji/表格/视频）、图片懒加载 + viewerjs、阅读时间正确
- 深浅色切换跟随系统、footer 备案三行齐全
- 列表页按日期归档与旧站一致（对比 `posts.json`）
- 部署后线上 URL 直达文章页（路由回退或 SSG）不 404
