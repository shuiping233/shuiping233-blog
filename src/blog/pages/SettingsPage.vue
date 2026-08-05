<template>
  <WinScrollViewer class="settings-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="settings-root blog-page-root">
      <h1 class="page-header">设置</h1>

      <WinTextBlock class="settings-section-title" Text="外观" />
      <div class="settings-controls">
        <WinSettingsCard
          Header="主题"
          Description="选择应用颜色模式"
          HeaderIcon="&#xE790;">
          <WinRadioButtons
            :SelectedIndex="0"
            MaxColumns="1">
            <WinRadioButton Content="深色" />
          </WinRadioButtons>
        </WinSettingsCard>
      </div>
      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'
import WinSettingsCard from 'winui/components/WinSettingsCard.vue'
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
</style>
