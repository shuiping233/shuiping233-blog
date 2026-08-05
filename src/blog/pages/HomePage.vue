<template>
  <WinScrollViewer class="home-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="home-root blog-page-root">
      <!-- 欢迎区 -->
      <div class="home-hero">
        <h1 class="home-title">shuiping233 的博客</h1>
        <WinTextBlock
          class="home-subtitle"
          Text="欢迎来到我的博客，记录技术点滴与生活随笔。"
          TextWrapping="WrapWholeWords" />
        <div class="home-social">
          <WinHyperlinkButton
            NavigateUri="https://github.com/shuiping233"
            Content="GitHub" />
          <WinHyperlinkButton
            NavigateUri="https://space.bilibili.com/37212498"
            Content="Bilibili" />
        </div>
      </div>

      <!-- 项目列表 -->
      <WinTextBlock class="home-section-title" Text="我编写/参与过的项目" />
      <div class="project-grid">
        <a
          v-for="p in projects"
          :key="p.name"
          class="project-card"
          :href="p.url"
          target="_blank"
          rel="noopener noreferrer">
          <span v-if="p.icon" class="project-icon icon">{{ p.icon }}</span>
          <div class="project-body">
            <div class="project-name">{{ p.name }}</div>
            <div class="project-desc">{{ p.description }}</div>
          </div>
          <span class="project-chevron icon">&#xE76C;</span>
        </a>
      </div>

      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'
import WinHyperlinkButton from 'winui/components/WinHyperlinkButton.vue'
import BlogFooter from '../components/BlogFooter.vue'
import { projects } from '../data/projects'
</script>

<style scoped>
  .home-scroll {
    width: 100%;
    height: 100%;
  }

  .home-root {
    max-width: 880px;
    padding: 40px 48px 0;
  }

  .home-hero {
    padding: 16px 0 32px;
  }

  .home-title {
    margin: 0 0 12px;
    font-size: 32px;
    font-weight: 600;
    color: var(--text-primary);
  }

  .home-subtitle {
    font-size: 15px;
    color: var(--text-secondary);
    margin-bottom: 16px;
  }

  .home-social {
    display: flex;
    gap: 12px;
  }

  .home-section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 24px 0 16px;
  }

  .project-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
    gap: 12px;
    padding-bottom: 48px;
  }

  .project-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 14px 16px;
    border-radius: 8px;
    border: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.08));
    background: var(--card-bg, rgba(255, 255, 255, 0.5));
    text-decoration: none;
    color: var(--text-primary);
    transition: background 0.15s ease, border-color 0.15s ease;
  }

  html.theme-dark .project-card,
  html.dark .project-card {
    --card-bg: rgba(255, 255, 255, 0.04);
    --card-stroke: rgba(255, 255, 255, 0.1);
  }

  .project-card:hover {
    background: var(--card-bg-hover, rgba(0, 0, 0, 0.05));
    border-color: var(--accent-base, #0067c0);
  }

  html.theme-dark .project-card:hover,
  html.dark .project-card:hover {
    --card-bg-hover: rgba(255, 255, 255, 0.08);
  }

  .project-icon {
    font-size: 22px;
    color: var(--accent-base, #0067c0);
    flex-shrink: 0;
  }

  .project-body {
    flex: 1 1 auto;
    min-width: 0;
  }

  .project-name {
    font-size: 15px;
    font-weight: 600;
  }

  .project-desc {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 2px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  .project-chevron {
    font-size: 14px;
    color: var(--text-tertiary);
    flex-shrink: 0;
  }

  @media (max-width: 760px) {
    .project-grid {
      grid-template-columns: 1fr;
    }
  }
</style>
