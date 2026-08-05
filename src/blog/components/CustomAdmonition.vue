<script setup lang="ts">
// 自定义提示容器：markdown 里的 ::: tip/warning/danger 等（admonition 节点）
// 经 BlogMarkdown 的 postTransformNodes 转换为 vmr_container（name=kind），
// 这里用 WinInfoBar 渲染。
// Severity 映射: info/tip/note → Informational, warning/caution → Warning,
//               danger/error → Error, success → Success

import { ref, computed } from 'vue'
import WinInfoBar from 'winui/components/WinInfoBar.vue'
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

const isOpen = ref(true)

const SEVERITY_MAP: Record<string, string> = {
  'blog-info': 'Informational',
  'blog-tip': 'Informational',
  'blog-note': 'Informational',
  'blog-caution': 'Warning',
  'blog-warning': 'Warning',
  'blog-danger': 'Error',
  'blog-error': 'Error',
  'blog-success': 'Success',
}

const severity = computed(() => SEVERITY_MAP[props.node.name ?? ''] ?? 'Informational')
// vmr_container 的标题在 attrs.args（::: blog-info 标题）
const title = computed(() => props.node.attrs?.title ?? props.node.attrs?.args ?? '')

// children 是 markdown 节点，用 raw 重新解析渲染最可靠
const innerMarkdown = computed(() => {
  const raw = props.node.raw ?? ''
  const lines = raw.split('\n')
  // 剥掉开头的 ::: blog-xxx 标记行（容器名可能含 -）
  let start = 0
  while (start < lines.length && /^:::\s*\S+/.test(lines[start])) start++
  // 剥掉结尾的 ::: 闭合行
  let end = lines.length
  while (end > start && /^:::\s*$/.test(lines[end - 1])) end--
  return lines.slice(start, end).join('\n')
})
</script>

<template>
  <WinInfoBar
    v-model:IsOpen="isOpen"
    :Severity="severity"
    :IsClosable="false"
    :Title="title"
    Message="">
    <div class="blog-admonition-content">
      <BlogMarkdown v-if="innerMarkdown" :content="innerMarkdown" />
    </div>
  </WinInfoBar>
</template>

<style scoped>
  .win-infobar {
    margin: var(--ms-flow-codeblock-y, 16px) 0;
  }

  .blog-admonition-content {
    padding-top: 4px;
  }
</style>
