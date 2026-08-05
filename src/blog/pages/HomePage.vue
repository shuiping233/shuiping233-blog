<template>
  <WinScrollViewer class="home-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="home-root blog-page-root">
      <BlogMarkdown :content="content" />
      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import BlogMarkdown from '../components/BlogMarkdown.vue'
import { homeContent } from '../data/posts'
import BlogFooter from '../components/BlogFooter.vue'

// 首页内容直接渲染 docs/index.md（欢迎语 + 项目列表）
const content = homeContent
</script>

<style scoped>
  .home-scroll {
    width: 100%;
    height: 100%;
  }

  .home-root {
    /* 不设最大宽度，充分利用屏幕空间 */
    padding: 40px 48px 0;
  }
</style>
