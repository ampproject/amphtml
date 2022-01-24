const rootDir = '../../../../..';

module.exports = {
  staticDirs: [rootDir],
  // Unlike the `amp` and `preact` environments, we search Storybook files only
  // under extensions/. This is because only extensions have React build output.
  stories: [`${rootDir}/extensions/**/*.*/storybook/!(*.amp).js`],
  addons: [
    '@storybook/addon-a11y',
    '@storybook/addon-viewport/register',
    '@storybook/addon-controls/register',
    // TODO(#35923): Remove addon-knobs once all stories are migrated to
    // addon-controls (args/argTypes).
    '@storybook/addon-knobs',
  ],
  webpackFinal: (config) => {
    // Disable entry point size warnings.
    config.performance.hints = false;
    return config;
  },
};
