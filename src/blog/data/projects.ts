// 首页项目列表数据
export interface Project {
  name: string
  description: string
  url: string
  /** 可选：Segoe Fluent 图标字符，用于卡片图标 */
  icon?: string
}

export const projects: Project[] = [
  {
    name: 'AstrBot',
    description: '聊天机器人框架',
    url: 'https://github.com/shuiping233/AstrBot',
    icon: '\uE8F1',
  },
  {
    name: 'openwrt-system-monitor',
    description: 'OpenWrt 系统监控',
    url: 'https://github.com/shuiping233/openwrt-system-monitor',
    icon: '\uE9D2',
  },
  {
    name: 'github-proxy-fetch',
    description: 'GitHub 代理下载',
    url: 'https://github.com/shuiping233/github-proxy-fetch',
    icon: '\uE774',
  },
  {
    name: 'MemeManager',
    description: '表情包管理器（WinUI 3）',
    url: 'https://github.com/shuiping233/MemeManager',
    icon: '\uE8BD',
  },
  {
    name: 'ra2mod-复仇时刻',
    description: 'Command & Conquer: Red Alert 2 模组',
    url: 'https://www.moddb.com/mods/revenge-now',
    icon: '\uE7FC',
  },
  {
    name: 'rn_issues_auto_archiving',
    description: '复仇时刻 issues 自动归档',
    url: 'https://github.com/revengenowstudio/rn_issues_auto_archiving',
    icon: '\uE81C',
  },
  {
    name: 'revengenowstudio/devops',
    description: '复仇时刻 DevOps 工具链',
    url: 'https://github.com/revengenowstudio/devops',
    icon: '\uE950',
  },
]
