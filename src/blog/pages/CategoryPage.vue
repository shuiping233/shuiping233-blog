<template>
  <WinScrollViewer class="category-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="category-root blog-page-root">
      <h1 class="category-title">
        <span class="icon category-icon">{{ category?.icon }}</span>
        {{ category?.name ?? '未知分类' }}
      </h1>
      <div class="category-count">{{ categoryPosts.length }} 篇文章</div>

      <div class="category-list">
        <button
          v-for="post in categoryPosts"
          :key="post.slug"
          class="category-list-item"
          type="button"
          @click="$emit('navigate', post.slug)">
          <div class="category-list-title">{{ post.title }}</div>
          <div class="category-list-meta">{{ post.date }}</div>
        </button>
        <div v-if="categoryPosts.length === 0" class="category-empty">该分类下暂无文章</div>
      </div>

      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import BlogFooter from '../components/BlogFooter.vue'
import { categories, posts, type BlogCategory } from '../data/posts'

defineEmits<{ navigate: [slug: string] }>()

const props = defineProps<{
  categoryId: string
}>()

const category = computed<BlogCategory | undefined>(
  () => categories.find((c) => c.id === props.categoryId),
)

// 该分类的文章（按日期倒序）
const categoryPosts = computed(() =>
  posts
    .filter((p) => p.category === props.categoryId)
    .sort((a, b) => (b.date || '').localeCompare(a.date || '')),
)
</script>

<style scoped>
  .category-scroll {
    width: 100%;
    height: 100%;
  }

  .category-root {
    max-width: 880px;
    margin-inline: auto;
    padding: 40px 48px 48px;
  }

  .category-title {
    display: flex;
    align-items: center;
    gap: 10px;
    margin: 0 0 8px;
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .category-icon {
    font-size: 26px;
    color: var(--accent-base, #0067c0);
  }

  .category-count {
    font-size: 13px;
    color: var(--text-secondary);
    margin-bottom: 20px;
  }

  .category-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .category-list-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 12px 16px;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s ease;
  }

  .category-list-item:hover {
    background: var(--subtle-secondary, rgba(0, 0, 0, 0.04));
  }

  .category-list-title {
    font-size: 14px;
    font-weight: 500;
  }

  .category-list-meta {
    font-size: 12px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  .category-empty {
    padding: 24px;
    text-align: center;
    color: var(--text-tertiary);
    font-style: italic;
  }
</style>
