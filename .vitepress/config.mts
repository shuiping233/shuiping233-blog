import { defineConfig } from "vitepress";

// https://vitepress.dev/reference/site-config
export default defineConfig({
  srcDir: "posts",
  lang: "zh-CN",

  title: "shuiping233 blog",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: "主页", link: "/" },
      { text: "友情链接", link: "/friend-links" },
    ],

    sidebar: [
      {
        text: "主页",
        items: [{ text: "主页", link: "/index" }],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/shuiping233" },
      {
        icon: "bilibili",
        link: "https://space.bilibili.com/37212498",
      },
    ],
  },
});
