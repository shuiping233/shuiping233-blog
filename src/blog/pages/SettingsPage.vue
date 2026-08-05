<template>
  <WinScrollViewer class="settings-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="settings-root blog-page-root">
      <h1 class="page-header">设置</h1>

      <WinTextBlock class="settings-section-title" Text="外观" />
      <div class="settings-controls">
        <div class="theme-row">
          <WinTextBlock class="theme-label" Text="主题" />
          <WinRadioButtons
            :SelectedIndex="0"
            MaxColumns="1">
            <WinRadioButton Content="深色" />
          </WinRadioButtons>
        </div>
      </div>
      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'
import WinRadioButtons from 'winui/components/WinRadioButtons.vue'
import WinRadioButton from 'winui/components/WinRadioButton.vue'
import BlogFooter from '../components/BlogFooter.vue'
</script>

<style scoped>
  .settings-scroll {
    width: 100%;
    height: 100%;
  }

  .settings-root {
    max-width: 880px;
    margin-inline: auto; /* 右侧区域整体居中（Windows 设置页风格） */
    padding: 40px 48px 0;
  }

  .settings-root .page-header {
    margin-bottom: 24px;
  }

  .settings-section-title {
    font-size: 16px;
    font-weight: 600;
    color: var(--text-primary);
    margin: 16px 0 12px;
  }

  .settings-controls {
    display: flex;
    flex-direction: column;
    gap: 8px;
    /* 与 footer 的间距 */
    padding-bottom: 48px;
  }

  .theme-row {
    display: flex;
    align-items: center;
    gap: 16px;
    padding: 14px 16px;
    border: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.08));
    border-radius: 8px;
    background: var(--card-bg, rgba(255, 255, 255, 0.5));
  }

  html.theme-dark .theme-row,
  html.dark .theme-row {
    --card-bg: rgba(255, 255, 255, 0.04);
    --card-stroke: rgba(255, 255, 255, 0.1);
  }

  .theme-label {
    font-size: 14px;
    font-weight: 600;
    color: var(--text-primary);
  }
</style>
