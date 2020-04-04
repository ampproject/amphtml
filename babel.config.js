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
const fs = require('fs');

/**
 * Default options for transform-react-jsx. Used by pre-closure and dep-check.
 */
const defaultJsxOpts = {
  pragma: 'Preact.createElement',
  pragmaFrag: 'Preact.Fragment',
  useSpread: true,
};

/**
 * Default preset-env plugin. Used by dep-check and tests.
 */
const defaultPresetEnvPlugin = [
  '@babel/preset-env',
  {
    bugfixes: true,
    modules: 'commonjs',
    loose: true,
    targets: {'browsers': ['Last 2 versions']},
  },
];

/**
 * Default filter-imports plugin. Used by pre-closure.
 */
const defaultFilterImportsPlugin = [
  'filter-imports',
  {
    imports: {
      './polyfills/document-contains': ['installDocContains'],
      './polyfills/domtokenlist': ['installDOMTokenList'],
      './polyfills/fetch': ['installFetch'],
      './polyfills/math-sign': ['installMathSign'],
      './polyfills/object-assign': ['installObjectAssign'],
      './polyfills/object-values': ['installObjectValues'],
      './polyfills/promise': ['installPromise'],
      './polyfills/array-includes': ['installArrayIncludes'],
      '../third_party/css-escape/css-escape': ['cssEscape'],
      '../build/ampshared.css': ['cssText', 'ampSharedCss'],
      '../build/ampdoc.css': ['cssText', 'ampDocCss'],
    },
  },
];

/**
 * Default istanbul plugin. Used by tests.
 */
const defaultInstanbulPlugin = [
  'istanbul',
  {
    exclude: [
      'ads/**/*.js',
      'build-system/**/*.js',
      'extensions/**/test/**/*.js',
      'third_party/**/*.js',
      'test/**/*.js',
      'testing/**/*.js',
    ],
  },
];

/**
 * Gets relative paths to all the devDependencies defined in package.json.
 *
 * @return {!Array<string>}
 */
function devDependencies() {
  const file = fs.readFileSync('package.json', 'utf8');
  const packageJson = JSON.parse(file);
  const devDependencies = Object.keys(packageJson['devDependencies']);
  return devDependencies.map((p) => `./node_modules/${p}`);
}

/**
 * Ignore devDependencies except for 'chai-as-promised' which contains ES6 code.
 * ES6 code is fine for most test environments, but not for integration tests
 * running on SauceLabs since some older browsers need ES5.
 */
const ignoredGlobalModules = devDependencies().filter(
  (dep) => dep.indexOf('chai-as-promised') === -1
);

/**
 * Resolves the full path of a local plugin with the given name.
 *
 * @param {string} name
 * @return {string}
 */
function localPlugin(name) {
  return require.resolve(`./build-system/babel-plugins/babel-plugin-${name}`);
}

/**
 * Resolves the full path of a babel monorepo plugin with the given name.
 *
 * @param {string} name
 * @return {string}
 */
