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
            Padding="0,4">
            <svg class="social-icon" viewBox="0 0 16 16" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27s1.36.09 2 .27c1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.01 8.01 0 0 0 16 8c0-4.42-3.58-8-8-8Z" />
            </svg>
            <span class="social-label">GitHub</span>
          </WinHyperlinkButton>
          <WinHyperlinkButton
            NavigateUri="https://space.bilibili.com/37212498"
            Padding="0,4">
            <svg class="social-icon" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
              <path fill="currentColor" d="M7.5 1.5 9.75 4.5h4.5L16.5 1.5l1.5 1.2-1.5 3h1.65A4.35 4.35 0 0 1 22.5 10.05v7.8a3.9 3.9 0 0 1-3.9 3.9H5.4a3.9 3.9 0 0 1-3.9-3.9v-7.8a4.35 4.35 0 0 1 4.35-4.35h1.65l-1.5-3 1.5-1.2ZM5.4 8.25A2.25 2.25 0 0 0 3.15 10.5v7.35a2.25 2.25 0 0 0 2.25 2.25h13.2a2.25 2.25 0 0 0 2.25-2.25V10.5a2.25 2.25 0 0 0-2.25-2.25H5.4Zm3.6 3 3 3-3 3-1.5-1.5 1.5-1.5-1.5-1.5 1.5-1.5Zm6 0 1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5-3-3 3-3Z" />
            </svg>
            <span class="social-label">Bilibili</span>
          </WinHyperlinkButton>
        </div>
      </div>

      <!-- 项目列表 -->
      <h2 class="home-section-title">我编写/参与过的项目</h2>
      <hr class="home-divider" />
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
    margin-inline: auto; /* 右侧区域整体居中（Windows 设置页风格） */
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
    gap: 8px;
  }

  .home-social :deep(.win-hyperlink-button),
  .home-social :deep(.win-button) {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    /* 干掉左 padding，与上方文本左对齐 */
    padding-left: 0 !important;
  }

  .social-icon {
    flex-shrink: 0;
    color: var(--text-secondary);
    transition: color 0.15s ease;
  }

  .home-social :deep(a:hover) .social-icon,
  .home-social :deep(button:hover) .social-icon {
    color: var(--accent-base, #0067c0);
  }

  .social-label {
    font-size: 14px;
  }

  .home-section-title {
    font-size: 18px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 24px 0 0;
  }

  .home-divider {
    border: none;
    border-top: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.08));
    margin: 16px 0;
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
