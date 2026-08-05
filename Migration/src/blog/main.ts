import { createApp } from 'vue'
import App from './App.vue'
import '../styles/theme.css'
import '../styles/animations.css'
import { createI18n, i18nKey } from '../components/i18n/index'

const i18n = createI18n('zh-CN')
document.documentElement.lang = i18n.locale
document.title = 'WinUI 博客'

const app = createApp(App)
app.provide(i18nKey, i18n)
app.config.globalProperties.$t = i18n.t
app.mount('#app')
