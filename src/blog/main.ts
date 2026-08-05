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
import CustomMediaPlayer from './components/CustomMediaPlayer.vue'
import CustomDetails from './components/CustomDetails.vue'

// 全局自定义组件覆盖（必须在 app.mount() 前注册：
// markstream 的注册表在渲染器初始化时快照，懒加载模块里注册会晚于渲染导致不生效。
// 注意：setCustomComponents 单参数全局形式是【覆盖】不是【合并】，必须一次传全部键）
setCustomComponents({
  image: CustomImageNode,
  code_block: CustomCodeBlock,
  html_inline: CustomMediaPlayer,
  vmr_container: CustomDetails,
})

const i18n = createI18n('zh-CN')
document.documentElement.lang = i18n.locale
document.title = 'shuiping233 Blog'

const app = createApp(App)
app.provide(i18nKey, i18n)
app.config.globalProperties.$t = i18n.t
app.mount('#app')
