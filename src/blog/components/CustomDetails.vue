<script setup lang="ts">
// 自定义折叠容器：markstream vmr_container（::: details）→ WinExpander。
// 从 node.raw 提取容器内 markdown（剥掉开头的 ::: details 标记行），
// 用嵌套 BlogMarkdown 渲染，保留完整 markdown 能力。

import { computed } from 'vue'
import WinExpander from 'winui/components/WinExpander.vue'
import BlogMarkdown from './BlogMarkdown.vue'

interface VmrContainerNodeData {
  type: 'vmr_container'
  name: string
  attrs?: Record<string, string>
  children: unknown[]
  raw?: string
}

const props = defineProps<{
  node: VmrContainerNodeData
}>()

// 标题：::: details 后的参数（attrs.args），如「点击展开」；未写标题默认「详情」
const title = computed(() => props.node.attrs?.args ?? props.node.attrs?.title ?? '详情')

// 图标：Segoe Fluent 的「文档/展开」语义图标
const headerIcon = '\uE8A5'

// 容器内容：raw 剥掉首尾的 ::: details 标记行
const innerMarkdown = computed(() => {
  const raw = props.node.raw ?? ''
  const lines = raw.split('\n')
  let start = 0
  while (start < lines.length && /^:::\s*details/i.test(lines[start])) start++
  let end = lines.length
  while (end > start && /^:::\s*$/.test(lines[end - 1])) end--
  return lines.slice(start, end).join('\n')
})
</script>

<template>
  <WinExpander
    class="blog-details"
    :Header="title"
    :HeaderIcon="headerIcon"
    :IsExpanded="false">
    <div class="blog-details-content">
      <BlogMarkdown v-if="innerMarkdown" :content="innerMarkdown" />
    </div>
  </WinExpander>
</template>

<style scoped>
  .blog-details {
    margin: var(--ms-flow-codeblock-y, 16px) 0;
    border-radius: 8px;
    border: 1px solid var(--card-stroke, rgba(0, 0, 0, 0.12));
    overflow: hidden;
  }

  html.theme-dark .blog-details,
  html.dark .blog-details {
    --card-stroke: rgba(255, 255, 255, 0.12);
  }

  .blog-details :deep(.win-expander-header) {
    padding: 10px 16px;
  }

  .blog-details-content {
    padding: 8px 16px 16px;
  }
</style>
