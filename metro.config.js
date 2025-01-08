const { getDefaultConfig } = require("@expo/metro-config");

const defaultConfig = getDefaultConfig(__dirname);

module.exports = {
  ...defaultConfig,
  resolver: {
    ...defaultConfig.resolver,
    sourceExts: [...defaultConfig.resolver.sourceExts],
    assetExts: [...defaultConfig.resolver.assetExts],
  },
  transformer: {
    ...defaultConfig.transformer,
    assetPlugins: ["expo-asset/tools/hashAssetFiles"],
  },
};
