const {webpackConfigNoChunkTilde} = require('../env-utils');

module.exports = {
  stories: [
    '../../../../src/**/storybook/!(*.amp).js',
    '../../../../extensions/**/*.*/storybook/!(*.amp).js',
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-viewport/register',
    '@storybook/addon-controls/register',
    // TODO(#35923): Remove addon-knobs once all stories are migrated to
    // addon-controls (args/argTypes).
    '@storybook/addon-knobs/register',
  ],
  managerWebpack: (config) => {
    return webpackConfigNoChunkTilde(config);
  },
  webpackFinal: async (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
