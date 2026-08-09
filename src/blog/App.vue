<template>
  <WinToolTipService />
  <!-- 404 提示：访问不存在的路径时（服务器 SPA 兜底），弹框告知并引导回首页 -->
  <WinContentDialog
    v-model:IsOpen="notFoundDialogOpen"
    Title="页面不存在"
    PrimaryButtonText="确定"
    DefaultButton="Primary"
    @PrimaryButtonClick="onNotFoundConfirm">
    <WinTextBlock :Text="`找不到路径 ${notFoundPath} 的内容`" TextWrapping="WrapWholeWords" />
  </WinContentDialog>
  <div class="blog-app-content">
    <WinNavigationView :SelectedItem="selectedItem" PaneDisplayMode="Auto" :MenuItems="menuItems"
      :FooterMenuItems="footerMenuItems" :IsSettingsVisible="false" IsBackButtonVisible="Collapsed"
      @ItemInvoked="onItemInvoked">
      <template #AutoSuggestBox>
        <WinAutoSuggestBox PlaceholderText="搜索文章…" QueryIcon="Find" v-model:Text="searchText"
          :ItemsSource="searchSuggestions" TextMemberPath="title" @TextChanged="onSearchTextChanged"
          @SuggestionChosen="onSuggestionChosen" @QuerySubmitted="onQuerySubmitted" />
      </template>

      <div class="blog-page">
        <Transition name="blog-fade" mode="out-in">
          <HomePage v-if="currentPage === 'home'" key="home" @navigate="navigate" />
          <OverviewPage v-else-if="currentPage === 'overview'" key="overview" @navigate="navigate"
            @navigate-category="onNavigateCategory" />
          <CategoryPage v-else-if="currentCategoryId" :key="currentCategoryId" :category-id="currentCategoryId"
            @navigate="navigate" />
          <SettingsPage v-else-if="currentPage === 'settings'" key="settings" />
          <ArticlePage v-else-if="currentPost" :key="currentPost.slug" :post="currentPost" />
        </Transition>
      </div>
    </WinNavigationView>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide, defineAsyncComponent } from 'vue'
import WinToolTipService from 'winui/components/WinToolTipService.vue'
import WinNavigationView from 'winui/components/WinNavigationView.vue'
import WinAutoSuggestBox from 'winui/components/WinAutoSuggestBox.vue'
// 页面加载：ArticlePage/HomePage 静态引入（markstream 自定义组件注册需与渲染
// 在同一模块实例，懒加载会破坏 setCustomComponents 的全局注册生效）。
// SettingsPage 无 markstream 依赖，保持懒加载。
import HomePage from './pages/HomePage.vue'
import OverviewPage from './pages/OverviewPage.vue'
import CategoryPage from './pages/CategoryPage.vue'
// ArticlePage 懒加载：只有它用 markstream（约 650KB），首页/总览/分类页不加载
const ArticlePage = defineAsyncComponent(() => import('./pages/ArticlePage.vue'))
const SettingsPage = defineAsyncComponent(() => import('./pages/SettingsPage.vue'))
import WinContentDialog from 'winui/components/WinContentDialog.vue'
import WinTextBlock from 'winui/components/WinTextBlock.vue'
import {
  categories,
  posts,
  getPost,
  getPostsByCategory,
  allPostTitles,
} from './data/posts'

// ---- 主题：固定深色（不做浅色/跟随系统）----
// 始终给 html 挂 theme-dark + dark 类：
//   - theme-dark：WinUI 控件深色变量
//   - dark：markstream / github-markdown-dark.css 深色变量
const html = document.documentElement
html.classList.add('theme-dark', 'dark')
localStorage.setItem('winui-theme-setting', 'dark')


interface NavItem {
  Tag: string
  Icon?: string
  Content: string
  SelectsOnInvoked?: boolean
  ToolTip?: string // hover tooltip（WinNavigationView 的 itemToolTipAttrs 读取）
  MenuItems?: NavItem[]
}

// ---- 侧栏菜单：首页 + 分类（展开即文章标题），底部置顶「设置」 ----
const menuItems = computed<NavItem[]>(() => [
  { Tag: 'home', Icon: '\uE80F', Content: '首页' },
  { Tag: 'overview', Icon: '\uE9D2', Content: '文章总览' },
  ...categories.map((cat) => ({
    Tag: `cat:${cat.id}`,
    Icon: cat.icon,
    Content: cat.name,
    // 点击分类项：既展开子文章，也跳转分类列表页（SelectsOnInvoked 默认 true）
    MenuItems: getPostsByCategory(cat.id).map((post) => ({
      Tag: post.slug,
      Icon: '\uF000', // 文件图标（Document）
      Content: post.title,
      ToolTip: post.title, // hover 显示完整标题（长标题被截断时）
    })),
  })),
])

const footerMenuItems: NavItem[] = [
  { Tag: 'settings', Icon: '\uE713', Content: '设置' },
]

// ---- URL 路由（History 模式）----
// /             → home
// /overview     → 文章总览
// /category/:id → 分类页（id 为分类 id，如 winui3/随笔）
// /posts/:slug  → 文章（slug 为文件名，可能含中文/空格，需 encode/decode）
// /settings     → settings
const routeToTag = (path: string): string => {
  if (path === '/' || path === '') return 'home'
  if (path === '/overview') return 'overview'
  if (path === '/settings') return 'settings'
  let m = path.match(/^\/category\/(.+)$/)
  if (m) {
    const id = decodeURIComponent(m[1])
    return categories.some((c) => c.id === id) ? `cat:${id}` : 'home'
  }
  m = path.match(/^\/posts\/(.+)$/)
  if (m) {
    const slug = decodeURIComponent(m[1])
    return getPost(slug) ? slug : 'home'
  }
  return 'home'
}

