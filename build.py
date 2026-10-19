#!/usr/bin/env python3
"""
有序星球 · APK 极简打包脚本

不依赖 Gradle / Node.js / Capacitor。
只用 Android SDK 的 build-tools + platforms + JDK，
把 HTML/CSS/JS 编译成一个最小的 Android WebView APK。

本次修复内容：
  - 顶部无原生 ActionBar（黑边）
  - 状态栏紫色 #6C5CE7，与页眉无缝衔接
  - 锁死系统字体缩放，跨机型一致
  - 允许 file:// 加载 woff2 字体
  - 关闭 v4 签名，不生成 .idsig

用法：
    python build.py
    set KEY_PASS=你的密码 && python build.py

可选：
    在项目根目录放一个 icon.png（512×512 或 1024×1024），
    脚本会自动把它作为应用图标。
"""

import os
import re
import shutil
import subprocess
import sys
import tempfile
import zipfile
from pathlib import Path

# ==================== 配置区 ====================
ROOT = Path(__file__).parent.resolve()

APP_NAME     = "有序星球"
PACKAGE      = "com.organized.ledger"
VERSION_NAME = "5.1.18"
VERSION_CODE = "50118"
MIN_SDK      = "24"          # Android 7.0
TARGET_SDK   = "34"          # Android 14（避免 Android 15 强制 edge-to-edge）

STATUS_BAR   = "#6C5CE7"     # 状态栏颜色，与 HTML 页眉一致

KEYSTORE     = ROOT / "release.keystore"
KEY_ALIAS    = "ledger"
KEY_PASS     = os.environ.get("KEY_PASS", "ledger123")   # ← 换成你自己的

DIST         = ROOT / "dist"
APK_NAME     = "有序星球.apk"
ICON_FILE    = ROOT / "icon.png"          # 可选

WEB_ITEMS    = ["index.html", "style", "script", "fonts"]
# ================================================


# ==================== 工具函数 ====================

def run(cmd, cwd=None, check=True):
    cmd = [str(c) for c in cmd]
    print("  $ " + " ".join(cmd))
    if os.name == "nt":
        return subprocess.run(cmd, cwd=cwd, check=check, shell=True)
    return subprocess.run(cmd, cwd=cwd, check=check, shell=False)


def find_sdk():
    sdk = os.environ.get("ANDROID_HOME") or os.environ.get("ANDROID_SDK_ROOT")
    if sdk and Path(sdk).exists():
        return Path(sdk)
    default = Path(os.environ.get("LOCALAPPDATA", "")) / "Android" / "Sdk"
    if default.exists():
        return default
    sys.exit("✗ 找不到 Android SDK，请设置 ANDROID_HOME")


def newest_dir(parent):
    dirs = [d for d in parent.iterdir() if d.is_dir()]
    if not dirs:
        return None
    dirs.sort(key=lambda d: [int(x) for x in re.findall(r"\d+", d.name)])
    return dirs[-1]


def find_build_tools(sdk):
    bt = sdk / "build-tools"
    if not bt.exists():
        sys.exit(f"✗ 找不到 {bt}")
    d = newest_dir(bt)
    if not d:
        sys.exit("✗ build-tools 为空")
    return d


def find_platform(sdk):
    p = sdk / "platforms"
    if not p.exists():
        sys.exit(f"✗ 找不到 {p}")
    target = p / f"android-{TARGET_SDK}"
    if target.exists():
        return target
    # 退而求其次：选最新的已安装 platform
    d = newest_dir(p)
    if not d:
        sys.exit("✗ platforms 为空")
    return d


def find_java_tool(name):
    p = shutil.which(name)
    if p:
        return p
    # Android Studio JBR
    for base in [
        Path("C:/Program Files/Android/Android Studio/jbr/bin"),
        Path("C:/Program Files/Microsoft") / "jdk-21",
    ]:
        if base.exists():
            for ext in ("", ".exe"):
                cand = base / (name + ext)
                if cand.exists():
                    return str(cand)
    # Microsoft JDK 目录扫描
    ms = Path("C:/Program Files/Microsoft")
    if ms.exists():
        for jdk in ms.iterdir():
            if jdk.is_dir() and jdk.name.startswith("jdk"):
                for ext in ("", ".exe"):
                    cand = jdk / "bin" / (name + ext)
                    if cand.exists():
                        return str(cand)
    return None


# ==================== 生成模板文件 ====================

