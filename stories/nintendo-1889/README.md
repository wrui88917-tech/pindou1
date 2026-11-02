# 任天堂，远比想象古老 · 1889

依据用户提供的《任天堂冷知识 · 2分钟短视频分镜脚本》制作。

成片：[`../../exports/nintendo-1889-120s-4k.mp4`](../../exports/nintendo-1889-120s-4k.mp4)

规格：120 秒，3840×2160，16:9，24fps，H.264 + AAC。

复古水彩插画、慢推镜与横移、淡入叠化、中文男声合成旁白、中文字幕，以及原创程序合成的轻柔钢琴与弦乐垫音。插画为生成的历史题材示意图，不是历史照片；视频为 4K 编排输出，画面素材含放大处理。

## 时间结构

- 00:00–00:06：开场提问
- 00:06–00:18：1889 年京都
- 00:18–00:32：花札工艺
- 00:32–00:46：同年的巴黎铁塔
- 00:46–01:02：两地同年的对照
- 01:02–01:16：纸牌之外的探索
- 01:16–01:30：创意玩具与 Ultra Hand
- 01:30–01:44：FC、Game Boy、Wii、Switch
- 01:44–01:54：回到花札，呼应童年
- 01:54–02:00：Nintendo 1889，淡出

## 对脚本的谨慎调整

未采用存在史料争议的“情侣酒店”说法，保留速食米和出租车业务；将 Ultra Hand 相关的“电子玩具”改为“创意玩具”，避免将机械玩具误称为电子玩具。旁白中的英文机型名称使用便于中文合成发音的写法，画面及字幕保留原名。正文按标点分组显示字幕。

## 编辑与复现

本目录为 HyperFrames 工程；旁白与配乐已混合在 assets/soundtrack.m4a 中，不依赖在线语音服务。

需要 Node.js 22+、FFmpeg、Chromium，以及 Noto Serif CJK SC 中文字体。

```sh
npm run check
npx --yes hyperframes@0.9.3 preview
npx --yes hyperframes@0.9.3 render --fps 24 --quality high --video-bitrate 5M --workers 3 --output nintendo-1889-120s-4k.mp4
```

云环境可使用 `HYPERFRAMES_BROWSER_PATH=/usr/bin/chromium` 指定现有浏览器。

`index.html` 是可编辑的动画源；播放与声音同步由 HyperFrames Studio 管理。`subtitles.srt` 是旁白字幕，`scenes.json` 保存分镜与旁白时间。画面仅有意进行缓慢移动与叠化；开头纯黑及淡入段落按脚本保留。

## 验证

HyperFrames 完整检查通过：脚本运行、布局、动画与音频均无错误。保留叠化过程的有意画面重叠及开头黑场。最终 MP4 已完整解码通过；视频 2880 帧，音视频轨道均为 120 秒。
