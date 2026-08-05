<script setup lang="ts">
// 自定义媒体播放器：拦截 markstream 的 <video> 标签（html_inline 节点），
// 用 WinUIonWeb 的 WinMediaPlayerElement 渲染（WinUI 风格传输控件）。

import { computed } from 'vue'
import WinMediaPlayerElement from 'winui/components/WinMediaPlayerElement.vue'

interface HtmlInlineNodeData {
  type: 'html_inline'
  tag?: string
  content: string
  children: unknown[]
}

const props = defineProps<{
  node: HtmlInlineNodeData
}>()

// 从 <video src="..." ...> 解析 src 与属性
const parsed = computed(() => {
  const content = props.node.content ?? ''
  const srcMatch = content.match(/src\s*=\s*["']([^"']+)["']/)
  const src = srcMatch?.[1] ?? ''
  return { src }
})

// 非 video 节点原样显示（理论上不会走到这里，防御性处理）
const isVideo = computed(() => (props.node.tag ?? '').toLowerCase() === 'video')
</script>

<template>
  <WinMediaPlayerElement
    v-if="isVideo && parsed.src"
    :Source="parsed.src"
    MaxWidth="100%"
    AutoPlay="False"
    :AreTransportControlsEnabled="true" />
  <div
    v-else
    class="custom-media-raw"
    v-html="node.content" />
</template>

<style scoped>
  .win-media-player {
    margin: var(--ms-flow-codeblock-y, 16px) 0;
  }

  .custom-media-raw {
    display: none;
  }
</style>
