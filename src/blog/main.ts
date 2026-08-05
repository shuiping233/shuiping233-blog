import { createApp } from 'vue'
import App from './App.vue'
import 'winui/styles/theme.css'
import 'winui/styles/animations.css'
import 'github-markdown-css/github-markdown.css'
import 'markstream-vue/index.css'
import 'viewerjs/dist/viewer.min.css'
import './styles/blog.css'
import { createI18n, i18nKey } from 'winui/components/i18n/index'
import { setCustomComponents } from 'markstream-vue'
import CustomImageNode from './components/CustomImageNode.vue'

// 文章内图片点击 → viewerjs 灯箱（custom-id="blog" 对应 MarkdownRender）
setCustomComponents('blog', { image: CustomImageNode })

const i18n = createI18n('zh-CN')
document.documentElement.lang = i18n.locale
document.title = 'shuiping233 Blog'

const app = createApp(App)
app.provide(i18nKey, i18n)
app.config.globalProperties.$t = i18n.t
app.mount('#app')
