# WinUI 博客 —— 迁移包说明

本文件夹包含一个 **WinUI 3 风格博客应用**的全部自研源码与迁移说明。它原本在
`winuionweb` 仓库中以独立入口(`blog.html`)运行,现在整体搬迁到你的博客仓库。

**重要**:本包**不包含** WinUI 控件库本体(`WinNavigationView`、`WinAutoSuggestBox`、
`WinTitleBar`、`WinScrollViewer`、`WinTextBlock`、`WinToolTipService` 等组件,以及
`styles/theme.css`、`styles/animations.css`、Segoe 图标字体、i18n)。这些来自
winuionweb 控件库,你已计划用**子仓库**方式引入,引用问题自行处理。

---

## 1. 文件清单

```
Migration/
├── MIGRATION.md            # 本文档
├── blog.html               # 博客入口 HTML(挂载 /src/blog/main.ts)
├── vite.config.ts          # 多入口配置参考(需合并进目标仓库的 vite 配置)
└── src/blog/
    ├── main.ts             # 博客入口:挂载 App、引入全局样式、provide 中文 i18n
    ├── App.vue             # 应用外壳(核心):标题栏 + 侧栏导航树 + 搜索 + 页面切换 + 主题
    ├── data/posts.ts       # 文章数据层:分类 + 文章目录 + md 原文导入
    ├── posts/              # 示例文章(4 篇 .md,按原文导入)
    │   ├── winui-intro.md
    │   ├── first-app.md
    │   ├── navigationview.md
    │   └── theming.md
    └── pages/
        ├── HomePage.vue    # 首页(hero + 统计卡片 + 分类卡片 + 最近文章列表)
        └── ArticlePage.vue # 文章详情(只读文本显示 md 原文,后续替换为渲染器)
```

## 2. 用到的控件库部件(来自子仓库,不在本包)

| 部件 | 用途 | 关键 API 用法 |
| --- | --- | --- |
| `WinNavigationView` | 左侧侧栏导航 | `:MenuItems` 数组驱动多级菜单;`@ItemInvoked`;`:SelectedItem` 双向;`#AutoSuggestBox` slot |
| `WinAutoSuggestBox` | 顶部搜索框 | `v-model:Text`、`:ItemsSource`、`TextMemberPath`、`@TextChanged/@SuggestionChosen/@QuerySubmitted`、`QueryIcon="Find"` |
| `WinTitleBar` | 窗口标题栏(PWA 窗口控制覆盖时才可见) | `:title`、`:theme`;配合 `provide('winTitleBarVisible')` |
| `WinToolTipService` | 全局 ToolTip 服务 | 直接放在根节点旁 |
| `WinScrollViewer` | 内容滚动容器 | `VerticalScrollBarVisibility="Auto"` `VerticalScrollMode="Auto"` |
| `WinTextBlock` | 只读文本(md 原文显示) | `:Text`、`IsTextSelectionEnabled` |
| `styles/theme.css` | 主题变量(浅/深色) | `html.theme-light` / `html.theme-dark` 类切换 |
| `styles/animations.css` | 动效关键帧 | 全局引入即可 |
| `assets/Fonts/SEGOEICONS.TTF` | Segoe Fluent 图标字体 | 需 `@font-face` + `.icon` 等类挂 `WinUIOnWebIcons` 字体族 |
| `components/i18n/index.ts` | 组件内部文案(`createI18n`/`i18nKey`) | 组件有 en-US 默认值;provide 中文可选 |

## 3. 复原步骤(给下一个你的 checklist)

1. **放文件**:把 `src/blog/` 整个拷进目标仓库(保持 `src/blog/...` 相对结构)。

2. **合并 vite 多入口**:目标仓库 `vite.config.ts` 的 `build.rollupOptions.input` 加上
   `blog.html` 入口(参考本包 `vite.config.ts`,其中 `base` 与端口按目标仓库实际调整)。
   `blog.html` 拷到仓库根目录(与 `index.html` 同级)。

3. **修 import 路径**:所有 `../components/xxx.vue`、`../../components/xxx.vue` 指向
   控件库的新位置(子仓库安装方式决定,可能是 npm 包名或新的相对路径)。涉及文件:
   - `src/blog/main.ts` → `../components/i18n/index`
   - `src/blog/App.vue` → `../components/` 下 5 个组件
   - `src/blog/pages/HomePage.vue`、`ArticlePage.vue` → `../../components/` 下 2 个组件
   - 控件库若也提供 `theme.css`/`animations.css`,`App.vue` 里的 `@import '../styles/...'`
     和 `main.ts` 里的 `import '../styles/...'` 同样改为新位置。

