const {getStaticDirs} = require('../static-dirs');

const rootDir = '../../../../..';

module.exports = {
  staticDirs: getStaticDirs(rootDir),
  // Unlike the `amp` and `preact` environments, we search Storybook files only
  // under component paths. This is because only components have React build
  // output, but directories in src/ outside src/bento/components/ do not.
  stories: [`${rootDir}/extensions/**/*.*/storybook/!(*.amp).js`],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-viewport/register',
    '@storybook/addon-controls/register',
  ],
  webpackFinal: (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
