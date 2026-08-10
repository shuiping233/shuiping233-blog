<script setup lang="ts">
// 自定义 todo checkbox：markdown 的 - [ ] / - [x]（checkbox_input 节点）
// 用 WinCheckBox 外观渲染，IsEnabled=false 禁用交互（pointer-events: none + disabled 配色）。
// 文本（"任务一"等）由 markstream 渲染在 checkbox 节点之后，这里只负责方框外观。
// 参照 CustomAdmonition（vmr_container → WinInfoBar）的用法模式。

import { computed } from 'vue'
import WinCheckBox from 'winui/components/WinCheckBox.vue'

interface CheckboxNodeData {
  type: 'checkbox_input' | 'checkbox'
  checked?: boolean
  raw?: string
}

const props = defineProps<{
  node: CheckboxNodeData
}>()

const checked = computed(() => props.node.checked === true)
</script>

<template>
  <span class="blog-task-checkbox">
    <WinCheckBox :IsChecked="checked" :IsEnabled="true" />
  </span>
</template>

<style scoped>
.blog-task-checkbox {
  display: inline-flex;
  align-items: center;
  vertical-align: middle;
  margin-right: 6px;
  line-height: 0;
}

/* WinCheckBox 默认 min-height:32px / width:fit-content / gap:8px 会撑高列表行，
     行内场景按 20px 盒子压平；disabled 自带 pointer-events:none */
.blog-task-checkbox :deep(.win-checkbox) {
  min-height: 0;
  width: auto;
  gap: 0;
}
</style>