4. **图标字体**:`App.vue` 的非 scoped `<style>` 里有 `@font-face`(`SEGOEICONS.TTF`,
   相对路径 `../assets/Fonts/SEGOEICONS.TTF`)和一串 `.icon` 字体族规则——字体文件路径
   改为控件库资产的实际位置。

5. **i18n**:若控件库以子仓库方式提供且已自带 i18n 初始化,可删掉 `main.ts` 里的
   `createI18n`/`provide` 两行;否则保留(组件未 provide 时也有默认英文文案,不影响运行)。

6. **验证**:
   - `npm run build` 通过(可只看 blog 入口产物)
   - 浏览器打开 blog 入口:侧栏显示「首页」+ 各分类;点分类展开出文章标题;点标题右侧
     显示 md 原文;顶部搜索框输入能过滤文章标题、回车/选中可跳转
   - 切换系统深浅色,界面跟随变化

## 4. 关键实现细节(复原时别破坏这些约定)

- **菜单结构(硬性限制)**:`WinNavigationView` 的 Left 面板菜单**只支持两级展开**
  (顶级项 → 一层子项,子项为叶子)。因此侧栏 = `首页`(叶子)+ 每个**分类**一个顶级项
  (可展开),分类下直接是**文章标题**(叶子)。分类项必须设 `SelectsOnInvoked: false`
  (点击只展开、不改变当前选中页)。不要试图做「文章→子分类→标题」三级,控件不支持,
  除非改控件库。

- **选中态同步**:`selectedItem` 是 computed(get 从 `menuItems` 树里按 `currentPage`
  反查菜单项,set 触发导航),这是 NavigationView 高亮正确性的关键,照抄 `App.vue` 的
  `findMenuItem` 实现。

- **主题**:`html` 上挂 `theme-light`/`theme-dark` 类(无类 = 跟随系统)。`App.vue` 里
  `applyTheme()` + `watch(themeSetting, immediate)` 已实现,并写入
  `localStorage['winui-theme-setting']`。分类徽标等用 `--accent-*` 变量,深浅色自动适配。

- **md 原文导入(零依赖)**:`data/posts.ts` 用
  `import.meta.glob('../posts/*.md', { eager: true, query: '?raw', import: 'default' })`。
  注意 **不能用 `as: 'raw'`**(Vite 8/rolldown 下会报 ParseError),必须用
  `query: '?raw' + import: 'default'`。文章目录(`posts` 数组)目前手写,支持
  `slug / title / category / date` 字段,新增文章 = 加一条记录 + 放一个同名 `.md`。

- **搜索**:`#AutoSuggestBox` slot 里放 `WinAutoSuggestBox`,`ItemsSource` 是
  `{ title, slug }[]`;`@TextChanged` 里按标题过滤(仅 `Reason === 'UserInput'` 时);
  `@SuggestionChosen` / `@QuerySubmitted` 拿 `slug` 跳转。

- **页面切换**:`currentPage` ref('home');`<Transition name="blog-fade" mode="out-in">`
  包首页/文章页;两个页面各自外层套 `WinScrollViewer`(内容区 `overflow: hidden`,
  滚动必须由页面自己管)。

- **md 原文显示**:`ArticlePage` 用 `WinTextBlock`(`IsTextSelectionEnabled`)+ class
  `white-space: pre-wrap; overflow-wrap: break-word;` 等宽字体。**不要**给它传
  `TextWrapping`(组件会内联覆盖 white-space)。后续接 markdown 渲染器时,只需替换
  `ArticlePage.vue` 中 `WinTextBlock` 这个节点,数据层不用动。

## 5. 后续扩展建议(不在本次范围内)

- markdown 渲染:引入渲染库后在 `ArticlePage` 替换显示节点;md 里可加 frontmatter,
  `data/posts.ts` 改为解析 frontmatter 生成目录,去掉手写 `posts` 数组。
- URL 路由:目前是内存状态(`currentPage`),可加 `hash` 或 `history` 路由,把
  `currentPage` 与 URL 绑定;侧栏选中/展开态跟随。
- 文章页「上一篇/下一篇」、目录(TOC)等,基于 `posts` 数组顺序即可实现。
