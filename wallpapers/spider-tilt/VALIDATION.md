# 验证结果

交付 APK：`spider-tilt-3d.apk`，29,209 字节。

SHA-256：`8c780db4cdc340de426276b08289cc9ed408310a58d049867ecf79f4b538bdca`

## 构建与静态检查

- Android 35 平台 / Build Tools 35.0.0 编译成功；minSdk 26，targetSdk 35。
- DEX 通用包，没有需要匹配 CPU 架构的原生库。
- APK Signature Scheme v2、v3 验证通过，zipalign 验证通过。
- Manifest 没有申请互联网、照片、存储等权限。
- 构建工具由官方源下载，Android 压缩包与 Google 仓库 SHA-1 元数据匹配，并保存 SHA-256 固定值；`setup-tools.sh` 重跑校验通过。

## 几何和传感器数学

- 同一套 Java 几何实际用于 APK 与 JVM 测试，不使用另一份预览模型。
- 四元数基准校准、旋转轴方向、四元数符号等价和角度限制检查通过。
- 147 组不同分辨率 / 倾斜姿态检查通过，所有投影坐标有限，深度排序正确。
- 场景共有 7,963 个三维三角形 / 线段绘制基元。1440×3120 的三个姿态 SVG 由测试生成。

## 实际 Android 测试

使用本地 Google AOSP Android 9（API 28）软件模拟器，未连接用户的手机或账户。

- APK 安装返回 Success；启动 MainActivity 返回 Status: ok。
- 应用内按钮可进入系统动态壁纸预览；系统选择“主屏幕”后，`dumpsys wallpaper` 绑定 `com.pindou.spidertilt.SpiderWallpaper`。
- 注入模拟陀螺仪和加速度数据后，实际桌面中人物、楼沿和远景的透视发生变化；排除状态栏区域后的前后截图平均绝对像素差为 17.41 / 255。
- 息屏并待系统状态稳定后，传感器服务显示 0 个活动连接；唤醒后，应用的 Game Rotation Vector Sensor 连接恢复。
- 唤醒后画面非黑屏，Android 崩溃日志为空。
- 将 Android 逻辑显示设置为 1440×2560 后，SurfaceFlinger 确认本壁纸的 `activeBuffer=[1440x2560:1440,RGBA_8888]`。模拟器物理显示仍是 1080×1920，所以系统截图由合成器缩到物理尺寸；没有把截图声称为原生 2K 图片。

尚未在真实手机上验证。不同厂商启动器、锁屏、传感器质量和帧率表现可能不同；不保证所有机型都支持锁屏动态壁纸。美术为原创程序化低多边形风格，不是写实电影角色模型。
