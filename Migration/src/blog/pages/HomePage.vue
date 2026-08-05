<template>
  <WinScrollViewer class="home-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="home-root">
      <div class="home-hero">
        <h1 class="page-header">WinUI 博客</h1>
        <WinTextBlock
          class="home-subtitle"
          Text="一个完全使用 WinUI 3 风格控件构建的博客示例。文章以 Markdown 编写,点击左侧分类即可阅读,顶部搜索框可以快速查找文章。"
          TextWrapping="WrapWholeWords" />
      </div>

      <div class="home-stats">
        <div class="home-stat">
          <span class="icon home-stat-icon">&#xE8FD;</span>
          <div>
            <div class="home-stat-value">{{ posts.length }}</div>
            <div class="home-stat-label">文章</div>
          </div>
        </div>
        <div class="home-stat">
          <span class="icon home-stat-icon">&#xE8B7;</span>
          <div>
            <div class="home-stat-value">{{ categories.length }}</div>
            <div class="home-stat-label">分类</div>
          </div>
        </div>
      </div>

      <div class="home-section-title">分类导航</div>
      <div class="home-cards">
        <button
          v-for="cat in categoryCards"
          :key="cat.id"
          class="home-card"
          type="button"
          @click="$emit('navigate', cat.firstSlug)">
          <span class="icon home-card-icon">{{ cat.icon }}</span>
          <div class="home-card-body">
            <div class="home-card-title">{{ cat.name }}</div>
            <div class="home-card-count">{{ cat.postCount }} 篇文章</div>
          </div>
          <span class="icon home-card-chevron">&#xE76C;</span>
        </button>
      </div>

      <div class="home-section-title">最近文章</div>
      <div class="home-list">
        <button
          v-for="post in posts"
          :key="post.slug"
          class="home-list-item"
          type="button"
          @click="$emit('navigate', post.slug)">
          <div class="home-list-title">{{ post.title }}</div>
          <div class="home-list-meta">{{ categoryName(post.category) }} · {{ post.date }}</div>
        </button>
      </div>
    </div>
  </WinScrollViewer>
</template>

<script setup>
import { computed } from 'vue';
import WinScrollViewer from '../../components/WinScrollViewer.vue';
import WinTextBlock from '../../components/WinTextBlock.vue';
import { categories, posts } from '../data/posts';

defineEmits(['navigate']);

const categoryCards = computed(() =>
  categories.map((cat) => ({
    ...cat,
    postCount: posts.filter((p) => p.category === cat.id).length,
    firstSlug: posts.find((p) => p.category === cat.id)?.slug ?? ''
  }))
);

const categoryName = (id) => categories.find((c) => c.id === id)?.name ?? id;
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

  .home-hero .page-header {
    margin-bottom: 8px;
  }

  .home-subtitle {
    color: var(--text-secondary);
    font-size: 14px;
    line-height: 1.6;
    max-width: 640px;
  }

  .home-stats {
    display: flex;
    gap: 12px;
    margin: 28px 0 40px;
  }

  .home-stat {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 20px;
    min-width: 160px;
    background: var(--card-bg);
    border: 1px solid var(--card-stroke);
    border-radius: 8px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
  }

  .home-stat-icon {
    font-size: 24px;
    color: var(--accent-base);
  }

  .home-stat-value {
    font-size: 20px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .home-stat-label {
    font-size: 12px;
    color: var(--text-secondary);
  }

  .home-section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 12px;
  }

  .home-cards {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 12px;
    margin-bottom: 40px;
  }

  .home-card {
    display: flex;
    align-items: center;
    gap: 14px;
    padding: 16px 18px;
    text-align: left;
    background: var(--card-bg);
    border: 1px solid var(--card-stroke);
    border-radius: 8px;
    cursor: pointer;
    color: var(--text-primary);
    transition: background 0.15s var(--fast-out-slow-in), border-color 0.15s var(--fast-out-slow-in);
  }

  .home-card:hover {
    background: var(--card-bg-secondary);
    border-color: var(--ctrl-border-accent);
  }

  .home-card:active {
    background: var(--subtle-pressed);
  }

  .home-card-icon {
    font-size: 22px;
    color: var(--accent-base);
  }

  .home-card-body {
    flex: 1;
    min-width: 0;
  }

  .home-card-title {
    font-size: 14px;
    font-weight: 600;
  }

  .home-card-count {
    font-size: 12px;
    color: var(--text-secondary);
    margin-top: 2px;
  }

  .home-card-chevron {
    font-size: 12px;
    color: var(--text-tertiary);
  }

  .home-list {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .home-list-item {
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
    transition: background 0.15s var(--fast-out-slow-in);
  }

  .home-list-item:hover {
    background: var(--subtle-secondary);
  }

  .home-list-item:active {
    background: var(--subtle-pressed);
  }

  .home-list-title {
    font-size: 14px;
    font-weight: 500;
  }

  .home-list-meta {
    font-size: 12px;
    color: var(--text-tertiary);
  }
</style>
