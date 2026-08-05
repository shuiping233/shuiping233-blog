<script setup lang="ts">
// 统一封装 MarkdownRender。
// 自定义组件覆盖（image/code_block/html_inline/vmr_container）在 main.ts 注册——
// markstream 的注册表在渲染器初始化时快照，必须于 app.mount() 前完成。

import MarkdownRender from 'markstream-vue'
import { customMarkdownIt } from '../markdown'

defineProps<{
  content: string
  class?: string
}>()
</script>

<template>
  <MarkdownRender
    class="blog-markdown-body markdown-body"
    custom-id="blog"
    :content="content"
    :custom-markdown-it="customMarkdownIt" />
</template>
