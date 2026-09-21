const { withMainApplication, withDangerousMod } = require("expo/config-plugins");
const fs = require("fs");
const path = require("path");

const MODULE_KT = `package com.glez.dev.kilnny

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class PackageCheckerModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String = "PackageChecker"

    @ReactMethod
    fun isPackageInstalled(packageName: String, promise: Promise) {
        try {
            reactApplicationContext.packageManager.getPackageInfo(packageName, 0)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun launchApp(packageName: String, promise: Promise) {
        try {
            val intent = reactApplicationContext.packageManager.getLaunchIntentForPackage(packageName)
            if (intent != null) {
                reactApplicationContext.startActivity(intent)
                promise.resolve(true)
            } else {
                promise.resolve(false)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun uninstallApp(packageName: String, promise: Promise) {
        try {
            val intent = android.content.Intent(android.content.Intent.ACTION_DELETE, android.net.Uri.parse("package:$packageName"))
            intent.addFlags(android.content.Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }
}
`;

const PACKAGE_KT = `package com.glez.dev.kilnny

import com.facebook.react.ReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.uimanager.ViewManager

class PackageCheckerPackage : ReactPackage {
    override fun createNativeModules(reactContext: ReactApplicationContext): List<NativeModule> {
        return listOf(PackageCheckerModule(reactContext))
    }

    override fun createViewManagers(reactContext: ReactApplicationContext): List<ViewManager<*, *>> {
        return emptyList()
    }
}
`;

function withPackageCheckerFiles(config) {
  return withDangerousMod(config, [
    "android",
    async (config) => {
      const projectRoot = config.modRequest.projectRoot;
      const javaDir = path.join(
        projectRoot,
        "android/app/src/main/java/com/glez/dev/kilnny"
      );

      fs.mkdirSync(javaDir, { recursive: true });
      fs.writeFileSync(path.join(javaDir, "PackageCheckerModule.kt"), MODULE_KT);
      fs.writeFileSync(path.join(javaDir, "PackageCheckerPackage.kt"), PACKAGE_KT);

      return config;
    },
  ]);
}

function withPackageCheckerRegistration(config) {
  return withMainApplication(config, (config) => {
    let contents = config.modResults.contents;

    if (!contents.includes("PackageCheckerPackage")) {
      const importLine = "import com.glez.dev.kilnny.PackageCheckerPackage";
      if (!contents.includes(importLine)) {
        contents = contents.replace(
          /(^import .+\n)/m,
          `$1${importLine}\n`
        );
      }

      contents = contents.replace(
        /PackageList\(this\)\.packages\.apply\s*\{([^}]*)\}/m,
        `PackageList(this).packages.apply {\n          add(PackageCheckerPackage())$1}`
      );
    }

    config.modResults.contents = contents;
    return config;
  });
}

module.exports = function withPackageChecker(config) {
  config = withPackageCheckerFiles(config);
  config = withPackageCheckerRegistration(config);
  return config;
};
