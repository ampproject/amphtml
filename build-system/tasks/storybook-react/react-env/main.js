const {webpackConfigNoChunkTilde} = require('../../storybook/env-utils');

module.exports = {
  stories: ['../../../../extensions/**/*.*/storybook/Basic!(*.amp).js'],
  addons: ['@storybook/addon-knobs'],
  managerWebpack: webpackConfigNoChunkTilde,
  webpackFinal: (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
