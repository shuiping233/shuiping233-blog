<script setup lang="ts">
// 统一封装 MarkdownRender。
// 自定义组件覆盖在此模块顶层注册（与 MarkdownRender 同模块实例、同步先执行）：
// markstream 的注册表在渲染器初始化时快照，若在别的入口模块（main.ts）注册，
// 可能因 ESM 模块求值顺序导致渲染器已初始化而注册不生效。
// 注意：setCustomComponents 单参数全局形式是【覆盖】不是【合并】，必须一次传全部键。

import MarkdownRender, { setCustomComponents } from 'markstream-vue'
import { customMarkdownIt } from '../markdown'
import CustomImageNode from './CustomImageNode.vue'
import CustomCodeBlock from './CustomCodeBlock.vue'
import CustomMediaPlayer from './CustomMediaPlayer.vue'
import CustomContainerRouter from './CustomContainerRouter.vue'

// 模块顶层注册（与渲染同模块实例）。setCustomComponents 是【覆盖】非【合并】，
// 必须一次传全部键；且每次 MarkdownRender 挂载前重新注册，确保注册表最新。
const registerCustomComponents = () => {
  setCustomComponents({
    image: CustomImageNode,
    code_block: CustomCodeBlock,
    html_inline: CustomMediaPlayer,
    vmr_container: CustomContainerRouter,
  })
}
registerCustomComponents()

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
    :custom-markdown-it="customMarkdownIt"
    :viewport-priority="false" />
</template>
