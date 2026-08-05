<template>
  <WinScrollViewer class="article-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <article class="article-root">
      <div class="article-meta">
        <span class="article-category">{{ categoryName }}</span>
        <span v-if="post.date" class="article-date">{{ post.date }}</span>
      </div>
      <h1 class="page-header">{{ post.title }}</h1>
      <MarkdownRender
        class="blog-markdown-body markdown-body"
        custom-id="blog"
        :content="content"
        :custom-markdown-it="customMarkdownIt" />
      <BlogFooter />
    </article>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import MarkdownRender from 'markstream-vue'
import type { BlogPost } from '../data/posts'
import { categories, getPostContent } from '../data/posts'
import { customMarkdownIt } from '../markdown'
import BlogFooter from '../components/BlogFooter.vue'

const props = defineProps<{
  post: BlogPost
}>()

const categoryName = computed(
  () => categories.find((c) => c.id === props.post.category)?.name ?? props.post.category,
)

const content = computed(() => getPostContent(props.post.slug))
</script>

<style scoped>
  .article-scroll {
    width: 100%;
    height: 100%;
  }

  .article-root {
    max-width: 880px;
    padding: 40px 48px 64px;
  }

  .article-meta {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 8px;
  }

  .article-category {
    display: inline-flex;
    align-items: center;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    color: var(--accent-aa-text);
    background: var(--accent-aa-fill);
    border-radius: 10px;
  }

  .article-date {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .article-root .page-header {
    margin-bottom: 24px;
  }
</style>
