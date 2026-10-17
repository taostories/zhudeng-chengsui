# 竹灯承岁

一灯承岁，灯火相传。以元宵竹灯为线索的四卷剧情交互网页游戏，讲述从童年跟随祖父做灯，到长大后学习手艺、陪伴孩子的故事。

[在线试玩](https://taostories.github.io/zhudeng-chengsui/)

## 玩法

- 卷一「元夕将至」：左右拖动画卷，轻点夜空放烟花。
- 卷二「檐下制灯」：弯竹篾、绑铁丝、蒙布抚平，选择梅花、兰草或竹叶并涂绘灯面。
- 卷三「灯火万千」：漫游灯会，点击四种花灯放大欣赏。
- 卷四「灯火承传」：整理工序、修整竹灯、陪阿禾弯竹篾并递灯。

支持桌面鼠标、手机触摸及部分键盘辅助操作。每次新打开或刷新页面显示“从头读起”；同一页面内回到主菜单可继续当前进度。本次通关后，“续上灯火”可选择章节重玩。

## 本地运行与发布

纯静态 HTML、CSS 和 JavaScript，无需构建或安装依赖。在仓库目录运行任意静态服务器，例如安装 Python 后执行：

```sh
python -m http.server 5188
```

浏览器访问 http://localhost:5188/ 。GitHub Pages 从 main 分支根目录发布，图片和脚本均使用相对路径。

## 制作与素材

剧情与美术方向由创作者提出并持续修订；Codex 辅助代码实现、剧情润色、图片裁切去底及验证。插画、人物、工具和书法标题由创作者使用图片生成工具制作并提供。人物与家庭经历属于虚构叙事。

公开仓库供作品展示，不代表授予图片或作品的再利用许可。

## 背景音乐

“Guzheng City” 和 “Ripples” — Kevin MacLeod (incompetech.com)。
Licensed under Creative Commons: By Attribution 4.0，https://creativecommons.org/licenses/by/4.0/ 。

- Guzheng City 来源：https://incompetech.com/music/royalty-free/index.html?isrc=USUAN2100001
- Ripples 来源：https://incompetech.com/music/royalty-free/index.html?isrc=USUAN1100691
- 修改：压缩至 96 kbps MP3、32 kHz 立体声，调整响度和首尾淡化；游戏内循环播放并在卷四交叉淡入。

上述两首音乐单独适用 CC BY 4.0，前述作品再利用说明不限制该音乐许可授予的权利。首屏不请求音频，点击“从头读起”后渐进播放，无需下载完整音频；“音乐”按钮控制音乐和音效，显示加载状态并支持失败重试。本页面会话只在卷四向第二首切换一次，回菜单或重读早期章节不倒换歌曲。
