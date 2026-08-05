# 创建第一个 WinUI 3 应用

本文演示如何从零搭建一个最小的 WinUI 3 应用。

## 环境要求

- Windows 10 1809 或更高版本
- Visual Studio 2022(安装"Windows 应用 SDK"工作负载)
- 或使用 `dotnet new` 命令行模板

## 使用命令行创建

```bash
# 安装模板
dotnet new install Microsoft.WindowsAppSDK.Templates

# 创建项目
dotnet new winui3 -n MyFirstApp

# 运行
dotnet build && dotnet run
```

## 项目结构

```
MyFirstApp/
├── App.xaml          # 应用入口与全局资源
├── App.xaml.cs
├── MainWindow.xaml   # 主窗口
├── MainWindow.xaml.cs
└── app.manifest
```

## 最小示例

```xml
<Window
    x:Class="MyFirstApp.MainWindow"
    xmlns="http://schemas.microsoft.com/winfx/2006/xaml/presentation"
    xmlns:x="http://schemas.microsoft.com/winfx/2006/xaml">

    <StackPanel Padding="24" Spacing="8">
        <TextBlock Text="Hello, WinUI 3!" Style="{StaticResource TitleTextBlockStyle}" />
        <Button Content="点击我" Click="OnButtonClick" />
    </StackPanel>
</Window>
```

## 下一步

应用能跑起来之后,就可以开始引入 NavigationView 构建导航骨架,或者接入 Mica 背景让窗口更有质感。
