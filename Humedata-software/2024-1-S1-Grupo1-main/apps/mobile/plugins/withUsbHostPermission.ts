const { withAndroidManifest } = require("@expo/config-plugins")

module.exports = function withUsbHostPermission(config) {
  return withAndroidManifest(config, async (config) => {
    const manifest = config.modResults
    if (!manifest.manifest["uses-permission"]) {
      manifest.manifest["uses-permission"] = []
    }
    if (!manifest.manifest["uses-feature"]) {
      manifest.manifest["uses-feature"] = []
    }

    manifest.manifest["uses-permission"].push({
      $: {
        "android:name": "android.permission.USB_PERMISSION",
      },
    })

    manifest.manifest["uses-feature"].push({
      $: {
        "android:name": "android.hardware.usb.host",
      },
    })

    return config
  })
}