# _new_java.py
JAVA_SOURCE = r'''package {PACKAGE};

import android.annotation.SuppressLint;
import android.app.Activity;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Build;
import android.os.Bundle;
import android.view.KeyEvent;
import android.view.View;
import android.view.Window;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;

public class MainActivity extends Activity {{
    private WebView webView;
    private ValueCallback<Uri[]> filePathCallback;
    private static final int FILE_CHOOSER_REQUEST = 100;

    @SuppressLint({{"SetJavaScriptEnabled", "SetJavaScriptEnabled"}})
    @Override
    protected void onCreate(Bundle savedInstanceState) {{
        super.onCreate(savedInstanceState);

        requestWindowFeature(Window.FEATURE_NO_TITLE);

        Window window = getWindow();
        window.setStatusBarColor(Color.parseColor("{STATUS_BAR}"));

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {{
            View decor = window.getDecorView();
            int flags = decor.getSystemUiVisibility();
            flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
            decor.setSystemUiVisibility(flags);
        }}

        webView = new WebView(this);

        WebSettings s = webView.getSettings();
        s.setJavaScriptEnabled(true);
        s.setDomStorageEnabled(true);
        s.setDatabaseEnabled(true);
        s.setAllowFileAccess(true);
        s.setAllowContentAccess(true);
        s.setAllowFileAccessFromFileURLs(true);
        s.setAllowUniversalAccessFromFileURLs(true);
        s.setUseWideViewPort(false);
        s.setLoadWithOverviewMode(false);
        s.setSupportZoom(false);
        s.setBuiltInZoomControls(false);
        s.setDisplayZoomControls(false);
        s.setTextZoom(100);
        s.setMinimumFontSize(1);
        s.setDefaultFontSize(16);
        s.setDefaultFixedFontSize(16);

        webView.setWebViewClient(new WebViewClient());
        webView.setOverScrollMode(WebView.OVER_SCROLL_NEVER);

        /* ============ 文件选择器（图片上传） ============ */
        webView.setWebChromeClient(new WebChromeClient() {{
            @Override
            public boolean onShowFileChooser(WebView wv,
                                             ValueCallback<Uri[]> cb,
                                             FileChooserParams params) {{
                if (filePathCallback != null) {{
                    filePathCallback.onReceiveValue(null);
                }}
                filePathCallback = cb;

                Intent intent = params.createIntent();
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                try {{
                    startActivityForResult(intent, FILE_CHOOSER_REQUEST);
                }} catch (Exception e) {{
                    filePathCallback = null;
                    return false;
                }}
                return true;
            }}
        }});

        /* ============ JS 桥：状态栏颜色 ============ */
        webView.addJavascriptInterface(new Object() {{
            @JavascriptInterface
            public void setStatusBarColor(final String hex, final boolean darkIcons) {{
                runOnUiThread(new Runnable() {{
                    @Override
                    public void run() {{
                        try {{
                            getWindow().setStatusBarColor(Color.parseColor(hex));
                            View decor = getWindow().getDecorView();
                            int flags = decor.getSystemUiVisibility();
                            if (darkIcons) {{
                                flags |= View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                            }} else {{
                                flags &= ~View.SYSTEM_UI_FLAG_LIGHT_STATUS_BAR;
                            }}
                            decor.setSystemUiVisibility(flags);
                        }} catch (Exception e) {{}}
                    }}
                }});
            }}
        }}, "Android");

        webView.loadUrl("file:///android_asset/index.html");
        setContentView(webView);
    }}

    /* 文件选择器回调 */
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {{
        if (requestCode == FILE_CHOOSER_REQUEST) {{
            if (filePathCallback == null) {{
                super.onActivityResult(requestCode, resultCode, data);
                return;
            }}
            Uri[] results = null;
            if (resultCode == Activity.RESULT_OK && data != null) {{
                if (data.getClipData() != null) {{
                    int count = data.getClipData().getItemCount();
                    results = new Uri[count];
                    for (int i = 0; i < count; i++) {{
                        results[i] = data.getClipData().getItemAt(i).getUri();
                    }}
                }} else if (data.getData() != null) {{
                    results = new Uri[]{{ data.getData() }};
                }}
            }}
            filePathCallback.onReceiveValue(results);
            filePathCallback = null;
        }}
        super.onActivityResult(requestCode, resultCode, data);
    }}

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {{
        if (keyCode == KeyEvent.KEYCODE_BACK && webView != null) {{
            if (webView.canGoBack()) {{
                webView.goBack();
                return true;
            }}
        }}
        return super.onKeyDown(keyCode, event);
    }}
}}
'''


