'use strict';

const argv = require('minimist')(process.argv.slice(2));

/**
 * Gets the config that transforms any syntax output by esbuild into the
 * appropriate target syntax.
 *
 * @return {!Object}
 */
function getPostEsbuildCompileConfig() {
  const presetEnv = [
    '@babel/preset-env',
    {
      bugfixes: true,
      modules: false,
      targets: argv.esm || argv.sxg ? {esmodules: true} : {ie: 11, chrome: 41},
    },
  ];

  return {
    compact: false,
    presets: [presetEnv],
    inputSourceMap: false,
    sourceMaps: true,
  };
}

module.exports = {
  getPostEsbuildCompileConfig,
};
