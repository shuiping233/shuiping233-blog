// 博客数据层：文章目录 + md 原文加载。
// 文章源是 docs/posts/*.md（与旧 vitepress 时期相同位置），frontmatter 解析 title/createAt/updateAt。
// 分类：文章 frontmatter 暂无 category 字段，全部归入「未分类」。

export interface BlogCategory {
  id: string
  name: string
  icon: string // Segoe Fluent 图标字符
}

export interface BlogPost {
  slug: string
  title: string
  category: string // 所属分类 id
  date: string // createAt 或空
  /** 原始分类名（frontmatter category），仅用于派生 categories；未分类文章为 undefined */
  _categoryName?: string
}

interface RawFrontmatter {
  title?: string
  createAt?: string
  updateAt?: string
  category?: string // 用户选定的分类字段名：单值字符串，如 `category: WinUI3`
  [key: string]: string | undefined
}

function parseFrontmatter(content: string): { frontmatter: RawFrontmatter; body: string } {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (!match) return { frontmatter: {}, body: content }

  const frontmatter: RawFrontmatter = {}
  for (const line of match[1].split('\n')) {
    const colonIndex = line.indexOf(':')
    if (colonIndex > 0) {
      const key = line.slice(0, colonIndex).trim()
      const value = line.slice(colonIndex + 1).trim().replace(/^["']|["']$/g, '')
      frontmatter[key] = value
    }
  }
  return { frontmatter, body: content.slice(match[0].length) }
}

// md 中图片/视频是相对路径（image/hello/x.webp 相对文章所在 docs/posts/ 目录）。
// publicDir 指向 docs/，故重写为 /posts/image/... 绝对路径。
function rewriteAssetPaths(body: string): string {
  return body
    .replace(/(\]\()(\.\/)?image\//g, '$1/posts/image/')
    .replace(/(src=")(\.\/)?image\//g, '$1/posts/image/')
    .replace(/(href=")(\.\/)?image\//g, '$1/posts/image/')
}

// GitHub Alert（> [!WARNING] 等）markstream 的 markdown-it 流程不支持，
// 预转换为 markstream 原生支持的 ::: 容器语法。
// 注意：只处理「> [!TYPE]」独占一行的 blockquote 段落，其余 blockquote 原样保留。
function convertGithubAlerts(body: string): string {
  const lines = body.split('\n')
  const out: string[] = []
  const typeMap: Record<string, string> = {
    NOTE: 'note',
    TIP: 'tip',
    IMPORTANT: 'warning',
    WARNING: 'warning',
    CAUTION: 'caution',
  }
  let i = 0
  while (i < lines.length) {
    const line = lines[i]
    const match = line.match(/^\s*>\s*\[!([A-Z]+)\]\s*(.*)$/)
    if (match && typeMap[match[1]]) {
      const container = typeMap[match[1]]
      const content: string[] = []
      // 同行标题（> [!WARNING] 标题）作为首行内容
      if (match[2].trim()) content.push(match[2].trim())
      i++
      // 收集后续的 blockquote 行（> xxx），剥掉前缀
      while (i < lines.length) {
        const q = lines[i].match(/^\s*>\s?(.*)$/)
        if (!q) break
        content.push(q[1])
        i++
      }
      out.push(`::: ${container}`)
      out.push(...content)
      out.push(':::')
    } else {
      out.push(line)
      i++
    }
  }
  return out.join('\n')
}

// 分类 id 由分类名派生（URL 安全）：中文/空格 → kebab-case
function categoryIdOf(name: string): string {
  return name
    .trim()
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// Vite 原生支持以原文方式导入全部 md，零依赖。
// 注意：不能用 as:'raw'（Vite 8/rolldown 报 ParseError），必须 query:'?raw' + import:'default'
const rawModules = import.meta.glob('../../../docs/posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

function slugOf(modulePath: string): string {
  const fileName = modulePath.split('/').pop() ?? ''
  return fileName.replace(/\.md$/, '')
}

export const UNCATEGORIZED_ID = 'uncategorized'

// 文章目录：从 frontmatter 读取 title/category/createAt
// 注意：此处先构建 posts，分类（categories）从 posts 派生，避免模块初始化时
// 在 const 声明前访问 rawModules（TDZ ReferenceError，dev 白屏）。
export const posts: BlogPost[] = Object.keys(rawModules)
  .map((modulePath) => {
    const raw = rawModules[modulePath]
    const { frontmatter } = parseFrontmatter(raw)
    const categoryName = frontmatter.category?.trim()
    return {
      slug: slugOf(modulePath),
      title: frontmatter.title || slugOf(modulePath),
      category: categoryName ? categoryIdOf(categoryName) : UNCATEGORIZED_ID,
      // 派生分类所需的原始分类名（未指定的为 undefined → 归未分类）
      _categoryName: categoryName,
      date: frontmatter.createAt || '',
    }
  })
  .sort((a, b) => (b.date || '').localeCompare(a.date || ''))

// 分类从已构建的 posts 派生（依赖顺序：rawModules → posts → categories）
export const categories: BlogCategory[] = (() => {
  const nameSet = new Set<string>()
  for (const post of posts) {
    if (post._categoryName) nameSet.add(post._categoryName)
  }
  const named = [...nameSet].map((name) => ({
    id: categoryIdOf(name),
    name,
    icon: '\uE8B7',
  }))
  const uncategorized: BlogCategory = { id: UNCATEGORIZED_ID, name: '未分类', icon: '\uE8B7' }
  return [...named, uncategorized]
})()

export const getPostContent = (slug: string): string => {
  const entry = Object.entries(rawModules).find(
    ([path]) => slugOf(path) === slug,
  )
  if (!entry) return ''
  const { body } = parseFrontmatter(entry[1])
  return convertGithubAlerts(rewriteAssetPaths(body))
}

export const getPost = (slug: string): BlogPost | undefined =>
  posts.find((p) => p.slug === slug)

export const getPostsByCategory = (categoryId: string): BlogPost[] =>
  posts.filter((p) => p.category === categoryId)

// 全部文章标题，供搜索建议使用
export const allPostTitles = (): { title: string; slug: string }[] =>
  posts.map((p) => ({ title: p.title, slug: p.slug }))

// 首页内容：渲染 docs/index.md（去掉 frontmatter）
const indexRawModule = import.meta.glob('../../../docs/index.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

export const homeContent: string = (() => {
  const entry = Object.values(indexRawModule)[0]
  if (!entry) return '# 欢迎来到我的博客'
  const { body } = parseFrontmatter(entry)
  return convertGithubAlerts(rewriteAssetPaths(body))
})()
