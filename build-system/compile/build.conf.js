/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
const argv = require('minimist')(process.argv.slice(2));
const experimentsConfig = require('../global-configs/experiments-config.json');
const experimentsConstantBackup = require('../global-configs/experiments-const.json');
const localPlugin = (name) =>
  require.resolve(`../babel-plugins/babel-plugin-${name}`);

const jsxOpts = {
  pragma: 'Preact.createElement',
  pragmaFrag: 'Preact.Fragment',
  useSpread: true,
};

const defaultPlugins = (isEsmBuild) => [
  localPlugin('transform-fix-leading-comments'),
  '@babel/plugin-transform-react-constant-elements',
  ['@babel/plugin-transform-react-jsx', jsxOpts],
  localPlugin('transform-inline-configure-component'),
  // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
  [localPlugin('transform-log-methods'), {replaceCallArguments: false}],
  localPlugin('transform-parenthesize-expression'),
  localPlugin('is_minified-constant-transformer'),
  localPlugin('transform-amp-extension-call'),
  localPlugin('transform-html-template'),
  localPlugin('transform-version-call'),
  localPlugin('transform-simple-array-destructure'),
  getReplacePlugin(isEsmBuild),
];

const postCompilationPlugins = (isEsmBuild) =>
  isEsmBuild
    ? [
        localPlugin('transform-minified-comments'),
<<<<<<< HEAD
        localPlugin('const-transformer'),
=======
<<<<<<< HEAD
=======
        localPlugin('const-transformer'),
>>>>>>> parent of f801a93c2... 🏗♻️ Consolidate all `babel` configs into `babel.config.js` (#27576)
>>>>>>> Revert "🏗♻️ Consolidate all `babel` configs into `babel.config.js` (#27576)"
        localPlugin('transform-remove-directives'),
        localPlugin('transform-function-declarations'),
        localPlugin('transform-stringish-literals'),
      ]
    : [];

const esmRemovedImports = {
  './polyfills/document-contains': ['installDocContains'],
  './polyfills/domtokenlist': ['installDOMTokenList'],
  './polyfills/fetch': ['installFetch'],
  './polyfills/math-sign': ['installMathSign'],
  './polyfills/object-assign': ['installObjectAssign'],
  './polyfills/object-values': ['installObjectValues'],
  './polyfills/promise': ['installPromise'],
  './polyfills/array-includes': ['installArrayIncludes'],
<<<<<<< HEAD
  './ie-media-bug': ['ieMediaCheckAndFix'],
=======
<<<<<<< HEAD
=======
  './ie-media-bug': ['ieMediaCheckAndFix'],
>>>>>>> parent of f801a93c2... 🏗♻️ Consolidate all `babel` configs into `babel.config.js` (#27576)
>>>>>>> Revert "🏗♻️ Consolidate all `babel` configs into `babel.config.js` (#27576)"
  '../third_party/css-escape/css-escape': ['cssEscape'],
};

// Removable imports that are not needed for valid transformed documents.
const validTransformedRemovableImports = {
  '../build/ampshared.css': ['cssText', 'ampSharedCss'],
  '../build/ampdoc.css': ['cssText', 'ampDocCss'],
};

/**
 * @param {boolean} isEsmBuild a boolean indicating if this build is for ESM output.
 * @return {Array<string|Object>} the minify-replace plugin options that can be
 * pushed into the babel plugins array
 */
function getReplacePlugin(isEsmBuild) {
  /**
   * @param {string} identifierName the identifier name to replace
   * @param {boolean} value the value to replace with
   * @return {!Object} replacement options used by minify-replace plugin
   */
  function createReplacement(identifierName, value) {
    return {
      identifierName,
      replacement: {
        type: 'booleanLiteral',
        value,
      },
    };
  }

  const replacements = [createReplacement('IS_ESM', isEsmBuild)];
  const defineFlag = argv.defineExperimentConstant;

  // add define flags from arguments
  if (Array.isArray(defineFlag)) {
    if (defineFlag.length > 1) {
      throw new Error('Only one defineExperimentConstant flag is allowed');
    } else {
      replacements.push(createReplacement(defineFlag[0], true));
    }
  } else if (defineFlag) {
    replacements.push(createReplacement(defineFlag, true));
  }

  // default each experiment flag constant to false
  Object.keys(experimentsConfig).forEach((experiment) => {
    const experimentDefine =
      experimentsConfig[experiment]['defineExperimentConstant'];

    function flagExists(element) {
      return element['identifierName'] === experimentDefine;
    }

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
    function flagExists(element) {
      return element['identifierName'] === experimentDefine;
    }

    // only add default replacement if it already doesn't exist in array
    if (experimentDefine && !replacements.some(flagExists)) {
      replacements.push(createReplacement(experimentDefine, !!value));
    }
  }

  return ['minify-replace', {replacements}];
}

const eliminateIntermediateBundles = () => [
  localPlugin('transform-prune-namespace'),
];

function getJsonConfigurationPlugin() {
  return localPlugin('transform-json-configuration');
}

/**
 * Resolves babel plugin set to apply before compiling on singlepass.
 * @param {!Object<string, boolean>} buildFlags
 * @return {!Array<string|!Array<string|!Object>>}
 */
function plugins({
  isEsmBuild,
  isForTesting,
  isSinglePass,
  isChecktypes,
  isPostCompile,
}) {
  if (isPostCompile) {
    return postCompilationPlugins(isEsmBuild);
  }

  const applied = [...defaultPlugins(isEsmBuild)];
  // TODO(erwinm): This is temporary until we remove the assert/log removals
  // from the java transformation to the babel transformation.
  // There is currently a weird interaction where when we do the transform
  // in babel and leave a bare "string", Closure Compiler does not remove
  // the dead string expression statements. We cannot just outright remove
  // the argument of the assert/log calls since we would need to inspect
  // if the arguments have any method calls (which might have side effects).
  if (isSinglePass) {
    applied.push(localPlugin('transform-amp-asserts'));
  }
  if (isEsmBuild) {
    applied.push(
      [
        'filter-imports',
        {
          imports: {
            ...esmRemovedImports,
            ...(isForTesting ? {} : validTransformedRemovableImports),
          },
        },
      ],
      localPlugin('transform-function-declarations')
    );
  }
  if (isChecktypes) {
    applied.push(localPlugin('transform-simple-object-destructure'));
  } else {
    // This triggers some conformance errors such as `use tryParseJson` during
    // type check phase so we omit it from the default plugins.
    applied.push(getJsonConfigurationPlugin());
  }
  if (!(isForTesting || isChecktypes)) {
    applied.push(
      [localPlugin('amp-mode-transformer'), {isEsmBuild}],
      localPlugin('is_dev-constant-transformer')
    );
  }

  return applied;
}

module.exports = {
  plugins,
  eliminateIntermediateBundles,
  getReplacePlugin,
  getJsonConfigurationPlugin,
};
