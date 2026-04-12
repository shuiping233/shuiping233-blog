import { defineConfig, HeadConfig } from "vitepress";
import compression from "vite-plugin-compression";
import { withSidebar } from "vitepress-sidebar";
import readingTime from "reading-time";
import { statSync } from "fs";
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
  transformPageData(pageData: any) {
    // 计算字数和阅读时间
    const stats = readingTime(pageData.content || "");
    pageData.frontmatter.words = stats.words;
    pageData.frontmatter.readTime = Math.ceil(stats.minutes);
    
    // 如果没有设置 date，尝试从文件创建时间获取
    if (!pageData.frontmatter.date && pageData.filePath) {
      try {
        const filePath = resolve("docs", pageData.filePath);
        const stats = statSync(filePath);
        // 使用文件创建时间
        const createdDate = stats.birthtime || stats.ctime;
        pageData.frontmatter.date = createdDate.toISOString().split('T')[0];
      } catch (e) {
        // 如果获取失败，使用当前日期
        pageData.frontmatter.date = new Date().toISOString().split('T')[0];
      }
    }
    
    // 如果没有设置 lastUpdated，使用文件修改时间
    if (!pageData.frontmatter.lastUpdated && pageData.filePath) {
      try {
        const filePath = resolve("docs", pageData.filePath);
        const stats = statSync(filePath);
        pageData.frontmatter.lastUpdated = stats.mtime.toISOString().split('T')[0];
      } catch (e) {
        // 忽略错误
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
