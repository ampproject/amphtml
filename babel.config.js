/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS-IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Global configuration file for the babelify transform.
 *
 * Notes: From https://babeljs.io/docs/en/plugins#plugin-ordering:
 * 1. Plugins run before Presets.
 * 2. Plugin ordering is first to last.
 * 3. Preset ordering is reversed (last to first).
 */

'use strict';

const argv = require('minimist')(process.argv.slice(2));
const experimentsConfig = require('./build-system/global-configs/experiments-config.json');
const experimentsConstantBackup = require('./build-system/global-configs/experiments-const.json');
const {isTravisBuild} = require('./build-system/common/travis');

const jsxOpts = {
  pragma: 'Preact.createElement',
  pragmaFrag: 'Preact.Fragment',
  useSpread: true,
};

const localPlugin = name =>
  require.resolve(`./build-system/babel-plugins/babel-plugin-${name}`);

const defaultPlugins = isEsmBuild => [
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

const esmRemovedImports = {
  './polyfills/document-contains': ['installDocContains'],
  './polyfills/domtokenlist': ['installDOMTokenList'],
  './polyfills/fetch': ['installFetch'],
  './polyfills/math-sign': ['installMathSign'],
  './polyfills/object-assign': ['installObjectAssign'],
  './polyfills/object-values': ['installObjectValues'],
  './polyfills/promise': ['installPromise'],
  './polyfills/array-includes': ['installArrayIncludes'],
};

// Removable imports that are not needed for valid transformed documents.
const validTransformedRemovableImports = {
  './build-system/build/ampshared.css': ['cssText', 'ampSharedCss'],
  './build-system/build/ampdoc.css': ['cssText', 'ampDocCss'],
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
  Object.keys(experimentsConfig).forEach(experiment => {
    const experimentDefine =
      experimentsConfig[experiment]['defineExperimentConstant'];

    // eslint-disable-next-line require-jsdoc
    function flagExists(element) {
      return element['identifierName'] === experimentDefine;
    }

    // only add default replacement if it already doesn't exist in array
    if (experimentDefine && !replacements.some(flagExists)) {
      replacements.push(createReplacement(experimentDefine, false));
    }
  });

  // default each backup experiment constant to the customized value
  // eslint-disable-next-line local/no-for-of-statement, local/no-array-destructuring
  for (const [experimentDefine, value] of Object.entries(
    experimentsConstantBackup
  )) {
    // eslint-disable-next-line require-jsdoc
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

const getJsonConfigurationPlugin = () =>
  localPlugin('transform-json-configuration');

/**
 * Resolves babel plugin set to apply before compiling on singlepass.
 * @param {!Object<string, boolean>} buildFlags
 * @return {!Array<string|!Array<string|!Object>>}
 */
function plugins(buildFlags) {
  const {isEsmBuild, isForTesting, isSinglePass, isChecktypes} = buildFlags;
  // eslint-disable-next-line local/no-spread
  const applied = [...defaultPlugins(isEsmBuild || false)];
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
    applied.push([
      'filter-imports',
      {
        imports: {
          ...esmRemovedImports,
          ...validTransformedRemovableImports,
        },
      },
    ]);
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
      localPlugin('amp-mode-transformer'),
      localPlugin('is_dev-constant-transformer')
    );
  }
  return applied;
}

// eslint-disable-next-line local/no-module-exports
module.exports = function(api) {
  const isClosureCompiler =
    argv._.includes('dist') || argv._.includes('check-types');
  const {esm} = argv;
  const noModuleTarget = {
    'browsers': isTravisBuild()
      ? ['Last 2 versions', 'safari >= 9']
      : ['Last 2 versions'],
  };

  const plugins = [
    './build-system/babel-plugins/babel-plugin-transform-fix-leading-comments',
    '@babel/plugin-transform-react-constant-elements',
    [
      '@babel/plugin-transform-react-jsx',
      {
        pragma: 'Preact.createElement',
        pragmaFrag: 'Preact.Fragment',
        useSpread: true,
      },
    ],
  ];

  const esmPresets = [
    'babel-preset-modules',
    {
      'loose': true,
    },
  ];
  const presets = [
    '@babel/preset-env',
    {
      'modules': isClosureCompiler ? false : 'commonjs',
      'loose': true,
      'targets': noModuleTarget,
    },
  ];

  api.cache(true);
  // Closure Compiler builds do not use any of the default settings below until
  // its an esm build. (Both Multipass and Singlepass)
  if (isClosureCompiler && !esm) {
    return {};
  }
  return {
    'plugins': plugins,
    'presets': [esm ? esmPresets : presets],
    'compact': false,
    'sourceType': 'module',
  };
};

// eslint-disable-next-line local/no-module-exports
Object.assign(module.exports, {
  plugins,
  eliminateIntermediateBundles,
  getReplacePlugin,
  getJsonConfigurationPlugin,
});
