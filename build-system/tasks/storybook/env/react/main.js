const {webpackConfigNoChunkTilde} = require('../../../storybook/env-utils');

const rootDir = '../../../../..';

module.exports = {
  staticDirs: [rootDir],
  // Unlike the `amp` and `preact` environments, we search Storybook files only
  // under extensions/. This is because only extensions have React build output.
  stories: [`${rootDir}/extensions/**/*.*/storybook/!(*.amp).js`],
  addons: ['@storybook/addon-knobs'],
  managerWebpack: webpackConfigNoChunkTilde,
  webpackFinal: (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
