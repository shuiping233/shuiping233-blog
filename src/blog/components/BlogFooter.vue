<script setup lang="ts">
// beian.png 是构建时由 vite 插件复制到 dist/public/ 的静态资源，非模块导入
const beianUrl = `${import.meta.env.BASE_URL}public/beian.png`
</script>

<template>
  <footer class="blog-footer">
    <p class="footer-message">
      本网站内容除非特别声明，采用
      <a
        href="https://creativecommons.org/licenses/by-nc-sa/4.0/"
        target="_blank"
        rel="noopener noreferrer">CC BY-NC-SA 4.0</a>
      协议进行许可
    </p>
    <div class="beian-wrapper">
      <a
        href="https://beian.miit.gov.cn/"
        target="_blank"
        rel="noopener noreferrer"
        class="beian-link">粤ICP备2026039817号</a>
      <a
        href="https://beian.mps.gov.cn/#/query/webSearch?code=44060402003189"
        target="_blank"
        rel="noopener noreferrer"
        class="beian-link police-beian">
        <img :src="beianUrl" alt="公安备案" class="beian-icon" />
        粤公网安备44060402003189号
      </a>
    </div>
  </footer>
</template>

<style scoped>
  .blog-footer {
    padding: 24px 0;
    text-align: center;
    border-top: 1px solid var(--divider-stroke, rgba(0, 0, 0, 0.08));
    color: var(--text-secondary, #6b6b6b);
    font-size: 14px;
  }

  html.theme-dark .blog-footer,
  html.dark .blog-footer {
    border-top-color: rgba(255, 255, 255, 0.1);
  }

  .footer-message {
    margin: 0 0 8px;
  }

  .footer-message a {
    color: var(--accent-base, #0067c0);
    text-decoration: none;
  }

  .beian-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .beian-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    text-decoration: none;
    color: inherit;
    transition: color 0.2s;
  }

  .beian-link:hover {
    color: var(--accent-base, #0067c0);
  }

  .beian-icon {
    height: 16px;
    margin-right: 5px;
  }
</style>
