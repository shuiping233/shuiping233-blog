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
import CustomCodeBlock from './components/CustomCodeBlock.vue'

// 文章内图片点击 → viewerjs 灯箱（custom-id="blog" 对应 MarkdownRender）
setCustomComponents('blog', { image: CustomImageNode })
// 代码块 → 自定义渲染（WinUI 复制按钮 + 行号 + 轻量着色，替代默认 monaco）
setCustomComponents('blog', { code_block: CustomCodeBlock })

const i18n = createI18n('zh-CN')
document.documentElement.lang = i18n.locale
document.title = 'shuiping233 Blog'

const app = createApp(App)
app.provide(i18nKey, i18n)
app.config.globalProperties.$t = i18n.t
app.mount('#app')
