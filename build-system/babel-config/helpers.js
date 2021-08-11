/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
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
 * @return {Array<string|Object>}
 */
function getReplacePlugin() {
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

  const replacements = Object.entries(BUILD_CONSTANTS).map(([ident, val]) =>
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
            // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/globalThis#browser_compatibility
            if (argv.ie) {
              possibleNames.shift();
            }
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
