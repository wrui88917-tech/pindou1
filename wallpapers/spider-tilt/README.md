# 蜘蛛侠 · 体感3D Android 动态壁纸

可安装的 Android 动态壁纸，适用于 Android 8.0 及以上。手机转动会改变人物和城市的真实透视投影，不是视频循环或静态图片平移。造型采用原创程序化低多边形模型，属于非官方粉丝作品。

## 使用

1. 安装 `spider-tilt-3d.apk`，打开“蜘蛛侠 · 体感3D”。
2. 自然握住手机，点“以当前姿势重新校准”，倾斜手机检查预览。
3. 点“设为动态壁纸”，在系统界面确认应用到主屏幕。
4. 可调灵敏度（0.5–2.5 倍），或启用 20fps 省电模式；默认 30fps。

桌面双击可重新校准，但部分启动器会拦截双击手势；这种情况下重新进入系统壁纸预览校准即可。锁屏是否允许动态壁纸由手机厂商决定，不保证所有机型支持锁屏。

优先使用 game rotation vector，再回退到 rotation vector、重力或加速度传感器。无可用传感器时，桌面保留静态的 3D 视角，应用内仍可拖动预览。没有互联网、照片或存储权限，也不连接任何服务。

壁纸按系统提供的 Surface 原生像素绘制，支持 1440 像素宽的 2K 屏；实际大小与启动器分配的壁纸画布一致，不会把低分辨率素材放大。高分辨率屏幕的实际帧率取决于设备性能。壁纸不可见时停止渲染并注销传感器；静止时避免重复绘制相同画面。

## 源码

- `Scene.java`：程序化人物、三维城市、透视变换、光照和深度排序。无贴图或远程资源。
- `SceneCanvas.java`：Android Canvas 硬件画布绘制，支持软件回退。
- `MotionMath.java` / `MotionInput.java`：相对四元数校准、传感器优先级和屏幕方向映射。
- `SpiderWallpaper.java`：Android WallpaperService、生命周期、省电和双击校准。
- `MainActivity.java`：原生设置、实时预览和系统壁纸选择入口。
- `PreviewCheck.java`：复用应用的几何和传感器数学进行 JVM 测试，输出 1440×3120 的 SVG 预览。

## 构建

本工程没有 Gradle / AndroidX 或运行时第三方依赖。使用 Android 35 平台与 Build Tools 35.0.0、Java 运行时 21、ECJ 3.38.0 编译。`toolchain.json` 记录下载地址及官方校验值。

```sh
bash setup-tools.sh
bash build.sh
java -jar /workspace/android-toolchain/ecj.jar -8 -warn:none -proc:none \
  -d build/preview app/src/main/java/com/pindou/spidertilt/Scene.java \
  app/src/main/java/com/pindou/spidertilt/MotionMath.java PreviewCheck.java
java -cp build/preview PreviewCheck
```

默认工具在 `/workspace/android-toolchain`。可用 `ANDROID_TOOLCHAIN`、`ANDROID_PLATFORM_JAR`、`ANDROID_BUILD_TOOLS`、`ECJ_JAR` 指定其他安装位置。可用 `SPIDER_SIGNING_DIR` 指定私有签名目录；签名材料不包含在源码包中。保留原签名密钥才能以覆盖安装方式更新已安装的 APK。

安装到本地测试模拟器：`adb install -r build/spider-tilt-3d.apk`。这只需要本地 Android SDK，不需要 Google 账户。
