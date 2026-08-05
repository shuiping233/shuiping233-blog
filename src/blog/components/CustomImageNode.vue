<script setup lang="ts">
import { ImageNode } from 'markstream-vue'
import Viewer from 'viewerjs'

const emit = defineEmits(['load', 'error', 'click'])

let viewer: Viewer | null = null

function destroyViewer() {
  if (viewer) {
    try {
      viewer.destroy()
    } catch {
      // viewer 已销毁时忽略
    }
    viewer = null
  }
}

function onImageClick(payload: [Event, string]) {
  const [event, src] = payload
  event.preventDefault()
  destroyViewer()

  // 用点击的图片元素初始化 viewerjs（复用旧 vitepress 主题的配置）
  const target = event.currentTarget as HTMLImageElement
  viewer = new Viewer(target, {
    inline: false,
    toolbar: {
      zoomIn: false,
      zoomOut: false,
      oneToOne: false,
      reset: false,
      prev: false,
      play: false,
      next: false,
      rotateLeft: false,
      rotateRight: false,
      flipHorizontal: false,
      flipVertical: false,
    },
    tooltip: false,
    title: false,
    transition: true,
    fullscreen: true,
    zoomRatio: 0.35,
    zoomOnTouch: true,
    movable: true,
    initialCoverage: 1,
    minWidth: 0,
    minHeight: 0,
    backdrop: true,
  })
  viewer.show()
  void src
}
</script>

<template>
  <ImageNode
    v-bind="$attrs"
    @load="emit('load', $event)"
    @error="emit('error', $event)"
    @click="onImageClick" />
</template>
