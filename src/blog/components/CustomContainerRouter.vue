<script setup lang="ts">
// vmr_container 路由：按 node.name 分发到具体容器组件。
// - blog-info/tip/warning/danger 等 → CustomAdmonition (WinInfoBar)
// - details → CustomDetails (WinExpander)
// - 其他 → 原样显示内容

import { computed, h } from 'vue'
import CustomAdmonition from './CustomAdmonition.vue'
import CustomDetails from './CustomDetails.vue'

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

const BLOG_ADMONITION_NAMES = [
  'blog-info',
  'blog-tip',
  'blog-note',
  'blog-caution',
  'blog-warning',
  'blog-danger',
  'blog-error',
  'blog-success',
]

const isAdmonition = computed(() => BLOG_ADMONITION_NAMES.includes(props.node.name))
const isDetails = computed(() => props.node.name === 'details')
</script>

<template>
  <CustomAdmonition v-if="isAdmonition" :node="node" />
  <CustomDetails v-else-if="isDetails" :node="node" />
  <div
    v-else
    class="blog-container-raw"
    v-html="node.raw ?? ''" />
</template>
