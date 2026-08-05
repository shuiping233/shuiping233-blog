<template>
  <WinScrollViewer class="overview-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="overview-root blog-page-root">
      <h1 class="overview-title">总览</h1>

      <!-- 统计卡片 -->
      <div class="overview-stats">
        <div class="overview-stat">
          <span class="icon overview-stat-icon">&#xE8FD;</span>
          <div>
            <div class="overview-stat-value">{{ posts.length }}</div>
            <div class="overview-stat-label">文章</div>
          </div>
        </div>
        <div class="overview-stat">
          <span class="icon overview-stat-icon">&#xE8B7;</span>
          <div>
            <div class="overview-stat-value">{{ categories.length }}</div>
            <div class="overview-stat-label">分类</div>
          </div>
        </div>
      </div>

      <!-- 分类导航 -->
      <h2 class="overview-section-title">分类导航</h2>
      <div class="overview-cards">
        <button
          v-for="cat in categoryCards"
          :key="cat.id"
          class="overview-card"
          type="button"
          @click="navigateTo(cat.firstSlug)">
          <span class="icon overview-card-icon">{{ cat.icon }}</span>
          <div class="overview-card-body">
            <div class="overview-card-title">{{ cat.name }}</div>
            <div class="overview-card-count">{{ cat.postCount }} 篇文章</div>
          </div>
          <span class="icon overview-card-chevron">&#xE76C;</span>
        </button>
      </div>

      <!-- 最近文章（更新状态） -->
      <h2 class="overview-section-title">最近文章</h2>
      <div class="overview-list">
        <button
          v-for="post in recentPosts"
          :key="post.slug"
          class="overview-list-item"
          type="button"
          @click="$emit('navigate', post.slug)">
          <div class="overview-list-title">{{ post.title }}</div>
          <div class="overview-list-meta">{{ categoryName(post.category) }} · {{ post.date }}</div>
        </button>
      </div>

      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import BlogFooter from '../components/BlogFooter.vue'
import { categories, posts } from '../data/posts'

defineEmits<{ navigate: [slug: string] }>()

const categoryCards = computed(() =>
  categories.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.category === cat.id).length,
    firstSlug: posts.find((p) => p.category === cat.id)?.slug ?? '',
  })),
)

const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? id

// 最近文章：按日期倒序取前 6 篇（容器有最大高度，超出内部滚动）
const recentPosts = computed(() =>
  [...posts]
    .sort((a, b) => (b.date || '').localeCompare(a.date || ''))
    .slice(0, 6),
)

const navigateTo = (slug: string) => {
  if (slug) emit('navigate', slug)
}
</script>

<style scoped>
  .overview-scroll {
    width: 100%;
    height: 100%;
  }

  .overview-root {
    max-width: 880px;
    margin-inline: auto;
    padding: 40px 48px 48px; /* 底部留白：与 footer 的间距 */
  }
  .overview-title {
    margin: 0 0 24px;
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .overview-stats {
    display: flex;
    gap: 12px;
    margin-bottom: 32px;
  }

  .overview-stat {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    min-width: 160px;
    background: var(--card-bg, rgba(255, 255, 255, 0.5));
    border: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.08));
    border-radius: 8px;
  }

  html.theme-dark .overview-stat,
  html.dark .overview-stat {
    --card-bg: rgba(255, 255, 255, 0.04);
    --card-stroke: rgba(255, 255, 255, 0.1);
  }

  .overview-stat-icon {
    font-size: 24px;
    color: var(--accent-base, #0067c0);
  }

  .overview-stat-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .overview-stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .overview-section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 0 0 12px;
  }

  .overview-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-bottom: 32px;
  }

  .overview-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    text-align: left;
    background: var(--card-bg, rgba(255, 255, 255, 0.5));
    border: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.08));
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  html.theme-dark .overview-card,
  html.dark .overview-card {
    --card-bg: rgba(255, 255, 255, 0.04);
    --card-stroke: rgba(255, 255, 255, 0.1);
  }

  .overview-card:hover {
    background: var(--card-bg-hover, rgba(0, 0, 0, 0.05));
    border-color: var(--ctrl-border-accent, #0067c0);
  }

  html.theme-dark .overview-card:hover,
  html.dark .overview-card:hover {
    --card-bg-hover: rgba(255, 255, 255, 0.08);
  }

  .overview-card-icon {
    font-size: 22px;
    color: var(--accent-base, #0067c0);
  }

  .overview-card-body {
    flex: 1;
    min-width: 0;
  }

  .overview-card-title {
    font-size: 14px;
    font-weight: 600;
  }

  .overview-card-count {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .overview-card-chevron {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .overview-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
    /* 最多约 6 项的高度，超出内部滚动，避免撑长页面 */
    max-height: 380px;
    overflow-y: auto;
    padding: 4px;
    margin: -4px;
  }

  .overview-list-item {
    display: flex;
    flex-direction: column;
    gap: 2px;
    padding: 12px 16px;
    text-align: left;
    background: transparent;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s ease;
  }

  .overview-list-item:hover {
    background: var(--subtle-secondary, rgba(0, 0, 0, 0.04));
  }

  .overview-list-title {
    font-size: 14px;
    font-weight: 500;
  }

  .overview-list-meta {
    font-size: 12px;
    color: var(--text-tertiary);
  }
</style>
