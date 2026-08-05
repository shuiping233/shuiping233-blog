<template>
  <WinTitleBar :title="appTitle" :theme="themeSetting" />
  <WinToolTipService />
  <div class="blog-app-content" :class="{ 'has-titlebar': titleBarActive }">
    <WinNavigationView
      :SelectedItem="selectedItem"
      PaneDisplayMode="Auto"
      :MenuItems="menuItems"
      :FooterMenuItems="[]"
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
          <ArticlePage v-else-if="currentPost" :key="currentPost.slug" :post="currentPost" />
        </Transition>
      </div>
    </WinNavigationView>
  </div>
</template>

<script setup>
import { ref, computed, watch, provide } from 'vue';
import WinTitleBar from '../components/WinTitleBar.vue';
import WinToolTipService from '../components/WinToolTipService.vue';
import WinNavigationView from '../components/WinNavigationView.vue';
import WinAutoSuggestBox from '../components/WinAutoSuggestBox.vue';
import HomePage from './pages/HomePage.vue';
import ArticlePage from './pages/ArticlePage.vue';
import {
  categories,
  posts,
  getPost,
  getPostsByCategory,
  allPostTitles
} from './data/posts';

const appTitle = 'WinUI 博客';

// ---- 主题:与 gallery 相同的机制,html.theme-light / html.theme-dark ----
const readStoredSetting = (key, fallback, allowedValues) => {
  const value = localStorage.getItem(key);
  return allowedValues.includes(value) ? value : fallback;
};

const themeSetting = ref(readStoredSetting('winui-theme-setting', 'system', ['system', 'light', 'dark']));

function applyTheme(mode) {
  const html = document.documentElement;
  html.classList.remove('theme-light', 'theme-dark');
  if (mode === 'light') html.classList.add('theme-light');
  else if (mode === 'dark') html.classList.add('theme-dark');
}

watch(themeSetting, (val) => applyTheme(val), { immediate: true });
watch(themeSetting, (val) => localStorage.setItem('winui-theme-setting', val), { immediate: true });

// ---- 标题栏(仅 PWA 窗口控制覆盖时显示) ----
const titleBarActive = ref(false);
provide('winTitleBarVisible', titleBarActive);

// ---- 侧栏菜单:首页 + 分类(展开即文章标题),与 vitepress 侧栏一致 ----
const menuItems = computed(() => [
  { Tag: 'home', Icon: '\uE80F', Content: '首页' },
  ...categories.map((cat) => ({
    Tag: `cat:${cat.id}`,
    Icon: cat.icon,
    Content: cat.name,
    SelectsOnInvoked: false, // 分类项点击只展开,不选中
    MenuItems: getPostsByCategory(cat.id).map((post) => ({
      Tag: post.slug,
      Content: post.title
    }))
  }))
]);

const currentPage = ref('home');

const findMenuItem = (tag) => {
  if (tag === 'home') return menuItems.value[0];
  for (const item of menuItems.value) {
    if (item.Tag === tag) return item;
    const child = item.MenuItems?.find((c) => c.Tag === tag);
    if (child) return child;
  }
  return menuItems.value[0];
};

const selectedItem = computed({
  get: () => findMenuItem(currentPage.value),
  set: (item) => {
    if (item?.Tag) navigate(item.Tag);
  }
});

const navigate = (tag) => {
  if (tag && tag !== currentPage.value) currentPage.value = tag;
};

const onItemInvoked = (args) => {
  const item = args?.InvokedItemContainer;
  if (!item || item.SelectsOnInvoked === false) return;
  if (item.Tag) navigate(item.Tag);
};

const currentPost = computed(() => {
  if (currentPage.value === 'home') return null;
  return getPost(currentPage.value) ?? null;
});

// ---- 侧栏顶部搜索 ----
const searchText = ref('');
const searchSuggestions = ref(allPostTitles());

const onSearchTextChanged = ({ Reason }) => {
  if (Reason !== 'UserInput') return;
  const q = searchText.value.trim().toLowerCase();
  searchSuggestions.value = q
    ? allPostTitles().filter((p) => p.title.toLowerCase().includes(q))
    : allPostTitles();
};

const onSuggestionChosen = ({ SelectedItem }) => {
  if (SelectedItem?.slug) navigate(SelectedItem.slug);
};

const onQuerySubmitted = ({ QueryText, ChosenSuggestion }) => {
  if (ChosenSuggestion?.slug) {
    navigate(ChosenSuggestion.slug);
    return;
  }
  const q = QueryText.trim().toLowerCase();
  const hit = q ? posts.find((p) => p.title.toLowerCase().includes(q)) : null;
  if (hit) navigate(hit.slug);
};
</script>

<style>
  @import '../styles/theme.css';
  @import '../styles/animations.css';

  @font-face {
    font-family: 'WinUIOnWebIcons';
    src: url('../assets/Fonts/SEGOEICONS.TTF') format('truetype');
    font-display: block;
  }

  body .icon,
  body .icon-btn,
  body .win-asb-icon,
  body .win-combo-chevron,
  body .win-expander-arrow,
  body .win-menu-flyout-icon,
  body .win-menu-flyout-check,
  body .win-menu-flyout-check-placeholder,
  body .win-menu-flyout-chevron,
  body .checkbox-glyph,
  body .close-icon,
  body .font-icon,
  body .icon-glyph,
  body .group-icon {
    font-family: 'WinUIOnWebIcons';
  }

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