def write_java(temp):
    pkg_dir = temp / "src" / PACKAGE.replace(".", "/")
    pkg_dir.mkdir(parents=True, exist_ok=True)
    (pkg_dir / "MainActivity.java").write_text(
        JAVA_SOURCE.format(PACKAGE=PACKAGE, STATUS_BAR=STATUS_BAR),
        encoding="utf-8",
    )


def write_manifest(temp):
    has_icon = ICON_FILE.exists()
    icon_line = 'android:icon="@mipmap/ic_launcher"' if has_icon else ""

    xml = f'''<?xml version="1.0" encoding="utf-8"?>
<manifest xmlns:android="http://schemas.android.com/apk/res/android"
    package="{PACKAGE}">

    <uses-sdk android:minSdkVersion="{MIN_SDK}"
              android:targetSdkVersion="{TARGET_SDK}" />

    <application
        android:label="{APP_NAME}"
        {icon_line}
        android:theme="@android:style/Theme.Material.Light.NoActionBar"
        android:allowBackup="true"
        android:hardwareAccelerated="true"
        android:usesCleartextTraffic="true">

        <activity
            android:name=".MainActivity"
            android:exported="true"
            android:label="{APP_NAME}"
            android:configChanges="orientation|screenSize|keyboardHidden|screenLayout|uiMode"
            android:screenOrientation="portrait">
            <intent-filter>
                <action android:name="android.intent.action.MAIN" />
                <category android:name="android.intent.category.LAUNCHER" />
            </intent-filter>
        </activity>
    </application>
</manifest>
'''
    (temp / "AndroidManifest.xml").write_text(xml, encoding="utf-8")


# ==================== 各步骤 ====================

def ensure_keystore():
    if KEYSTORE.exists():
        print("  - 复用已有 keystore")
        return
    print("  - 生成签名 keystore")
    keytool = find_java_tool("keytool")
    if not keytool:
        sys.exit("✗ 找不到 keytool")
    run([
        keytool, "-genkeypair", "-v",
        "-keystore", KEYSTORE,
        "-alias", KEY_ALIAS,
        "-keyalg", "RSA",
        "-keysize", "2048",
        "-validity", "10000",
        "-storepass", KEY_PASS,
        "-keypass", KEY_PASS,
        "-dname", "CN=Ledger, OU=Dev, O=Yoursite, L=Beijing, ST=Beijing, C=CN",
    ])
    print(f"  ✓ 生成 {KEYSTORE.name}，请务必备份！")


def copy_assets(temp):
    assets = temp / "assets"
    assets.mkdir(exist_ok=True)
    for item in WEB_ITEMS:
        src, dst = ROOT / item, assets / item
        if not src.exists():
            # fonts 目录如果不存在，给个警告但不中断
            if item == "fonts":
                print(f"  ! 未找到 {item}/，将使用系统字体")
                continue
            sys.exit(f"✗ 缺少 {item}")
        if src.is_dir():
            shutil.copytree(src, dst)
        else:
            shutil.copy2(src, dst)
    print(f"  ✓ 复制 web 资源 → assets/")


def copy_icon(temp):
    if not ICON_FILE.exists():
        print("  - 未提供 icon.png，使用系统默认图标")
        return
    mipmap = temp / "res" / "mipmap"
    mipmap.mkdir(parents=True, exist_ok=True)
    shutil.copy2(ICON_FILE, mipmap / "ic_launcher.png")
    print(f"  ✓ 图标 {ICON_FILE.name}")


def aapt2_compile_res(temp, bt):
    res = temp / "res"
    if not res.exists():
        return None
    out = temp / "res.zip"
    run([bt / "aapt2.exe", "compile", "--dir", res, "-o", out])
    return out


def aapt2_link(temp, bt, android_jar, res_zip):
    base = temp / "base.apk"
    cmd = [
        bt / "aapt2.exe", "link",
        "-o", base,
        "-I", android_jar,
        "--manifest", temp / "AndroidManifest.xml",
        "-A", temp / "assets",
        "--min-sdk-version", MIN_SDK,
        "--target-sdk-version", TARGET_SDK,
        "--version-code", VERSION_CODE,
        "--version-name", VERSION_NAME,
        "--auto-add-overlay",
    ]
    if res_zip:
        cmd.extend(["-R", res_zip])
    run(cmd)
    return base


