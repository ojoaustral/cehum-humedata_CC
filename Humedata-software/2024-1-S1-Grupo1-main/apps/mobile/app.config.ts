import type { ConfigContext, ExpoConfig } from "expo/config"

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: process.env.APP_NAME || "Humedat@s",
  slug: "humedatos-calibrator",
  scheme: "expo",
  version: "0.1.0",
  orientation: "portrait",
  icon: "./src/assets/images/icon.png",
  userInterfaceStyle: "automatic",
  splash: {
    image: "./src/assets/images/splash.png",
    resizeMode: "contain",
    backgroundColor: "#1F104A",
  },
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ["**/*"],
  ios: {
    bundleIdentifier: "humedatos.calibrator",
    supportsTablet: true,
  },
  android: {
    package: "humedatos.calibrator",
    adaptiveIcon: {
      foregroundImage: "./src/assets/images/adaptive-icon.png",
      backgroundColor: "#1F104A",
    },
  },
  experiments: {
    tsconfigPaths: true,
    typedRoutes: true,
  },
  plugins: [
    "expo-router", "react-native-ble-plx", "./plugins/withUsbHostPermission.ts",
    [
      "@sentry/react-native/expo",
      {
        "organization": process.env.SENTRY_ORG,
        "project": process.env.SENTRY_PROJECT
      }
    ]
  ],
  extra: {
    clerkPublishableKey: process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY,
    eas: {
      projectId: "3b255969-4068-4101-b95c-94dbb29934ca",
    }
  }
})
