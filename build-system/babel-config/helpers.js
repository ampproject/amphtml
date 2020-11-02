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
 * Computes options for the minify-replace plugin
 *
 * @return {Array<string|Object>}
 */
function getReplacePlugin() {
  /**
   * @param {string} identifierName the identifier name to replace
   * @param {boolean} value the value to replace with
   * @return {!Object} replacement options used by minify-replace plugin
   */
  function createReplacement(identifierName, value) {
    return {
      identifierName,
      replacement: {type: 'booleanLiteral', value: !!value},
    };
  }

  // We build on the idea that SxG is an upgrade to the ESM build.
  // Therefore, all conditions set by ESM will also hold for SxG.
  // However, we will also need to introduce a separate IS_SxG flag
  // for conditions only true for SxG.
  const replacements = [
    createReplacement('IS_ESM', argv.esm || argv.sxg),
    createReplacement('IS_SXG', argv.sxg),
  ];

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

module.exports = {
  getExperimentConstant,
  getReplacePlugin,
};
