---
title: WinUI3应用把AI相关内容砍掉以减少打包体积
createAt: 2026-07-18
updateAt: 2026-07-18
---

# Windows App Sdk 强制捆绑AI相关接口, 即使没有用到这部分的库

我最近做了一个表情包管理器[MemeManager], 想到我这边只windows上用, 于是乎选了[WinUI3]框架来搓, 因为它ui和控件设计风格和动画确实是非常不错的, 但是用过才知道坑也确实不少, Win32 API 和 框架设计让我吃了不少苦头

由于WinUI3的AI部分完全和`WindowsAppSDK`绑在一起发布, 所以没法单独通过不去build AI接口相关的dll,

```xml
<ItemGroup>
    <PackageReference Include="Microsoft.Windows.SDK.BuildTools" Version="10.0.28000.2270" />
    <PackageReference Include="Microsoft.WindowsAppSDK" Version="2.2.0" />
    <PackageReference Include="Microsoft.Windows.SDK.BuildTools.WinApp" Version="0.4.0" />
  </ItemGroup>
```

所以嘛,只能考虑build完毕后再处理这类dll了, `不过csproj功能非常强大`, 支持build完毕对打包产物文件进行增删改查之类的操作, 只需要在`.csproj`文件的`<Project>`里如下内容, 这样就能build的时候自动把AI相关的dll的移除掉了

```xml
<Target Name="RemoveUnusedAiDlls" AfterTargets="Build;Publish">
    <ItemGroup>
      <_AiDlls Include="$(OutDir)onnxruntime.dll" />
      <_AiDlls Include="$(OutDir)DirectML.dll" />
      <_AiDlls Include="$(OutDir)Microsoft.ML.OnnxRuntime.dll" />
      <_AiDlls Include="$(OutDir)Microsoft.Windows.AI.MachineLearning.dll" />
      <_AiDlls Include="$(OutDir)Microsoft.Windows.AI.*.dll" />
    </ItemGroup>
    <Delete Files="@(_AiDlls)" TreatErrorsAsWarnings="true" />
</Target>
```

然后也列出来能移除的ai相关的dll, 这些dll加起来应该有`30MB`的体积
我的release zip打包从 `27.2 MB` 降到了 `10.5 MB`, 实在是太令人兴奋了
我已经试验过, 应用里没有使用ai相关的接口, 这些dll移除了也不会导致应用任何的问题

```md
onnxruntime.dll
DirectML.dll
Microsoft.ML.OnnxRuntime.dll
Microsoft.Windows.AI.MachineLearning.dll
Microsoft.Windows.AI.MachineLearning.Projection.dll
Microsoft.Windows.AI.Foundation.Projection.dll
Microsoft.Windows.AI.Text.Projection.dll
Microsoft.Windows.AI.Imaging.Projection.dll
Microsoft.Windows.AI.Video.Projection.dll
Microsoft.Windows.AI.ContentSafety.Projection.dll
Microsoft.Windows.AI.Projection.dll
```

不过还下面个ai相关的dll我不太确定, 我没没做具体的实验, 体积不算大才400KB我就放过了它

```md
System.Numerics.Tensors.dll
```

当然了看这些dll名称也能猜到这些dll是负责什么部分的, 理论上应用里没有用到相关的接口和控件, 是可以删掉这类这些不需要的dll的, WinUI3的模块化这块坐的是真的还行, 下面就列一下dll的分类

- webview2相关

```md
Microsoft.Web.WebView2.Core.Projection.dll
Microsoft.Web.WebView2.Core.dll
WebView2Loader.dll
```

- Security相关

```md
Microsoft.Security.Authentication.OAuth.Projection.dll
```

- windows接口包装相关, 这部分dll应该就不能删了

```md
Microsoft.WindowsAppRuntime.Bootstrap.Net.dll
Microsoft.Windows.ApplicationModel.Background.Projection.dll
Microsoft.Windows.ApplicationModel.Background.UniversalBGTask.dll
Microsoft.Windows.ApplicationModel.DynamicDependency.Projection.dll
Microsoft.Windows.ApplicationModel.Resources.Projection.dll
Microsoft.Windows.ApplicationModel.WindowsAppRuntime.Projection.dll
Microsoft.Windows.AppLifecycle.Projection.dll
Microsoft.Windows.AppNotifications.Builder.Projection.dll
Microsoft.Windows.AppNotifications.Projection.dll
Microsoft.Windows.BadgeNotifications.Projection.dll
Microsoft.Windows.Foundation.Projection.dll
Microsoft.Windows.Management.Deployment.Projection.dll
Microsoft.Windows.Media.Capture.Projection.dll
Microsoft.Windows.PushNotifications.Projection.dll
Microsoft.Windows.SDK.NET.dll
Microsoft.Windows.Security.AccessControl.Projection.dll
Microsoft.Windows.Storage.Pickers.Projection.dll
Microsoft.Windows.Storage.Projection.dll
Microsoft.Windows.System.Power.Projection.dll
Microsoft.Windows.System.Projection.dll
Microsoft.Windows.Widgets.Projection.dll
Microsoft.WindowsAppRuntime.Bootstrap.dll
```

## 吐槽

我寻思着删了AI接口相关的dll应用也不会爆炸, 这部分dll也不是强依赖性质的库, 那为什么不单独把AI部分的库拆出做一个新的nuget包来import呢?

我理解不能.jpg

微软的神鬼二象性这块

[MemeManager]: https://github.com/shuiping233/MemeManager
[WinUI3]: https://learn.microsoft.com/zh-cn/windows/apps/winui/winui3/