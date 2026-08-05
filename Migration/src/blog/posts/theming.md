# 主题、资源和样式系统

WinUI 3 的样式系统基于 XAML 资源和主题字典,理解它有助于构建一致的界面。

## 主题字典

主题字典(ThemeDictionaries)允许为浅色和深色主题分别定义资源:

```xml
<ResourceDictionary.ThemeDictionaries>
    <ResourceDictionary x:Key="Light">
        <Color x:Key="AppBackground">#F3F3F3</Color>
    </ResourceDictionary>
    <ResourceDictionary x:Key="Dark">
        <Color x:Key="AppBackground">#202020</Color>
    </ResourceDictionary>
</ResourceDictionary.ThemeDictionaries>
```

应用主题切换时,`AppBackground` 会自动指向对应主题的值。

## 资源层级

资源解析按以下优先级查找:

1. 元素自身的属性
2. 元素级资源
3. 页面级资源
4. 应用级资源(App.xaml)
5. 主题字典

## 样式与控件模板

样式(Style)通过 Setter 设置控件属性,控件模板(ControlTemplate)定义控件的视觉结构:

```xml
<Style x:Key="CardStyle" TargetType="Border">
    <Setter Property="Background" Value="{ThemeResource CardBackground}" />
    <Setter Property="CornerRadius" Value="8" />
    <Setter Property="Padding" Value="16" />
</Style>
```

## 在 Web 中的对应实现

在网页里,"主题字典"可以对应 CSS 自定义属性(`@property` + `html.theme-light/dark` 切换),"资源层级"对应 CSS 的级联与继承——这正是本博客所用 UI 库的底层机制。
