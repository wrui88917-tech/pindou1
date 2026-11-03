# 蛛网都市 · 电影景深（Android v2）

本版保留用户选择的照片细节，通过轻幅深度网格、体感输入和独立细雨层生成壁纸。原来的低多边形人物已移除。它属于照片深度视差（2.5D），不是能够绕看背面的完整 3D 模型。

图一目前只以聊天内嵌图可见，未作为可读取的原图文件提供，所以本包没有假称已内置图一。安装后可直接从手机中选择图一，避免先上传或压缩它。

## 使用

1. 安装 v2 APK，可直接覆盖同签名的 v1。
2. 打开“蛛网都市 · 电影景深”，点“选择壁纸原图”，选择自己的高清图片。
3. 自然握住手机，检查体感预览；点“设为动态壁纸”，在系统中确认主屏幕。
4. 根据图片选择“图一：斜向近景人物”“居中的人物或物件”或“整幅画面轻移”。

设置页向下滑可调整灵敏度、细雨、省电模式和重新归中。桌面双击也可归中，但部分启动器可能拦截这个手势。锁屏支持由手机系统决定。

图片只复制到应用私有目录，不会上传。应用没有申请网络、相册全量或存储权限；系统图片选择器只授权本次选择的图片。取消选图不会清空旧图。为控制内存，大于约 600 万像素的图片会在解码时降采样；源文件本身不重新压缩。支持常见 JPEG EXIF 方向。

## 画质与边界

壁纸按照系统 Surface 的原生像素绘制，支持 1440×2560 / 1440×3120 的 2K 画布。最终细节仍取决于原图；输出像素数不意味着自动补出了额外纹理。图片采用双线性纹理采样，不生成低模光照或马赛克面。

深度预设没有进行 AI 人体识别。“图一”预设按用户参考图的头部和斜向躯干位置配置，脸部中心使用平缓的深度平台。位移受限，画布预留约 10.5% 放大量以避免露边。大幅偏转不能真实显露原图遮挡的背景；需要精确人物遮罩与干净背景才能进一步改善分层边界。当前并未用实际图一审看所有边缘，因为缺少可读取的原图文件。

## 代码与构建

- `PhotoStore.java`：私有原图导入、解码上限、EXIF 方向与共享位图缓存。
- `DepthMath.java`：照片深度场、面部平台、网格变换和边缘预留。
- `SceneCanvas.java`：Android 硬件 Canvas 纹理网格与细雨层。
- `MotionMath.java` / `MotionInput.java`：相对四元数、传感器回退和校准。
- `SpiderWallpaper.java`：Android WallpaperService、生命周期与省电。
- `MainActivity.java`：系统图片选择、体感预览、设置和系统壁纸入口。
- `DepthCheck.java`：复用真实网格的 JVM 测试。

需要 Java 21、Python 3、Android 35 平台、Build Tools 35.0.0 与 ECJ 3.38.0。无运行时第三方依赖。

```sh
bash setup-tools.sh
bash build.sh
java -jar /workspace/android-toolchain/ecj.jar -8 -warn:none -proc:none \
  -d build/depth-check app/src/main/java/com/pindou/spidertilt/DepthMath.java \
  app/src/main/java/com/pindou/spidertilt/MotionMath.java DepthCheck.java
java -cp build/depth-check DepthCheck
```

默认工具位于 `/workspace/android-toolchain`，可用 `ANDROID_TOOLCHAIN` 等变量覆盖，详见构建脚本。签名目录通过 `SPIDER_SIGNING_DIR` 指定；签名密钥不包含在源码包。保留原签名密钥才能覆盖安装已发布版本。

配套网页预览在 `../spider-cinematic-preview/`，同样可由用户选择原图，无服务器上传。
