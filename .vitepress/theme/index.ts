import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import { useData } from "vitepress";
import "./custom.css";

// export default DefaultTheme;
export default {
  extends: DefaultTheme,
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-before": () => {
        const { frontmatter } = useData();

        // 1. 获取日期：从 frontmatter 中读取（由 transformPageData 注入）
        const date = frontmatter.value.date
          ? new Date(frontmatter.value.date).toLocaleDateString("zh-CN")
          : "";
        
        // 获取最后修改时间
        const lastUpdated = frontmatter.value.lastUpdated
          ? new Date(frontmatter.value.lastUpdated).toLocaleDateString("zh-CN")
          : "";

        // 2. 获取字数和时间：从 frontmatter 中读取（由 transformPageData 注入）
        const words = frontmatter.value.words || 0;
        const readTime = frontmatter.value.readTime || 0;

        // 3. 首页不显示
        if (frontmatter.value.layout === "home") return null;

        // 4. 如果没有任何数据，不显示
        if (!date && !lastUpdated && words === 0) return null;

        return h(
          "div",
          {
            style:
              "margin-bottom: 24px; color: var(--vp-c-text-2); font-size: 14px; display: flex; flex-wrap: wrap; gap: 18px; opacity: 0.8;",
          },
          [
            date ? h("span", null, `📅 发布于: ${date}`) : null,
            lastUpdated && lastUpdated !== date ? h("span", null, `🔄 更新于: ${lastUpdated}`) : null,
            words > 0 ? h("span", null, `📝 字数: ${words} 字`) : null,
            readTime > 0 ? h("span", null, `⌛ 预计: ${readTime} 分钟`) : null,
          ].filter(Boolean),
        );
      },
    });
  },
} satisfies Theme;
