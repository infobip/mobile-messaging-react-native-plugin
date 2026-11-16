// Copyright (c) 2016-2026 Infobip Limited
// Licensed under the Apache License, Version 2.0

module.exports = {
  testEnvironment: 'node',
  testMatch: ['<rootDir>/__tests__/**/*.test.js'],
  transform: {
    '^.+\\.[jt]sx?$': [
      'babel-jest',
      {configFile: require.resolve('./babel.config.js')},
    ],
  },
};