// 判断路径是否为已知路由（用于 404 检测）
const isKnownPath = (path: string): boolean => {
  if (path === '/' || path === '' || path === '/overview' || path === '/settings') return true
  let m = path.match(/^\/category\/(.+)$/)
  if (m) {
    const id = decodeURIComponent(m[1])
    return categories.some((c) => c.id === id)
  }
  m = path.match(/^\/posts\/(.+)$/)
  if (m) {
    const slug = decodeURIComponent(m[1])
    return Boolean(getPost(slug))
  }
  return false
}

const tagToRoute = (tag: string): string => {
  if (tag === 'home') return '/'
  if (tag === 'overview') return '/overview'
  if (tag === 'settings') return '/settings'
  if (tag.startsWith('cat:')) return `/category/${encodeURIComponent(tag.slice(4))}`
  return `/posts/${encodeURIComponent(tag)}`
}

// 初始加载：从当前 URL 恢复页面状态（支持刷新/直达文章页）
const currentPage = ref<string>(routeToTag(window.location.pathname))

// ---- 404 检测：路径不是已知路由时（服务器 SPA 兜底），弹框提示 ----
const notFoundPath = ref<string>('')
const notFoundDialogOpen = ref(false)

if (!isKnownPath(window.location.pathname)) {
  notFoundPath.value = window.location.pathname
  notFoundDialogOpen.value = true
}

// 点击「确定」回到首页
const onNotFoundConfirm = () => {
  notFoundDialogOpen.value = false
  navigate('/')
}

// 浏览器前进/后退：URL 变化时同步页面
window.addEventListener('popstate', () => {
  currentPage.value = routeToTag(window.location.pathname)
})

const findMenuItem = (tag: string): NavItem => {
  if (tag === 'home') return menuItems.value[0]
  if (tag === 'settings') return footerMenuItems[0]
  for (const item of menuItems.value) {
    if (item.Tag === tag) return item
    const child = item.MenuItems?.find((c) => c.Tag === tag)
    if (child) return child
  }
  return menuItems.value[0]
}

const selectedItem = computed<NavItem>({
  get: () => findMenuItem(currentPage.value),
  set: (item) => {
    if (item?.Tag) navigate(item.Tag)
  },
})

const navigate = (tag: string) => {
  if (!tag || tag === currentPage.value) return
  const target = routeToTag(tagToRoute(tag))
  if (!target || target === currentPage.value) return
  currentPage.value = target
  history.pushState(null, '', tagToRoute(target))
}

const onItemInvoked = (args: { InvokedItemContainer?: NavItem; IsSettingsInvoked?: boolean }) => {
  if (args?.IsSettingsInvoked) {
    navigate('settings')
    return
  }
  const item = args?.InvokedItemContainer
  if (!item || item.SelectsOnInvoked === false) return
  if (item.Tag) navigate(item.Tag)
}

const currentPost = computed(() => {
  if (currentPage.value === 'home' || currentPage.value === 'overview' || currentPage.value === 'settings') return null
  if (currentPage.value.startsWith('cat:')) return null
  return getPost(currentPage.value) ?? null
})

// 当前分类页的分类 id（currentPage 为 cat:xxx 时）
const currentCategoryId = computed(() =>
  currentPage.value.startsWith('cat:') ? currentPage.value.slice(4) : null,
)

// 总览页「分类导航」点击 → 分类页
const onNavigateCategory = (id: string) => navigate(`cat:${id}`)

// ---- 侧栏顶部搜索 ----
const searchText = ref('')
const searchSuggestions = ref(allPostTitles())

const onSearchTextChanged = ({ Reason }: { Reason: string }) => {
  if (Reason !== 'UserInput') return
  const q = searchText.value.trim().toLowerCase()
  searchSuggestions.value = q
    ? allPostTitles().filter((p) => p.title.toLowerCase().includes(q))
    : allPostTitles()
}

const onSuggestionChosen = ({ SelectedItem }: { SelectedItem?: { slug: string } }) => {
  if (SelectedItem?.slug) navigate(SelectedItem.slug)
}

const onQuerySubmitted = ({
  QueryText,
  ChosenSuggestion,
}: {
  QueryText: string
  ChosenSuggestion?: { slug: string }
}) => {
  if (ChosenSuggestion?.slug) {
    navigate(ChosenSuggestion.slug)
    return
  }
  const q = QueryText.trim().toLowerCase()
  const hit = q ? posts.find((p) => p.title.toLowerCase().includes(q)) : null
  if (hit) navigate(hit.slug)
}
</script>

<style>
.blog-app-content {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.blog-page {
  width: 100%;
  height: 100%;
  min-width: 0;
  min-height: 0;
}

.blog-fade-enter-active {
  transition: opacity 0.18s ease;
}

.blog-fade-leave-active {
  transition: opacity 0.1s ease;
}

.blog-fade-enter-from,
.blog-fade-leave-to {
  opacity: 0;
}
</style>
