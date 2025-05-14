const { getDefaultConfig } = require("expo/metro-config")
const { withNativeWind } = require("nativewind/metro")
const { FileStore } = require("metro-cache")
const path = require("path")
const { getSentryExpoConfig } = require("@sentry/react-native/metro")

// Find the project and workspace directories
const projectRoot = __dirname
// This can be replaced with `find-yarn-workspace-root`
const monorepoRoot = path.resolve(projectRoot, "../..")
// const config = getDefaultConfig(projectRoot, { isCSSEnabled: true })
const config = getSentryExpoConfig(projectRoot, {isCSSEnabled: true} )


// 1. Watch all files within the monorepo
config.watchFolders = [monorepoRoot]
config.resolver.disableHierarchicalLookup = false
// 2. Let Metro know where to resolve packages and in what order
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, "node_modules"),
  path.resolve(monorepoRoot, "node_modules"),
]

// 3. Add extraNodeModules to help Metro resolve the symlinked package
config.resolver.extraNodeModules = {
  '@repo/trpc-client': path.resolve(monorepoRoot, 'packages/trpc-client'),
};

config.resolver.sourceExts.push("mjs")
config.resolver.sourceExts.push("cjs")

config.cacheStores = [
  new FileStore({ root: path.join(projectRoot, "node_modules", ".cache", "metro") }),
]

module.exports = withNativeWind(config, {
  input: "../../packages/ui/src/globals.css",
  configPath: "./tailwind.config.ts",
})
