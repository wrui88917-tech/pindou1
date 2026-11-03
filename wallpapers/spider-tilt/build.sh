#!/usr/bin/env bash
set -euo pipefail
cd "$(dirname "$0")"
toolchain="${ANDROID_TOOLCHAIN:-/workspace/android-toolchain}"
platform_jar="${ANDROID_PLATFORM_JAR:-$toolchain/platform/android-35/android.jar}"
build_tools="${ANDROID_BUILD_TOOLS:-$toolchain/build-tools/android-15}"
compiler="${ECJ_JAR:-$toolchain/ecj.jar}"
signing="${SPIDER_SIGNING_DIR:-/workspace/.pindou-android-signing}"
mkdir -p build/classes build/gen build/dex "$signing"
chmod 700 "$signing"
chmod +x "$build_tools/aapt2" "$build_tools/zipalign"
"$build_tools/aapt2" compile --dir app/src/main/res -o build/resources.zip
"$build_tools/aapt2" link -I "$platform_jar" --manifest app/src/main/AndroidManifest.xml --java build/gen -o build/unsigned.apk build/resources.zip
find app/src/main/java build/gen -name '*.java' > build/sources.list
java -jar "$compiler" -8 -warn:none -proc:none -bootclasspath "$platform_jar:$build_tools/core-lambda-stubs.jar" -d build/classes @build/sources.list
find build/classes -name '*.class' > build/classes.list
java -cp "$build_tools/lib/d8.jar" com.android.tools.r8.D8 --release --min-api 26 --lib "$platform_jar" --output build/dex @build/classes.list
python3 - <<'PY'
import zipfile,pathlib
with zipfile.ZipFile('build/unsigned.apk','a',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(pathlib.Path('build/dex').glob('classes*.dex')):z.write(p,p.name)
PY
"$build_tools/zipalign" -f -p 4 build/unsigned.apk build/aligned.apk
if [ ! -f "$signing/spider-tilt.jks" ]; then
 python3 - "$signing/password" <<'PY'
import secrets,os,sys
fd=os.open(sys.argv[1],os.O_CREAT|os.O_EXCL|os.O_WRONLY,0o600)
with os.fdopen(fd,'w') as f:f.write(secrets.token_urlsafe(32))
PY
 keytool -genkeypair -keystore "$signing/spider-tilt.jks" -alias spider-tilt -keyalg RSA -keysize 2048 -validity 10000 -storepass:file "$signing/password" -keypass:file "$signing/password" -dname 'CN=Spider Tilt Personal Build,O=Personal,C=US' >/dev/null 2>&1
fi
java -jar "$build_tools/lib/apksigner.jar" sign --ks "$signing/spider-tilt.jks" --ks-key-alias spider-tilt --ks-pass "file:$signing/password" --out build/spider-tilt-3d.apk build/aligned.apk
java -jar "$build_tools/lib/apksigner.jar" verify --verbose build/spider-tilt-3d.apk
"$build_tools/zipalign" -c -p 4 build/spider-tilt-3d.apk
echo 'Built: build/spider-tilt-3d.apk'
