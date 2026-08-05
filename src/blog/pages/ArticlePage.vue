<template>
  <WinScrollViewer class="article-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <article class="article-root blog-page-root">
      <div class="article-meta">
        <span class="article-category">{{ categoryName }}</span>
        <span v-if="post.date" class="article-date">{{ post.date }}</span>
      </div>
      <h1 class="page-header">{{ post.title }}</h1>
      <WinRichTextBlock class="article-rich" IsTextSelectionEnabled>
        <BlogMarkdown :content="content" />
      </WinRichTextBlock>
      <BlogFooter />
    </article>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import WinRichTextBlock from 'winui/components/WinRichTextBlock.vue'
import BlogMarkdown from '../components/BlogMarkdown.vue'
import type { BlogPost } from '../data/posts'
import { categories, getPostContent } from '../data/posts'
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
    /* 不设最大宽度，充分利用屏幕空间 */
    padding: 40px 48px 0;
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

  /* WinRichTextBlock 作为富文本容器：接管 markstream 的样式，
     屏蔽其自带 p/a 默认样式干扰 markstream 渲染；
     与 footer 的间距由 blog.css 的 .blog-markdown-body padding-bottom 统一处理 */
  .article-rich {
    display: block;
    width: 100%;
    min-width: 0;
  }

  .article-rich :deep(p),
  .article-rich :deep(a) {
    margin: 0;
    color: inherit;
  }
</style>
