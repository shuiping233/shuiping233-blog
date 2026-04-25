import { defineConfig, HeadConfig } from "vitepress";
import compression from "vite-plugin-compression";
import { withSidebar } from "vitepress-sidebar";
import readingTime from "reading-time";
import { readFileSync } from "fs";
import { resolve } from "path";
import lazyLoading from "markdown-it-image-lazy-loading";

const head: HeadConfig[] = [
  [
    "link",
    {
      rel: "icon",
      type: "image/svg+xml",
      href: "vitepress-logo-mini.svg",
    },
  ],
];

// https://vitepress.dev/reference/site-config
const vitePressConfigs = {
  srcDir: "docs",
  lang: "zh-CN",
  title: "shuiping233 Blog",
  head: head,
  transformPageData(pageData: any, ctx: any) {
    // 直接从文件系统读取内容（pageData.content 可能为空）
    if (pageData.filePath) {
      try {
        const filePath = resolve("docs", pageData.filePath);
        const content = readFileSync(filePath, "utf-8");

        // 移除 frontmatter 部分（--- 之间的内容）
        const contentWithoutFrontmatter = content
          .replace(/^---[\s\S]*?---/, "")
          .trim();

        // 计算字数和阅读时间
        const stats = readingTime(contentWithoutFrontmatter);
        // 存到 pageData 而不是 frontmatter，避免干扰 sidebar
        pageData.words = stats.words;
        pageData.readTime = Math.ceil(stats.minutes);
      } catch (e) {
        console.error(
          `[vitepress] Failed to process file: ${pageData.filePath}`,
          e,
        );
        // 设置默认值
        pageData.words = 0;
        pageData.readTime = 0;
        pageData.date = "";
        pageData.updateTime = "";
      }
    }
  },

  markdown: {
    config: (md: any) => {
      // 使用图片懒加载插件
      md.use(lazyLoading);
    },
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    lastUpdated: false,

    nav: [
      { text: "主页", link: "/" },
      { text: "文章列表", link: "/posts-list" },
      { text: "友情链接", link: "/friend-links" },
    ],

    // sidebar 由 withSidebar 自动生成，但我们会通过 manualSortFileNameByPriority 控制顺序

    socialLinks: [
      { icon: "github", link: "https://github.com/shuiping233" },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/37212498",
      },
    ],
    search: {
      provider: "local",
      options: {
        locales: {
          root: {
            translations: {
              button: {
                buttonText: "搜索文档",
                buttonAriaLabel: "搜索文档",
              },
              modal: {
                noResultsText: "无法找到相关结果",
                resetButtonTitle: "清除查询条件",
                footer: {
                  selectText: "选择",
                  navigateText: "切换",
                  closeText: "关闭",
                },
              },
            },
          },
        },
      },
    },
  },

  vite: {
    plugins: [
      // Gzip 压缩
      compression({
        verbose: true,
        disable: false,
        threshold: 5 * 1024,
        // filter: () => true,
        algorithm: "gzip",
        ext: ".gz",
        compressionOptions: {
          level: 9, // Gzip 范围是 1-9
        },
      }),
      // Brotli 压缩
      // compression({
      //   verbose: true,
      //   disable: false,
      //   threshold: 5 * 1024,
      //   // filter: () => true,
      //   algorithm: "brotliCompress",
      //   ext: ".br",
      //   compressionOptions: {
      //     // Brotli 范围是 0-11
      //     // 注意：级别 11 压缩速度极慢，但压缩率最高
      //     level: 11,
      //   },
      // }),
    ],
  },
};

export default defineConfig(
  withSidebar(vitePressConfigs, {
    documentRootPath: "docs",
    useTitleFromFrontmatter: true,
    useTitleFromFileHeading: true,
    useFolderTitleFromIndexFile: true,
    collapsed: false,
    includeRootIndexFile: true,
    // 手动排序：确保主页、文章列表、友情链接排在最前面
    manualSortFileNameByPriority: [
      "index.md",
      "posts-list.md",
      "friend-links.md",
    ],
  }),
);