function babelPlugin(name) {
  return `@babel/plugin-${name}`;
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

  const replacements = [createReplacement('IS_ESM', argv.esm)];
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
 * The fully configured minify-replace plugin.
 */
const replacePlugin = getReplacePlugin();

/**
 * Gets the config for babel transforms run during `gulp dep-check`.
 *
 * @return {!Object}
 */
function getDepCheckConfig() {
  const depCheckPlugins = [
    localPlugin('transform-fix-leading-comments'),
    babelPlugin('transform-react-constant-elements'),
    [babelPlugin('transform-classes'), {loose: false}],
    [babelPlugin('transform-react-jsx'), defaultJsxOpts],
  ];
  const depCheckPresets = [defaultPresetEnvPlugin];
  return {
    compact: false,
    ignore: ignoredGlobalModules,
    plugins: depCheckPlugins,
    presets: depCheckPresets,
    sourceType: 'module',
  };
}

/**
 * Gets the config for babel transforms run during `gulp build`.
 *
 * @return {!Object}
 */
function getUnminifiedConfig() {
  const unminifiedPlugins = [
    replacePlugin,
    localPlugin('transform-json-configuration'),
    localPlugin('transform-fix-leading-comments'),
    babelPlugin('transform-react-constant-elements'),
    [babelPlugin('transform-classes'), {loose: false}],
    [babelPlugin('transform-react-jsx'), defaultJsxOpts],
  ];
  const unminifiedPresets = [defaultPresetEnvPlugin];
  return {
    compact: false,
    ignore: ignoredGlobalModules,
    plugins: unminifiedPlugins,
    presets: unminifiedPresets,
    sourceType: 'module',
  };
}

/**
 * Gets the config for pre-closure babel transforms run during `gulp dist`.
 *
 * @return {!Object}
 */
function getPreClosureConfig() {
  const preClosurePlugins = [
    localPlugin('transform-fix-leading-comments'),
    babelPlugin('transform-react-constant-elements'),
    [babelPlugin('transform-react-jsx'), defaultJsxOpts],
    localPlugin('transform-inline-configure-component'),
    // TODO(alanorozco): Remove `replaceCallArguments` once serving infra is up.
    [localPlugin('transform-log-methods'), {replaceCallArguments: false}],
    localPlugin('transform-parenthesize-expression'),
    localPlugin('is_minified-constant-transformer'),
    localPlugin('transform-amp-extension-call'),
    localPlugin('transform-html-template'),
    localPlugin('transform-version-call'),
    localPlugin('transform-simple-array-destructure'),
    replacePlugin,
  ];
  if (argv.single_pass) {
    preClosurePlugins.push(localPlugin('transform-amp-asserts'));
  }
  if (argv.esm) {
    preClosurePlugins.push(
      defaultFilterImportsPlugin,
      localPlugin('transform-function-declarations')
    );
  }
  const isCheckTypes = argv._.includes('check-types');
  if (isCheckTypes) {
    preClosurePlugins.push(localPlugin('transform-simple-object-destructure'));
  } else {
    preClosurePlugins.push(localPlugin('transform-json-configuration'));
  }
  if (!argv.fortesting && !isCheckTypes) {
    preClosurePlugins.push(
      [localPlugin('amp-mode-transformer'), {isEsmBuild: argv.esm}],
      localPlugin('is_dev-constant-transformer')
    );
  }
  const babelPresetEnvOptions = argv.esm
    ? {bugfixes: true, modules: false, targets: {esmodules: true}}
    : {
        bugfixes: true,
        loose: true,
        modules: false,
        targets: {'browsers': ['Last 2 versions']},
      };
  const preClosurePresets = [['@babel/preset-env', babelPresetEnvOptions]];
  const preClosureConfig = {
    compact: false,
    plugins: preClosurePlugins,
    presets: preClosurePresets,
    retainLines: true,
  };
  if (argv.esm) {
    preClosureConfig.sourceType = 'module';
  }
  return preClosureConfig;
}

/**
 * Gets the config for post-closure babel transforms run during `gulp dist`.
 *
 * @return {!Object}
 */
function getPostClosureConfig() {
  const postClosurePlugins = argv.esm
    ? [
        localPlugin('transform-minified-comments'),
        localPlugin('transform-remove-directives'),
        localPlugin('transform-function-declarations'),
        localPlugin('transform-stringish-literals'),
      ]
    : [];
  return {
    inputSourceMap: false,
    plugins: postClosurePlugins,
    retainLines: false,
    sourceMaps: true,
    sourceType: 'module',
  };
}

/**
 * Gets the config for babel transforms run during `gulp dist --single_pass`.
 *
 * @return {!Object}
 */
function getSinglePassConfig() {
  const singlePassPlugins = [localPlugin('transform-prune-namespace')];
  return {
    compact: false,
    inputSourceMap: false,
    plugins: singlePassPlugins,
    sourceMaps: true,
  };
}

/**
 * Gets the config for babel transforms run during `gulp [unit|integration]`.
 *
 * @return {!Object}
 */
function getTestConfig() {
  const testPresets = [defaultPresetEnvPlugin];
  const testPlugins = [
    replacePlugin,
    localPlugin('transform-json-configuration'),
    localPlugin('transform-fix-leading-comments'),
    babelPlugin('transform-react-constant-elements'),
    [babelPlugin('transform-classes'), {loose: false}],
    [babelPlugin('transform-react-jsx'), defaultJsxOpts],
  ];
  if (argv.converage) {
    testPlugins.unshift(defaultInstanbulPlugin);
  }
  return {
    compact: false,
    ignore: ignoredGlobalModules,
    plugins: testPlugins,
    presets: testPresets,
    sourceType: 'module',
  };
}

/**
 * Main entry point. Returns different babel configs based on the caller.
 *
 * @param {!Object} api
 * @return {!Object}
 */
module.exports = function (api) {
  /**
   * Identifies the caller of a babel transform.
   *
   * @param {string} name
   * @return {boolean}
   */
  function calledBy(name) {
    return api.caller((caller) => !!(caller && caller.name === name));
  }

  /**
   * Throws an error when an unrecognized mode is encountered.
   */
  function throwError() {
    const err = new Error('Unrecognized Babel mode.');
    err.showStack = false;
    throw err;
  }

  if (calledBy('dep-check')) {
    return getDepCheckConfig();
  }
  if (calledBy('unminified')) {
    return getUnminifiedConfig();
  }
  if (calledBy('pre-closure')) {
    return getPreClosureConfig();
  }
  if (calledBy('post-closure')) {
    return getPostClosureConfig();
  }
  if (calledBy('single-pass')) {
    return getSinglePassConfig();
  }
  if (calledBy('test')) {
    return getTestConfig();
  }
  throwError();
};
