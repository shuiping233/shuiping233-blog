/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default component
}

declare module 'markstream-vue' {
  import type { DefineComponent } from 'vue'
  const MarkdownRender: DefineComponent<Record<string, unknown>, Record<string, unknown>, unknown>
  export default MarkdownRender
}
