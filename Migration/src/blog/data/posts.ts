// 博客文章数据:分类 + 文章目录 + md 原文加载。
// md 目前按原文导入,由 ArticlePage 以只读文本展示;
// 后续接入 markdown 渲染器时,只需替换展示组件,数据层不用动。

export interface BlogCategory {
  id: string
  name: string
  icon: string // Segoe Fluent 图标字符
}

export interface BlogPost {
  slug: string
  title: string
  category: string // 所属分类 id
  date: string
}

export const categories: BlogCategory[] = [
  { id: 'basics', name: '快速入门', icon: '\uE8B7' },
  { id: 'controls', name: '控件指南', icon: '\uE8FD' },
  { id: 'architecture', name: '架构与原理', icon: '\uE8A5' }
]

export const posts: BlogPost[] = [
  { slug: 'winui-intro', title: '什么是 WinUI 3', category: 'basics', date: '2025-06-01' },
  { slug: 'first-app', title: '创建第一个 WinUI 3 应用', category: 'basics', date: '2025-06-10' },
  { slug: 'navigationview', title: 'NavigationView 导航控件详解', category: 'controls', date: '2025-06-20' },
  { slug: 'theming', title: '主题、资源和样式系统', category: 'architecture', date: '2025-07-01' }
]

// Vite 原生支持以原文方式导入全部 md,零依赖
const rawModules = import.meta.glob('../posts/*.md', {
  eager: true,
  query: '?raw',
  import: 'default'
}) as Record<string, string>

export const getPostContent = (slug: string): string =>
  rawModules[`../posts/${slug}.md`] ?? ''

export const getPost = (slug: string): BlogPost | undefined =>
  posts.find((p) => p.slug === slug)

export const getPostsByCategory = (categoryId: string): BlogPost[] =>
  posts.filter((p) => p.category === categoryId)

// 全部文章标题,供搜索建议使用
export const allPostTitles = (): { title: string; slug: string }[] =>
  posts.map((p) => ({ title: p.title, slug: p.slug }))
