import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, onMounted, watch, nextTick } from "vue";
import { useData, useRoute } from "vitepress";
import mediumZoom from "medium-zoom";
import "./custom.css";

export default {
  extends: DefaultTheme,

  // 新增：处理图片放大的 setup 钩子
  setup() {
    const route = useRoute();

    const initZoom = () => {
      // 选择文章区域的图片进行初始化
      mediumZoom(".vp-doc img", {
        background: "rgba(0,0,0,0.7)",
        margin: 24, // 放大后距离屏幕边缘的留白
      });
    };

    // 首次加载时初始化
    onMounted(initZoom);

    // 监听路由变化（VitePress 切换页面时），重新初始化防止失效
    watch(
      () => route.path,
      () => {
        nextTick(() => {
          // 切换页面时，先销毁旧的实例，再重新初始化
          mediumZoom(".vp-doc img").detach();
          initZoom();
        });
      },
    );
  },

  // 保留你原有的自定义布局插槽
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "doc-before": () => {
        const { frontmatter, page } = useData();

        // 1. 获取日期：从 page 中读取（由 transformPageData 注入，避免干扰 sidebar）
        const pageData = page.value as any;
        const date = pageData.date
          ? new Date(pageData.date).toLocaleDateString("zh-CN")
          : "";

        // 获取最后修改时间
        const updateTime = pageData.updateTime;

        // 2. 获取字数和时间：从 page 中读取
        const words = pageData.words || 0;
        const readTime = pageData.readTime || 0;

        // 3. 获取标题：只从 frontmatter 获取（没有就不显示，不读取 # 一级标题避免重复）
        const title = frontmatter.value.title || "";

        // 4. 首页不显示
        if (frontmatter.value.layout === "home") return null;

        // 5. 如果没有任何数据，不显示
        if (!date && !updateTime && words === 0 && !title) return null;

        return h(
          "div",
          {
            style: "margin-bottom: 24px;",
          },
          [
            // 显示标题
            title
              ? h(
                  "h1",
                  {
                    style:
                      "margin-bottom: 16px; font-size: 2rem; font-weight: 600; color: var(--vp-c-text-1); line-height: 40px;",
                  },
                  title,
                )
              : null,
            // 显示元信息
            h(
              "div",
              {
                style:
                  "color: var(--vp-c-text-2); font-size: 14px; display: flex; flex-wrap: wrap; gap: 18px; opacity: 0.8;",
              },
              [
                date ? h("span", null, `📅 发布于: ${date}`) : null,
                updateTime && updateTime !== date
                  ? h("span", null, `🔄 更新于: ${updateTime}`)
                  : null,
                words > 0 ? h("span", null, `📝 字数: ${words} 字`) : null,
                readTime > 0
                  ? h("span", null, `⌛ 预计: ${readTime} 分钟`)
                  : null,
              ].filter(Boolean),
            ),
          ].filter(Boolean),
        );
      },
    });
  },
} satisfies Theme;
