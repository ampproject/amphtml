'use strict';

const argv = require('minimist')(process.argv.slice(2));
const experimentsConfig = require('../global-configs/experiments-config.json');
const experimentsConstantBackup = require('../global-configs/experiments-const.json');
const {BUILD_CONSTANTS} = require('../compile/build-constants');

/**
 * Get experiment constant to define from command line arguments, if any
 *
 * @return {string|undefined}
 */
function getExperimentConstant() {
  const flag = argv['define_experiment_constant'];
  // add define flags from arguments
  if (Array.isArray(flag)) {
    if (flag.length > 1) {
      throw new Error('Only one define_experiment_constant flag is allowed');
    }
    return flag[0];
  }
  if (flag) {
    return flag;
  }
}

/**
 * Computes options for minify-replace and returns the plugin object.
 *
 * @param {!Object=} opt_overrides overrides for BUILD_CONSTANTS
 * @return {Array<string|Object>}
 */
function getReplacePlugin(opt_overrides) {
  /**
   * @param {string} identifierName the identifier name to replace
   * @param {boolean|string} value the value to replace with
   * @return {!Object} replacement options used by minify-replace plugin
   */
  function createReplacement(identifierName, value) {
    const replacement =
      typeof value === 'boolean'
        ? {type: 'booleanLiteral', value}
        : {type: 'stringLiteral', value};
    return {identifierName, replacement};
  }

  const constants = Object.assign({}, BUILD_CONSTANTS, opt_overrides);
  const replacements = Object.entries(constants).map(([ident, val]) =>
    createReplacement(ident, val)
  );

  const experimentConstant = getExperimentConstant();
  if (experimentConstant) {
    replacements.push(createReplacement(experimentConstant, true));
  }

  // default each experiment flag constant to false
  Object.keys(experimentsConfig).forEach((experiment) => {
    const experimentDefine =
      experimentsConfig[experiment]['define_experiment_constant'];
    const flagExists = (element) =>
      element['identifierName'] === experimentDefine;
    // only add default replacement if it already doesn't exist in array
    if (experimentDefine && !replacements.some(flagExists)) {
      replacements.push(createReplacement(experimentDefine, false));
    }
  });

  // default each backup experiment constant to the customized value
  const experimentsConstantBackupEntries = Object.entries(
    experimentsConstantBackup
  );
  for (const [experimentDefine, value] of experimentsConstantBackupEntries) {
    const flagExists = (element) =>
      element['identifierName'] === experimentDefine;
    // only add default replacement if it already doesn't exist in array
    if (experimentDefine && !replacements.some(flagExists)) {
      replacements.push(createReplacement(experimentDefine, !!value));
    }
  }

  return ['minify-replace', {replacements}];
}

/**
 * Returns a Babel plugin that replaces the global identifier with the correct
 * alternative. Used before transforming test code with esbuild.
 *
 * @return {Array<string|Object>}
 */
function getReplaceGlobalsPlugin() {
  return [
    (babel) => {
      const {types: t} = babel;
      return {
        visitor: {
          ReferencedIdentifier(path) {
            const {node, scope} = path;
            if (node.name !== 'global') {
              return;
            }
            if (scope.getBinding('global')) {
              return;
            }
            const possibleNames = ['globalThis', 'self'];
            const name = possibleNames.find((name) => !scope.getBinding(name));
            if (!name) {
              throw path.buildCodeFrameError(
                'Could not replace `global` with globalThis identifier'
              );
            }
            path.replaceWith(t.identifier(name));
          },
        },
      };
    },
  ];
}

module.exports = {
  getExperimentConstant,
  getReplacePlugin,
  getReplaceGlobalsPlugin,
};
