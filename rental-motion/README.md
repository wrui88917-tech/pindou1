# 星粒拼豆 · 在家快乐开拼

36秒竖屏短片，1080×1920、30fps，H.264/AAC。画面由 HTML Canvas 逐帧绘制，音乐由离线 Web Audio 合成，无外部素材或付费接口。

## 查看与修改

用现代浏览器打开 `index.html`，即可观看循环播放的无声动画。文字、颜色、图形和时间轴均在该文件中。MP4 另含合成背景音乐。

## 导出 MP4

需 Node.js、FFmpeg、Chromium 及支持中文的字体（推荐 Noto Sans CJK SC）。

```sh
npm install --no-save playwright-core
node render.cjs
```

Chromium 默认路径为 `/usr/bin/chromium`，其他路径可通过 `CHROME_PATH` 环境变量指定。也可通过 `node render.cjs /absolute/path/output.mp4` 指定视频输出位置。

导出时使用离线音频和固定时间逐帧渲染，约生成1080帧，结果包含背景音乐。脚本同时生成临时音频与部分抽样画面。

## 内容

0–3秒：开场；3–9秒：两种方案与优惠；9–15秒：工具清单；15–21秒：计费；21–26秒：智能板；26–32秒：配送与成品；32–36秒：退押规则。
