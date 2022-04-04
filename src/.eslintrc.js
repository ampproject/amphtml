const {isCiBuild} = require('../build-system/common/ci');

module.exports = {
  'rules': {
    'local/no-global': 2,

    // These rules should apply to all AMP code. For now, they apply only to src
    'import/newline-after-import': 2,
    'import/no-dynamic-require': 2,
    'import/no-unused-modules': 2,
    'import/no-commonjs': 2,
    'import/no-amd': 2,
    'import/no-nodejs-modules': 2,
    'import/no-import-module-exports': 2,

    'import/no-restricted-paths': [
      'error',
      {
        'zones': [
          {
            // Disallow importing AMP dependencies into core
            'target': 'src/core',
            'from': 'src',
            'except': ['./core'],
          },
          {
            // Disallow importing AMP dependencies into preact/Bento
            'target': 'src/preact',
            'from': 'src',
            'except': ['./core', './preact'],
          },
          {
            // Disallow importing non-core dependencies into polyfills
            'target': 'src/polyfills',
            'from': 'src',
            'except': ['./core', './polyfills'],
          },
        ],
      },
    ],
  },
  // Exclusions where imports are necessary or have not yet been migrated;
  // Do not add to this list
  'overrides': [
    {
      'files': [
        './polyfills/fetch.js',
        // TEMPORARY, follow tracking issue #33631
        './preact/component/3p-frame.js',
      ],
      'rules': {'import/no-restricted-paths': isCiBuild() ? 0 : 1},
    },
    {
      'files': [
        './polyfills/custom-elements.extern.js',
        './experiments/shame.extern.js',
        './bento/components/**/*.js',
      ],
      'rules': {'local/no-global': 0},
    },
    {
      'files': ['./base-element.js'],
      'rules': {
        'local/no-private-props': 2,
      },
    },
    {
      'files': ['**/storybook/*.js', '**/rollup.config.js'],
      'rules': {'import/no-nodejs-modules': 0},
    },
  ],
};
