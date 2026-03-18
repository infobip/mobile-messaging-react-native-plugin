//
//  metro.config.js
//  MobileMessagingReactNative
//
//  Copyright (c) 2016-2025 Infobip Limited
//  Licensed under the Apache License, Version 2.0
//

const path = require('path');
const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config');

const pluginRoot = path.resolve(__dirname, '..');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [pluginRoot],
  resolver: {
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(pluginRoot, 'node_modules'),
    ],
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
