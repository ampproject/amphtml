const {getStaticDirs} = require('../static-dirs');

const rootDir = '../../../../..';

module.exports = {
  staticDirs: getStaticDirs(rootDir),
  stories: [
    `${rootDir}/src/**/storybook/!(*.amp).js`,
    `${rootDir}/extensions/**/*.*/storybook/!(*.amp).js`,
  ],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-viewport/register',
    '@storybook/addon-controls/register',
  ],
  webpackFinal: async (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
