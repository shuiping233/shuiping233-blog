// markstream-vue 的 markdown-it 实例定制：
// 注入 emoji 短码插件（:tada: → 🎉）。
// GitHub Alert（> [!WARNING]）已在数据层预转换为 ::: 容器，无需插件。

import { full as markdownItEmoji } from 'markdown-it-emoji'
import type { MarkdownIt } from 'stream-markdown-parser'

export function customMarkdownIt(md: MarkdownIt): MarkdownIt {
  md.use(markdownItEmoji)
  return md
}
