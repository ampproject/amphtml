'use strict';

/**
 * Gets the config for babel transforms run during `amp lint`.
 *
 * @return {!Object}
 */
function getEslintConfig() {
  const presetEnv = [
    '@babel/preset-env',
    {
      shippedProposals: true,
      modules: false,
      targets: {esmodules: true},
    },
  ];

  return {
    compact: false,
    presets: [presetEnv],
    plugins: [enableSyntax],
  };
}

/**
 * @return {{manipulateOptions(_opts: *, parserOpts: *): void}}
 */
function enableSyntax() {
  return {
    manipulateOptions(_opts, parserOpts) {
      parserOpts.plugins.push('jsx', 'importAssertions');
    },
  };
}

module.exports = {
  getEslintConfig,
};