def compile_java(temp, android_jar, bt):
    javac = find_java_tool("javac")
    if not javac:
        sys.exit("✗ 找不到 javac")

    classes = temp / "classes"
    classes.mkdir(exist_ok=True)

    java_files = list((temp / "src").rglob("*.java"))
    if not java_files:
        sys.exit("✗ 没有找到 .java 源文件")

    run([
        javac,
        "--release", "8",
        "-classpath", android_jar,
        "-d", classes,
    ] + java_files)

    d8 = bt / ("d8.bat" if os.name == "nt" else "d8")
    class_files = list(classes.rglob("*.class"))

    run([
        d8,
        "--lib", android_jar,
        "--min-api", MIN_SDK,
        "--output", temp,
    ] + class_files)

    dex = temp / "classes.dex"
    if not dex.exists():
        sys.exit("✗ d8 没有生成 classes.dex")
    return dex


def add_dex_to_apk(base_apk, dex):
    with zipfile.ZipFile(base_apk, "a", zipfile.ZIP_DEFLATED) as apk:
        apk.write(dex, "classes.dex")
    print("  ✓ 添加 classes.dex")


def align_and_sign(temp, bt, base_apk):
    DIST.mkdir(exist_ok=True)
    out = DIST / APK_NAME

    zipalign  = bt / ("zipalign.exe" if os.name == "nt" else "zipalign")
    apksigner = bt / ("apksigner.bat" if os.name == "nt" else "apksigner")

    aligned = temp / "aligned.apk"
    run([zipalign, "-f", "-p", "4", base_apk, aligned])
    run([
        apksigner, "sign",
        "--ks", KEYSTORE,
        "--ks-key-alias", KEY_ALIAS,
        "--ks-pass", f"pass:{KEY_PASS}",
        "--key-pass", f"pass:{KEY_PASS}",
        "--v1-signing-enabled", "true",
        "--v2-signing-enabled", "true",
        "--v3-signing-enabled", "true",
        "--v4-signing-enabled", "false",     # 不生成 .idsig
        "--out", out,
        aligned,
    ])

    # 清理可能残留的 .idsig
    idsig = DIST / (APK_NAME + ".idsig")
    if idsig.exists():
        idsig.unlink()

    return out


# ==================== 主流程 ====================

def main():
    print("=== 有序星球 · APK 极简打包 ===\n")

    # 环境
    sdk = find_sdk()
    bt = find_build_tools(sdk)
    platform = find_platform(sdk)
    android_jar = platform / "android.jar"

    print("[0/7] 环境")
    print(f"  SDK        : {sdk}")
    print(f"  build-tools: {bt.name}")
    print(f"  platform   : {platform.name}")
    if not android_jar.exists():
        sys.exit(f"✗ 找不到 {android_jar}，请在 SDK Manager 中安装该平台")
    print(f"  android.jar: ✓")

    ensure_keystore()

    # 用系统临时目录，避免中文路径问题
    temp = Path(tempfile.mkdtemp(prefix="ledger_build_"))
    print(f"\n  临时目录: {temp}")

    try:
        print("\n[1/7] 写入源码与 Manifest")
        write_java(temp)
        write_manifest(temp)
        print("  ✓ MainActivity.java")
        print("  ✓ AndroidManifest.xml")

        print("\n[2/7] 复制 web 资源")
        copy_assets(temp)

        print("\n[3/7] 处理图标")
        copy_icon(temp)

        print("\n[4/7] aapt2 编译资源")
        res_zip = aapt2_compile_res(temp, bt)
        if res_zip:
            print("  ✓ res.zip")
        else:
            print("  - 无 res，跳过")

        print("\n[5/7] aapt2 链接生成 base APK")
        base = aapt2_link(temp, bt, android_jar, res_zip)

        print("\n[6/7] javac + d8 编译 Java")
        dex = compile_java(temp, android_jar, bt)
        add_dex_to_apk(base, dex)

        print("\n[7/7] zipalign + apksigner")
        out = align_and_sign(temp, bt, base)

        size = out.stat().st_size / 1024 / 1024
        print(f"\n✓ 完成：{out}")
        print(f"  大小：{size:.2f} MB")
        print(f'\n安装到手机：adb install -r "{out}"')

    finally:
        # 清理临时目录
        try:
            shutil.rmtree(temp, ignore_errors=True)
        except Exception:
            pass


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as e:
        sys.exit(f"\n✗ 命令失败（退出码 {e.returncode}）：{' '.join(str(c) for c in e.cmd)}")
    except KeyboardInterrupt:
        sys.exit("\n已中断")