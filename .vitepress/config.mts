import { defineConfig, HeadConfig } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

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
        '<a href="https://beian.miit.gov.cn/" target="_blank">粤ICP备XXXXXXXX号-1</a>',
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
