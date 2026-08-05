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

// 标题：::: details 后的参数（attrs.args），如「点击展开」
const title = computed(() => props.node.attrs?.args ?? props.node.attrs?.title ?? '')

// 容器内容：raw 剥掉第一行（::: details 标记）后的原始 markdown
const innerMarkdown = computed(() => {
  const raw = props.node.raw ?? ''
  const lines = raw.split('\n')
  let idx = 0
  while (idx < lines.length && /^:::\s*details/i.test(lines[idx])) idx++
  return lines.slice(idx).join('\n')
})
</script>

<template>
  <WinExpander
    class="blog-details"
    :Header="title"
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

  html.theme-dark .blog-details {
    --card-stroke: rgba(255, 255, 255, 0.12);
  }

  .blog-details :deep(.win-expander-header) {
    padding: 10px 16px;
  }

  .blog-details-content {
    padding: 8px 16px 16px;
  }
</style>
