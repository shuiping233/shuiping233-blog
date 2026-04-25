<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'

interface PostItem {
  title: string
  path: string
}

interface PostsData {
  [date: string]: {
    created?: PostItem[]
    updated?: PostItem[]
  }
}

// 折叠状态
const isPostsListCollapsed = ref(false)
const isUpdateStatusCollapsed = ref(false)

// 文章数据
const postsData = ref<PostsData>({})

// 加载 posts.json
onMounted(async () => {
  try {
    const response = await fetch('/posts.json')
    if (response.ok) {
      postsData.value = await response.json()
    }
  } catch (error) {
    console.error('Failed to load posts.json:', error)
  }
})

// 按日期倒序排列的创建列表
const sortedCreatedDates = computed(() => {
  const dates = Object.keys(postsData.value).filter(date => 
    postsData.value[date]?.created && postsData.value[date].created!.length > 0
  )
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
})

// 按日期倒序排列的更新列表
const sortedUpdatedDates = computed(() => {
  const dates = Object.keys(postsData.value).filter(date => 
    postsData.value[date]?.updated && postsData.value[date].updated!.length > 0
  )
  return dates.sort((a, b) => new Date(b).getTime() - new Date(a).getTime())
})

// 切换折叠状态
const togglePostsList = () => {
  isPostsListCollapsed.value = !isPostsListCollapsed.value
}

const toggleUpdateStatus = () => {
  isUpdateStatusCollapsed.value = !isUpdateStatusCollapsed.value
}
</script>

<template>
  <div class="posts-list-container">
    <!-- 第一部分：文章列表 -->
    <section class="posts-section">
      <h1 class="section-title" @click="togglePostsList">
        <span class="toggle-icon" :class="{ collapsed: isPostsListCollapsed }">
          ▼
        </span>
        文章列表
      </h1>
      <div v-show="!isPostsListCollapsed" class="section-content">
        <div v-if="sortedCreatedDates.length === 0" class="empty-state">
          暂无文章
        </div>
        <div v-else>
          <div v-for="date in sortedCreatedDates" :key="date" class="date-group">
            <h2 class="date-title">{{ date }}</h2>
            <ul class="post-list">
              <li v-for="post in postsData[date].created" :key="post.path" class="post-item">
                <a :href="post.path" class="post-link">{{ post.title }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>

    <!-- 分隔线 -->
    <hr class="divider" />

    <!-- 第二部分：文章更新状态 -->
    <section class="posts-section">
      <h1 class="section-title" @click="toggleUpdateStatus">
        <span class="toggle-icon" :class="{ collapsed: isUpdateStatusCollapsed }">
          ▼
        </span>
        文章更新状态
      </h1>
      <div v-show="!isUpdateStatusCollapsed" class="section-content">
        <div v-if="sortedUpdatedDates.length === 0" class="empty-state">
          暂无更新记录
        </div>
        <div v-else>
          <div v-for="date in sortedUpdatedDates" :key="date" class="date-group">
            <h2 class="date-title">{{ date }}</h2>
            <ul class="post-list">
              <li v-for="post in postsData[date].updated" :key="post.path" class="post-item">
                <a :href="post.path" class="post-link">{{ post.title }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.posts-list-container {
  max-width: 960px;
  margin: 0 auto;
  padding: 32px 24px;
}

.posts-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 2rem;
  font-weight: 600;
  color: var(--vp-c-text-1);
  margin-bottom: 24px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--vp-c-divider);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 12px;
  user-select: none;
  transition: color 0.2s;
}

.section-title:hover {
  color: var(--vp-c-brand-1);
}

.toggle-icon {
  font-size: 0.75rem;
  color: var(--vp-c-text-3);
  transition: transform 0.3s ease;
  display: inline-block;
}

.toggle-icon.collapsed {
  transform: rotate(-90deg);
}

.section-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.date-group {
  margin-bottom: 24px;
}

.date-title {
  font-size: 1.5rem;
  font-weight: 500;
  color: var(--vp-c-text-2);
  margin-bottom: 12px;
  padding-left: 8px;
  border-left: 4px solid var(--vp-c-brand-1);
}

.post-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.post-item {
  margin-bottom: 8px;
  padding-left: 16px;
}

.post-item::before {
  content: "•";
  color: var(--vp-c-brand-1);
  margin-right: 8px;
}

.post-link {
  color: var(--vp-c-brand-1);
  text-decoration: none;
  font-size: 1rem;
  line-height: 1.6;
  transition: color 0.2s;
}

.post-link:hover {
  color: var(--vp-c-brand-2);
  text-decoration: underline;
}

.divider {
  border: none;
  border-top: 1px solid var(--vp-c-divider);
  margin: 48px 0;
}

.empty-state {
  color: var(--vp-c-text-3);
  font-style: italic;
  padding: 24px;
  text-align: center;
  background: var(--vp-c-bg-soft);
  border-radius: 8px;
}

/* 响应式适配 */
@media (max-width: 640px) {
  .posts-list-container {
    padding: 24px 16px;
  }

  .section-title {
    font-size: 1.5rem;
  }

  .date-title {
    font-size: 1.25rem;
  }
}
</style>
