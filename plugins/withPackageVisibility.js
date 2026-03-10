const { withAndroidManifest } = require("expo/config-plugins");

module.exports = function withPackageVisibility(config) {
  return withAndroidManifest(config, (config) => {
    const manifest = config.modResults.manifest;

    // Add <queries> for package visibility on Android 11+
    if (!manifest.queries) {
      manifest.queries = [];
    }

    // Add intent query for MAIN/LAUNCHER to detect installed apps
    manifest.queries.push({
      intent: [
        {
          action: [{ $: { "android:name": "android.intent.action.MAIN" } }],
          category: [{ $: { "android:name": "android.intent.category.LAUNCHER" } }],
        },
      ],
    });

    // Add REQUEST_DELETE_PACKAGES permission for uninstall functionality
    if (!manifest["uses-permission"]) {
      manifest["uses-permission"] = [];
    }

    const hasDeletePermission = manifest["uses-permission"].some(
      (perm) => perm.$?.["android:name"] === "android.permission.REQUEST_DELETE_PACKAGES"
    );

    if (!hasDeletePermission) {
      manifest["uses-permission"].push({
        $: { "android:name": "android.permission.REQUEST_DELETE_PACKAGES" },
      });
    }

    return config;
  });
};
