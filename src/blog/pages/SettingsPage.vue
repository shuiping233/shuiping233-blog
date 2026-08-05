<template>
  <WinScrollViewer class="settings-scroll blog-page-scroll" VerticalScrollBarVisibility="Auto" VerticalScrollMode="Auto">
    <div class="settings-root blog-page-root">
      <h1 class="page-header">设置</h1>

      <WinTextBlock class="settings-section-title" Text="外观" />
      <div class="settings-controls">
        <WinExpander
          Height="70"
          Header="主题"
          Description="选择应用颜色模式"
          HeaderIcon="&#xE790;">
          <WinRadioButtons
            :SelectedIndex="themeIndex"
            MaxColumns="3"
            @SelectionChanged="onThemeSelectionChanged">
            <WinRadioButton Content="跟随系统" />
            <WinRadioButton Content="浅色" />
            <WinRadioButton Content="深色" />
          </WinRadioButtons>
        </WinExpander>
      </div>
      <BlogFooter />
    </div>
  </WinScrollViewer>
</template>

<script setup lang="ts">
import { computed, inject, type Ref } from 'vue'
import WinScrollViewer from 'winui/components/WinScrollViewer.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'
import WinExpander from 'winui/components/WinExpander.vue'
import WinRadioButtons from 'winui/components/WinRadioButtons.vue'
import WinRadioButton from 'winui/components/WinRadioButton.vue'
import BlogFooter from '../components/BlogFooter.vue'

type ThemeMode = 'system' | 'light' | 'dark'

const themeSetting = inject<Ref<ThemeMode>>('themeSetting')

const themeOptions: ThemeMode[] = ['system', 'light', 'dark']

const themeIndex = computed(() => {
  const current = themeSetting?.value ?? 'system'
  return Math.max(0, themeOptions.indexOf(current))
})

const onThemeSelectionChanged = ({ SelectedIndex }: { SelectedIndex: number }) => {
  if (!themeSetting) return
  themeSetting.value = themeOptions[SelectedIndex] ?? 'system'
}
</script>

<style scoped>
  .settings-scroll {
    width: 100%;
    height: 100%;
  }

  .settings-root {
    /* 不设最大宽度，充分利用屏幕空间 */
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
