import { createApp } from 'vue'
import App from './App.vue'
import 'winui/styles/theme.css'
import 'winui/styles/animations.css'
import 'github-markdown-css/github-markdown-dark.css'
import 'markstream-vue/index.css'
import 'viewerjs/dist/viewer.min.css'
import './styles/blog.css'
import { createI18n, i18nKey } from 'winui/components/i18n/index'

const i18n = createI18n('zh-CN')
document.documentElement.lang = i18n.locale
document.title = 'shuiping233 Blog'

const app = createApp(App)
app.provide(i18nKey, i18n)
app.config.globalProperties.$t = i18n.t
app.mount('#app')
