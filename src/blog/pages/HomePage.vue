<template>
  <WinScrollViewer class="home-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="home-root">
      <MarkdownRender
        class="blog-markdown-body markdown-body"
        custom-id="blog"
        :content="content"
        :custom-markdown-it="customMarkdownIt" />
      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import MarkdownRender from 'markstream-vue'
import { homeContent } from '../data/posts'
import { customMarkdownIt } from '../markdown'
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
    max-width: 880px;
    padding: 40px 48px 64px;
  }
</style>
