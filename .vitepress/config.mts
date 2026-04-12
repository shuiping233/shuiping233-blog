import { defineConfig, HeadConfig } from "vitepress";
import compression from "vite-plugin-compression";
import { withSidebar } from "vitepress-sidebar";
import readingTime from "reading-time";
import { statSync, readFileSync } from "fs";
import { resolve } from "path";

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
        const content = readFileSync(filePath, 'utf-8');
        
        // 移除 frontmatter 部分（--- 之间的内容）
        const contentWithoutFrontmatter = content.replace(/^---[\s\S]*?---/, '').trim();
        
        // 计算字数和阅读时间
        const stats = readingTime(contentWithoutFrontmatter);
        // 存到 pageData 而不是 frontmatter，避免干扰 sidebar
        pageData.words = stats.words;
        pageData.readTime = Math.ceil(stats.minutes);
        
        // 获取文件状态信息
        const fileStats = statSync(filePath);
        
        // 如果没有设置 date，尝试从文件创建时间获取
        if (!pageData.frontmatter.date) {
          const createdDate = fileStats.birthtime || fileStats.ctime;
          // 存到 pageData 而不是 frontmatter
          pageData.date = createdDate.toISOString().split('T')[0];
        } else {
          pageData.date = pageData.frontmatter.date;
        }
        
        // 如果没有设置 lastUpdated，使用文件修改时间
        if (!pageData.frontmatter.lastUpdated) {
          pageData.lastUpdated = fileStats.mtime.toISOString().split('T')[0];
        } else {
          pageData.lastUpdated = pageData.frontmatter.lastUpdated;
        }
      } catch (e) {
        console.error(`[vitepress] Failed to process file: ${pageData.filePath}`, e);
        // 设置默认值
        pageData.words = 0;
        pageData.readTime = 0;
      }
    }
  },

  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config

    nav: [
      { text: "主页", link: "/" },
      { text: "友情链接", link: "/friend-links" },
    ],

    footer: {
      message:
        "本网站内容除非特别声明，采用 <a href='https://creativecommons.org/licenses/by-nc-sa/4.0/' target='_blank'>CC BY-NC-SA 4.0</a> 协议进行许可",
      copyright:
        '<a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备2026039817号</a>',
    },

    sidebar: {
      "/": {
        base: "/",
        items: [
          { text: "主页", link: "/" },
          { text: "友情链接", link: "/friend-links" },
        ],
      },
    },

    socialLinks: [
      { icon: "github", link: "https://github.com/shuiping233" },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/37212498",
      },
    ],
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
      compression({
        verbose: true,
        disable: false,
        threshold: 5 * 1024,
        // filter: () => true,
        algorithm: "brotliCompress",
        ext: ".br",
        compressionOptions: {
          // Brotli 范围是 0-11
          // 注意：级别 11 压缩速度极慢，但压缩率最高
          level: 11,
        },
      }),
    ],
  },
};

export default defineConfig(
  withSidebar(vitePressConfigs, [
    {
      documentRootPath: "docs",
      useTitleFromFileHeading: true,
      useFolderTitleFromIndexFile: true,
      collapsed: false,
    },
  ]),
);
