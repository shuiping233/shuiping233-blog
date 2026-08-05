<script setup lang="ts">
// 统一封装 MarkdownRender：注入全局自定义组件。

import MarkdownRender, { setCustomComponents } from 'markstream-vue'
import { customMarkdownIt } from '../markdown'
import CustomImageNode from './CustomImageNode.vue'
import CustomCodeBlock from './CustomCodeBlock.vue'
import CustomMediaPlayer from './CustomMediaPlayer.vue'
import CustomDetails from './CustomDetails.vue'

// 全局自定义组件覆盖（对 BlogMarkdown 内所有 MarkdownRender 生效）
setCustomComponents({ image: CustomImageNode })
setCustomComponents({ code_block: CustomCodeBlock })
setCustomComponents({ html_inline: CustomMediaPlayer })
// ::: details → WinExpander 折叠容器（vmr_container 覆盖）
setCustomComponents({ vmr_container: CustomDetails })

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
