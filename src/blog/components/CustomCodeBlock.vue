<script setup lang="ts">
// 自定义代码块：替代 markstream 默认的 monaco 渲染。
// - 深色背景 + 行号列（独立 span 撑开，不与代码重叠）
// - 右上角 WinUI 风格复制按钮（照抄 gallery WinControlExample）
// - 基础语法着色（轻量关键词高亮，不引入 shiki/monaco 重型依赖）

import { computed } from 'vue'
import WinButton from 'winui/components/WinButton.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'

interface CodeBlockNodeData {
  type: 'code_block'
  language: string
  code: string
  startLine?: number
  endLine?: number
  raw: string
}

const props = defineProps<{
  node: CodeBlockNodeData
}>()

const language = computed(() => props.node.language || 'text')
const lines = computed(() => props.node.code.replace(/\n$/, '').split('\n'))

// 复制到剪贴板（参考 gallery WinControlExample 的 copyActiveCode）
const copyActiveCode = async () => {
  try {
    await navigator.clipboard?.writeText(props.node.code)
  } catch {
    // 剪贴板不可用时降级：选中文本
    const ta = document.createElement('textarea')
    ta.value = props.node.code
    document.body.appendChild(ta)
    ta.select()
    document.execCommand('copy')
    document.body.removeChild(ta)
  }
}

// ---- 轻量语法着色：关键字/字符串/注释/数字 ----
const keywordRe = /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|class|new|async|await|interface|type|extends|implements|public|private|protected|static|readonly|switch|case|break|continue|try|catch|finally|throw|using|package|include|namespace|def|self|print|true|false|null|undefined|void|bool|int|string|float|double|char|long|short|struct|enum|template|typename|using|this|super|yield|with|do|in|of|as|is|typeof|instanceof|delete|void|symbol|bigint|record|keyof|infer)\b/
const numberRe = /\b\d[\d_]*(\.\d+)?\b/
const stringRe = /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/
const commentRe = /(\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*)/

// 单行着色：按 注释→字符串→关键字→数字 顺序替换，避免重复匹配
function highlightLine(line: string): string {
  // 简单实现：先处理字符串与注释（整体包裹），再对剩余部分做关键字/数字着色。
  // 不做完整 tokenizer，够用于博客代码块展示。
  const escaped = line
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')

  let result = escaped
  // 字符串
  result = result.replace(stringRe, (m) => `<span class="tok-str">${m}</span>`)
  // 注释（# 前缀的行内注释，仅当行首或前置空格）
  result = result.replace(commentRe, (m) => `<span class="tok-com">${m}</span>`)
  // 关键字
  result = result.replace(keywordRe, (m) => `<span class="tok-kw">${m}</span>`)
  // 数字
  result = result.replace(numberRe, (m) => `<span class="tok-num">${m}</span>`)
  return result
}

const highlighted = computed(() => lines.value.map(highlightLine))
</script>

<template>
  <div class="custom-code-block">
    <div class="code-header">
      <span class="code-lang">{{ language }}</span>
      <WinButton
        class="copy-code-button"
        v-bind="{ 'tooltipservice.tooltip': '复制' }"
        @Click="copyActiveCode">
        <WinTextBlock class="icon" Text="&#xE8C8;" />
      </WinButton>
    </div>
    <div class="code-body">
      <div class="code-gutter" aria-hidden="true">
        <div v-for="(_, i) in lines" :key="i" class="code-gutter-line">{{ i + 1 }}</div>
      </div>
      <pre class="code-pre"><code
        v-for="(_, i) in lines"
        :key="i"
        class="code-line"
        v-html="highlighted[i]" /></pre>
    </div>
  </div>
</template>

<style scoped>
  .custom-code-block {
    margin: var(--ms-flow-codeblock-y, 16px) 0;
    border-radius: 8px;
    overflow: hidden;
    border: 1px solid var(--code-border, rgba(0, 0, 0, 0.12));
    background: var(--code-bg, rgba(0, 0, 0, 0.06));
    color: var(--code-fg, var(--text-primary, #1b1b1b));
  }

  html.theme-dark .custom-code-block {
    --code-bg: #1e1e1e;
    --code-border: rgba(255, 255, 255, 0.12);
    --code-fg: #d4d4d4;
    --tok-kw: #569cd6;
    --tok-str: #ce9178;
    --tok-com: #6a9955;
    --tok-num: #b5cea8;
  }

  html:not(.theme-dark) .custom-code-block {
    --tok-kw: #0000ff;
    --tok-str: #a31515;
    --tok-com: #008000;
    --tok-num: #098658;
  }

  .code-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 4px 8px 4px 14px;
    border-bottom: 1px solid var(--code-border, rgba(0, 0, 0, 0.08));
    background: var(--code-header-bg, rgba(0, 0, 0, 0.04));
    font-size: 12px;
    color: var(--code-action-fg, var(--text-secondary, #6b6b6b));
  }

  html.theme-dark .code-header {
    --code-header-bg: #252526;
  }

  .code-lang {
    font-family: var(--markstream-code-font-family, 'Cascadia Code', 'Consolas', monospace);
    text-transform: lowercase;
    opacity: 0.85;
  }

  .copy-code-button {
    min-width: 0;
    padding: 4px 6px;
    height: auto;
  }

  .copy-code-button .icon {
    font-size: 14px;
  }

  .code-body {
    display: flex;
    overflow: auto;
  }

  .code-gutter {
    flex: 0 0 auto;
    padding: 12px 0;
    min-width: 40px;
    text-align: right;
    padding-right: 12px;
    user-select: none;
    border-right: 1px solid var(--code-border, rgba(0, 0, 0, 0.08));
    color: var(--code-line-number, #858585);
    font-family: var(--markstream-code-font-family, 'Cascadia Code', 'Consolas', monospace);
    font-size: 13px;
    line-height: 1.6;
  }

  .code-gutter-line {
    white-space: pre;
  }

  .code-pre {
    flex: 1 1 auto;
    margin: 0;
    padding: 12px 16px;
    overflow: visible;
    font-family: var(--markstream-code-font-family, 'Cascadia Code', 'Consolas', monospace);
    font-size: 13px;
    line-height: 1.6;
    background: transparent;
  }

  .code-line {
    display: block;
    white-space: pre;
  }

  :deep(.tok-kw) { color: var(--tok-kw); font-weight: 600; }
  :deep(.tok-str) { color: var(--tok-str); }
  :deep(.tok-com) { color: var(--tok-com); font-style: italic; }
  :deep(.tok-num) { color: var(--tok-num); }
</style>
