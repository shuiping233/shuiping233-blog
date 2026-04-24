import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h, onMounted, watch, nextTick } from "vue";
import { useData, useRoute } from "vitepress";
import Viewer from "viewerjs";
import "./custom.css";

export default {
  extends: DefaultTheme,

  setup() {
    const route = useRoute();
    let viewerInstance: Viewer | null = null;

    const initViewer = () => {
      // 销毁旧实例
      if (viewerInstance) {
        viewerInstance.destroy();
        viewerInstance = null;
      }

      // 获取文章内容容器
      const docEl = document.querySelector(".vp-doc") as HTMLElement;
      if (docEl) {
        viewerInstance = new Viewer(docEl, {
          //   className: "image-viewer",
          inline: false,
          toolbar: {
            // 隐藏默认的底部工具栏（如果你需要旋转等功能，可以把对应设为 true）
            zoomIn: false,
            zoomOut: false,
            oneToOne: false,
            reset: false,
            prev: false,
            play: false,
            next: false,
            rotateLeft: false,
            rotateRight: false,
            flipHorizontal: false,
            flipVertical: false,
          },
          tooltip: false, // 关闭鼠标悬浮时的百分比提示（保持简洁）
          title: false, // 关闭底部图片名称提示
          transition: true, // 启用过渡效果
          fullscreen: true,
          // 滚轮缩放的灵敏度（默认 0.1，数值越大缩放越快）
          zoomRatio: 0.35,
          zoomOnTouch: true, // 触摸设备启用捏合缩放
          movable: true, // 启用移动图片
          initialCoverage: 1, // 初始图片尽可能占满容器
          minWidth: 0, // 设为 0 交由 CSS 的 vw 去接管
          minHeight: 0, // 设为 0 交由 CSS 的 vh 去接管

          // 点击背景是否关闭（保留 medium-zoom 的体验）
          backdrop: true,
        });
      }
    };

    onMounted(initViewer);

    watch(
      () => route.path,
      () => {
        nextTick(initViewer);
      },
    );
  },

  // 保留你原有的 Layout 插槽不变
  Layout() {
    return h(DefaultTheme.Layout, null, {
      "layout-bottom": () =>
        h("div", { class: "custom-footer" }, [
          // 第一行：协议声明
          h("p", { class: "footer-message" }, [
            "本网站内容除非特别声明，采用 ",
            h(
              "a",
              {
                href: "https://creativecommons.org/licenses/by-nc-sa/4.0/",
                target: "_blank",
                rel: "noopener noreferrer",
              },
              "CC BY-NC-SA 4.0",
            ),
            " 协议进行许可",
          ]),
          // 第二行：备案信息容器
          h("div", { class: "beian-wrapper" }, [
            // ICP 备案
            h(
              "a",
              {
                href: "https://beian.miit.gov.cn/",
                target: "_blank",
                class: "beian-link",
              },
              "粤ICP备2026039817号",
            ),

            // 公安备案
            h(
              "a",
              {
                href: "https://beian.mps.gov.cn/#/query/webSearch?code=44060402003189",
                target: "_blank",
                class: "beian-link police-beian",
              },
              [
                h("img", {
                  src: "/beian.png",
                  style: "height: 16px; margin-right: 5px;",
                }),
                "粤公网安备44060402003189号",
              ],
            ),
          ]),
        ]),

      "doc-before": () => {
        const { frontmatter, page } = useData();
        const pageData = page.value as any;

        // 从 frontmatter 读取 createAt/updateAt
        const fm = frontmatter.value || {};
        const createAt = fm.createAt
          ? new Date(fm.createAt).toISOString().split("T")[0]
          : "";
        const updateAt = fm.updateAt
          ? new Date(fm.updateAt).toISOString().split("T")[0]
          : "";
        const words = pageData.words || 0;
        const readTime = pageData.readTime || 0;
        const title = fm.title || "";

        if (fm.layout === "home") return null;
        if (!createAt && !updateAt && words === 0 && !title) return null;

        return h(
          "div",
          { style: "margin-bottom: 24px;" },
          [
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
            h(
              "div",
              {
                style:
                  "color: var(--vp-c-text-2); font-size: 14px; display: flex; flex-wrap: wrap; gap: 18px; opacity: 0.8;",
              },
              [
                createAt ? h("span", null, `📅 发布于: ${createAt}`) : null,
                updateAt && updateAt !== createAt
                  ? h("span", null, `🔄 更新于: ${updateAt}`)
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
