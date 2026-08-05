# NavigationView 导航控件详解

NavigationView 是 WinUI 3 中最常用的导航容器,它天然支持左侧导航栏、顶部导航和自适应折叠。

## 基本用法

```xml
<NavigationView PaneDisplayMode="Left">
    <NavigationView.MenuItems>
        <NavigationViewItem Content="首页" Icon="Home" Tag="home" />
        <NavigationViewItem Content="设置" Icon="Setting" Tag="settings" />
    </NavigationView.MenuItems>

    <Frame x:Name="ContentFrame" />
</NavigationView>
```

## 菜单项结构

菜单项支持两级展开:父项可以包含子项,点击父项会展开/收起子项列表。

```xml
<NavigationViewItem Content="控件" Icon="Library">
    <NavigationViewItem.MenuItems>
        <NavigationViewItem Content="按钮" Tag="button" />
        <NavigationViewItem Content="列表" Tag="list" />
    </NavigationViewItem.MenuItems>
</NavigationViewItem>
```

## 关键属性

| 属性 | 说明 |
| --- | --- |
| PaneDisplayMode | Left / LeftCompact / Top / Auto |
| IsPaneOpen | 侧栏是否展开 |
| IsBackButtonVisible | 是否显示返回按钮 |
| MenuItemsSource | 数据绑定方式提供菜单项 |

## 选中态与事件

- `ItemInvoked`:用户点击某个菜单项时触发
- `SelectionChanged`:选中项变化时触发
- `SelectedItem`:当前选中的菜单项

## 自适应行为

`PaneDisplayMode="Auto"` 会根据窗口宽度自动切换:

- 宽窗口:完整侧栏
- 中等窗口:紧凑图标栏
- 窄窗口:汉堡菜单 + 覆盖式侧栏
