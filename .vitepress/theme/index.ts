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
        const { frontmatter, page } = useData();

        // 1. 获取日期：优先从 frontmatter 拿
        const date = frontmatter.value.date
          ? new Date(frontmatter.value.date).toLocaleDateString("zh-CN")
          : "";

        // 2. 获取字数和时间：从注入的 page 属性中拿
        // 注意：VitePress 编译后的数据在 page.value 顶层
        const words = (page.value as any).words;
        const readTime = (page.value as any).readTime;

        // 3. 首页不显示
        if (frontmatter.value.layout === "home") return null;

        // 4. 如果字数还是 0，可能是 HMR 没反应过来，返回 null 避免尴尬
        if (!date && (!words || words === 0)) return null;

        return h(
          "div",
          {
            style:
              "margin-bottom: 24px; color: var(--vp-c-text-2); font-size: 14px; display: flex; gap: 18px; opacity: 0.8;",
          },
          [
            date ? h("span", `📅 发布于: ${date}`) : null,
            words ? h("span", `📝 字数: ${words} 字`) : null,
            readTime ? h("span", `⌛ 预计: ${readTime} 分钟`) : null,
          ],
        );
      },
    });
  },
};
