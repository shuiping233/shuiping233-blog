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

// ---- 轻量语法着色：单次扫描 tokenizer ----
// 绝不对已生成的 HTML 再跑正则（会互相污染，见 tok-str 错乱 bug）。
// 按 注释→字符串→数字→关键字 顺序，一次扫描用 indexOf 定位最近 token。
const TOKEN_RULES: { type: string; re: RegExp }[] = [
  { type: 'com', re: /\/\/[^\n]*|\/\*[\s\S]*?\*\/|#[^\n]*|--[^\n]*/ },
  { type: 'str', re: /"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`/ },
  { type: 'num', re: /\b\d[\d_]*(\.\d+)?\b/ },
  { type: 'kw', re: /\b(import|from|export|default|const|let|var|function|return|if|else|for|while|class|new|async|await|interface|type|extends|implements|public|private|protected|static|readonly|switch|case|break|continue|try|catch|finally|throw|using|package|include|namespace|def|self|print|true|false|null|undefined|void|bool|int|string|float|double|char|long|short|struct|enum|template|typename|this|super|yield|with|do|in|of|as|is|typeof|instanceof|delete|symbol|bigint|record|keyof|infer|echo|let)\b/ },
]

const escapeHtml = (s: string): string =>
  s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

function highlightLine(line: string): string {
  let pos = 0
  let out = ''
  while (pos < line.length) {
    // 找当前剩余文本里位置最早的 token
    let best: { index: number; len: number; type: string } | null = null
    for (const rule of TOKEN_RULES) {
      rule.re.lastIndex = 0
      const m = rule.re.exec(line.slice(pos))
      if (m && m.index >= 0) {
        if (!best || m.index < best.index) {
          best = { index: m.index, len: m[0].length, type: rule.type }
        }
      }
    }
    if (!best) {
      out += escapeHtml(line.slice(pos))
      break
    }
    // 前置普通文本
    if (best.index > 0) out += escapeHtml(line.slice(pos, pos + best.index))
    // token 本体
    const token = line.slice(pos + best.index, pos + best.index + best.len)
    out += `<span class="tok-${best.type}">${escapeHtml(token)}</span>`
    pos += best.index + best.len
  }
  return out
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
    --code-fg: #f0f6fc;
    /* GitHub dark (prettylights) 配色：pl-k / pl-sra / pl-c / pl-c1 */
    --tok-kw: #ff7b72;
    --tok-str: #a5d6ff;
    --tok-com: #9198a1;
    --tok-num: #79c0ff;
  }

  html:not(.theme-dark) .custom-code-block {
    /* GitHub light (prettylights) 配色 */
    --tok-kw: #cf222e;
    --tok-str: #0a3069;
    --tok-com: #59636e;
    --tok-num: #0550ae;
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
