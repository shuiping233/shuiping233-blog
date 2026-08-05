<template>
  <WinTitleBar :title="appTitle" :theme="themeSetting" />
  <WinToolTipService />
  <div class="blog-app-content" :class="{ 'has-titlebar': titleBarActive }">
    <WinNavigationView
      :SelectedItem="selectedItem"
      PaneDisplayMode="Auto"
      :MenuItems="menuItems"
      :FooterMenuItems="footerMenuItems"
      :IsSettingsVisible="false"
      IsBackButtonVisible="Collapsed"
      @ItemInvoked="onItemInvoked">
      <template #AutoSuggestBox>
        <WinAutoSuggestBox
          PlaceholderText="搜索文章…"
          QueryIcon="Find"
          v-model:Text="searchText"
          :ItemsSource="searchSuggestions"
          TextMemberPath="title"
          @TextChanged="onSearchTextChanged"
          @SuggestionChosen="onSuggestionChosen"
          @QuerySubmitted="onQuerySubmitted" />
      </template>

      <div class="blog-page">
        <Transition name="blog-fade" mode="out-in">
          <HomePage v-if="currentPage === 'home'" key="home" @navigate="navigate" />
          <SettingsPage v-else-if="currentPage === 'settings'" key="settings" />
          <ArticlePage v-else-if="currentPost" :key="currentPost.slug" :post="currentPost" />
        </Transition>
      </div>
    </WinNavigationView>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, provide } from 'vue'
import WinTitleBar from 'winui/components/WinTitleBar.vue'
import WinToolTipService from 'winui/components/WinToolTipService.vue'
import WinNavigationView from 'winui/components/WinNavigationView.vue'
import WinAutoSuggestBox from 'winui/components/WinAutoSuggestBox.vue'
import HomePage from './pages/HomePage.vue'
import ArticlePage from './pages/ArticlePage.vue'
import SettingsPage from './pages/SettingsPage.vue'
import {
  categories,
  posts,
  getPost,
  getPostsByCategory,
  allPostTitles,
} from './data/posts'

const appTitle = 'shuiping233 Blog'

// ---- 主题：与 gallery 相同的机制，html.theme-light / html.theme-dark；system = 不加类，CSS 自动跟随 ----
type ThemeMode = 'system' | 'light' | 'dark'

const readStoredSetting = <T extends string>(key: string, fallback: T, allowedValues: readonly T[]): T => {
  const value = localStorage.getItem(key)
  return (allowedValues as readonly string[]).includes(value ?? '') ? (value as T) : fallback
}

const themeSetting = ref<ThemeMode>(
  readStoredSetting<ThemeMode>('winui-theme-setting', 'system', ['system', 'light', 'dark']),
)

function applyTheme(mode: ThemeMode) {
  const html = document.documentElement
  html.classList.remove('theme-light', 'theme-dark')
  if (mode === 'light') html.classList.add('theme-light')
  else if (mode === 'dark') html.classList.add('theme-dark')
}

watch(themeSetting, (val) => applyTheme(val), { immediate: true })
watch(themeSetting, (val) => localStorage.setItem('winui-theme-setting', val), { immediate: true })

// 供 SettingsPage 双向使用
provide('themeSetting', themeSetting)

// ---- 标题栏（仅 PWA 窗口控制覆盖时显示）----
const titleBarActive = ref(false)
provide('winTitleBarVisible', titleBarActive)

interface NavItem {
  Tag: string
  Icon?: string
  Content: string
  SelectsOnInvoked?: boolean
  MenuItems?: NavItem[]
}

// ---- 侧栏菜单：首页 + 分类（展开即文章标题），底部置顶「设置」 ----
const menuItems = computed<NavItem[]>(() => [
  { Tag: 'home', Icon: '\uE80F', Content: '首页' },
  ...categories.map((cat) => ({
    Tag: `cat:${cat.id}`,
    Icon: cat.icon,
    Content: cat.name,
    SelectsOnInvoked: false, // 分类项点击只展开，不选中
    MenuItems: getPostsByCategory(cat.id).map((post) => ({
      Tag: post.slug,
      Content: post.title,
    })),
  })),
])

const footerMenuItems: NavItem[] = [
  { Tag: 'settings', Icon: '\uE713', Content: '设置' },
]

// ---- URL 路由（History 模式）----
// /             → home
// /posts/:slug  → 文章（slug 为文件名，可能含中文/空格，需 encode/decode）
// /settings     → settings
const routeToTag = (path: string): string => {
  if (path === '/' || path === '') return 'home'
  if (path === '/settings') return 'settings'
  const m = path.match(/^\/posts\/(.+)$/)
  if (m) {
    const slug = decodeURIComponent(m[1])
    return getPost(slug) ? slug : 'home'
  }
  return 'home'
}

const tagToRoute = (tag: string): string => {
  if (tag === 'home') return '/'
  if (tag === 'settings') return '/settings'
  return `/posts/${encodeURIComponent(tag)}`
}

// 初始加载：从当前 URL 恢复页面状态（支持刷新/直达文章页）
const currentPage = ref<string>(routeToTag(window.location.pathname))

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
  if (currentPage.value === 'home' || currentPage.value === 'settings') return null
  return getPost(currentPage.value) ?? null
})

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

  .blog-app-content.has-titlebar {
    --blog-titlebar-height: var(--win-titlebar-height, env(titlebar-area-height, 32px));
    height: calc(100% - var(--blog-titlebar-height));
    margin-top: var(--blog-titlebar-height);
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
