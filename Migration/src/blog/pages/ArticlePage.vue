<template>
  <WinScrollViewer class="article-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <article class="article-root">
      <div class="article-meta">
        <span class="article-category">{{ categoryName }}</span>
        <span class="article-date">{{ post.date }}</span>
      </div>
      <h1 class="page-header">{{ post.title }}</h1>
      <div class="article-body">
        <!-- 目前直接以只读文本展示 md 原文;后续接入 markdown 渲染器时替换此处 -->
        <WinTextBlock
          class="article-raw"
          :Text="content"
          IsTextSelectionEnabled />
      </div>
    </article>
  </WinScrollViewer>
</template>

<script setup>
import { computed } from 'vue';
import WinScrollViewer from '../../components/WinScrollViewer.vue';
import WinTextBlock from '../../components/WinTextBlock.vue';
import { categories, getPostContent } from '../data/posts';

const props = defineProps({
  post: { type: Object, required: true }
});

const categoryName = computed(() =>
  categories.find((c) => c.id === props.post.category)?.name ?? props.post.category
);

const content = computed(() => getPostContent(props.post.slug));
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

  .article-body {
    padding-bottom: 8px;
  }

  .article-raw {
    display: block;
    white-space: pre-wrap; /* 保留 md 的换行与缩进 */
    overflow-wrap: break-word;
    font-family: 'Cascadia Code', 'Consolas', 'Segoe UI', monospace;
    font-size: 13px;
    line-height: 1.75;
    color: var(--text-primary);
    user-select: text;
  }
</style>
