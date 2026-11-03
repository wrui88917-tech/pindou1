# 任天堂冷知识 · 连续可视化 MP4 新版

依据《任天堂冷知识-VibeCoding连续可视化方案-MP4版.docx》重新制作，保留旧版工程及成片。

目标成片为 120 秒、1920×1080、30fps，H.264 / yuv420p + AAC。无旁白，程序合成氛围音乐与拟音。播放页面无需外部依赖；没有外部图片、字体文件或音频素材。系统本地衬线字体负责中文显示。

## 源文件

- `index.html`、`film.js`：单 Canvas 连续时间轴、6000 个守恒粒子及代码绘制的历史物件。
- `audio.js`：OfflineAudioContext 合成 120 秒立体声、导出 PCM WAV。
- `player.js`：播放、暂停、拖动时间轴、声音开关。播放器控件不进入成片。
- `export.mjs`：Playwright + 系统 Chromium，逐帧 PNG、自动检查、FFmpeg 编码。
- `DESIGN.md`：色彩、字体、运动与历史约束。

## 预览与导出

需要 Node.js 22+、Python 3、FFmpeg、系统 Chromium 和本地中文衬线字体。示例使用 `/usr/bin/chromium`。Playwright 仅为导出工具依赖，不参与页面播放。

```sh
cd /workspace/pindou1/stories/nintendo-continuous-mp4
PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1 npm ci
npm run dev
# 另一个终端
npm test
npm run inspect
WORKERS=3 npm run render
```

此云环境还安装了 `/workspace/.pindou-tools/node_modules/playwright`；导出器在项目未安装依赖时会使用它。其他环境请运行上面的 `npm ci`。可用 `HYPERFRAMES_BROWSER_PATH` 指定 Chromium，用 `PLAYWRIGHT_MODULE` 指定另一处 Playwright 安装，用 `OUTPUT` 指定 MP4 路径。

导出中间文件在忽略的 `frames/`、`audio.wav` 中。默认成片为本目录的 `nintendo-continuous-120s-1080p.mp4`。请仅在源文件、字体和浏览器完全相同时使用 `node export.mjs --resume` 复用帧；否则重新渲染。三个并行页面分别渲染连续帧区间，最后合并按帧序验证。

## 时间与验证

采用文档的唯一版时间结构：0–8 开场；8–28 京都与花札；28–46 巴黎铁塔；46–62 两地同年；62–80 副业与玩具；80–108 四代游戏设备；108–120 回到花札并收束。物件位置对应一幅横向长卷，摄像机沿长卷移动；粒子在目标点集之间缓动，常规变形持续至少 1.5 秒。

酒店符号依原文要求只在 71.1–71.9 秒以灰色小图标参与重组，不加文字；这是文档中的争议副业视觉符号，不代表核实该传闻。该 0.8 秒插入是文档特别规定的短暂例外。铁塔为红褐色、无现代彩灯；京都场景没有现代设备；游戏设备顺序为红白机 → Game Boy → Wii → Switch。

文字仅采用原文白名单。时间轴从首帧到末帧可见，结尾保留纸面与“1889”，不淡成黑场。字体形状为系统字体采样；中文店招也由粒子构成。

导出器实际遍历 3600 帧并额外调用 `renderFrame(120)`，检查异常、6000 粒子、文字白名单、黑白帧及相邻低分辨率画面差异，写出 `validation.json`。该差异检查检测全屏突变，不能替代对艺术效果的人工审看。`--inspect` 抽取 18 个关键帧，不能替代完整渲染验证。最终文件还应使用 ffprobe 核对规格并用 FFmpeg 完整解码。

音乐为原创程序合成，不模仿任天堂原版启动旋律；音频及画面使用同一套秒时间轴。导出时以 FFmpeg loudnorm（-20 LUFS、-1.5 dBTP）调整聆听音量，避免原始合成音轨过轻。
