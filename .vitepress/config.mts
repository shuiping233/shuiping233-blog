import { defineConfig, ScaffoldThemeType } from "vitepress";
import { withSidebar } from "vitepress-sidebar";

// https://vitepress.dev/reference/site-config
const vitePressConfigs = {
  srcDir: "docs",
  lang: "zh-CN",

  title: "shuiping233 blog",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/index" },
      { text: "友情链接", link: "/friend-links" },
    ],

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
      // scanStartPath: "posts",
      // basePath: "/posts/",
      // resolvePath: "/posts/",
      useTitleFromFileHeading: true,
      collapsed: false,
    },
  ]),
);
