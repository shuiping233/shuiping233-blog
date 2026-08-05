<script setup lang="ts">
// 自定义链接：包装 markstream 的 LinkNode，把 tooltip 交给 WinUIonWeb 的
// WinToolTipService 接管（tooltipservice.tooltip 属性），替代浏览器原生 title。

import { computed } from 'vue'
import { LinkNode } from 'markstream-vue'

interface LinkNodeData {
  type: 'link'
  href: string
  title: string | null
  text: string
  children: unknown[]
  raw: string
}

const props = defineProps<{
  node: LinkNodeData
}>()

// tooltip 内容：链接 title（markdown 里 [!title](url) 的 title）优先，否则显示 URL
const tooltip = computed(() => props.node.title || props.node.href)

const linkAttrs = computed(() => ({
  'tooltipservice.tooltip': tooltip.value,
}))
</script>

<template>
  <LinkNode
    :node="node"
    v-bind="linkAttrs" />
</template>
