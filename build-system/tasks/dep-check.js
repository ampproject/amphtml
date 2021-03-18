/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

const depCheckConfig = require('../test-configs/dep-check-config');
const esbuild = require('esbuild');
const fs = require('fs-extra');
const minimatch = require('minimatch');
const path = require('path');
const {
  createCtrlcHandler,
  exitCtrlcHandler,
} = require('../common/ctrlcHandler');
const {compileJison} = require('./compile-jison');
const {css} = require('./css');
const {cyan, green, red, yellow} = require('kleur/colors');
const {getEsbuildBabelPlugin} = require('../common/esbuild-babel');
const {log, logLocalDev} = require('../common/logging');

const depCheckDir = '.amp-dep-check';

/**
 * @typedef {{
 *   name: string,
 *   deps: ?Array<!Object<string, !ModuleDef>>
 * }}
 */
let ModuleDef;

/**
 * @typedef {string}
 */
let GlobDef;

/**
 * @typedef {!Array<!GlobDef>}
 */
let GlobsDef;

/**
 * - type - Is assumed to be "forbidden" if not provided.
 * - filesMatching - Is assumed to be all files if not provided.
 * - mustNotDependOn - If type is "forbidden" (default) then the files
 *     matched must not match the glob(s) provided.
 * - allowlist - Skip rule if this particular dependency is found.
 *     Syntax: fileAGlob->fileB where -> reads "depends on"
 * @typedef {{
 *  type?: (string|undefined),
 *  filesMatching?: (string|!Array<string>|undefined),
 *  mustNotDependOn?: (string|!Array<string>|undefined),
 *  allowlist?: (string|!Array<string>|undefined),
 * }}
 */
let RuleConfigDef;

/**
 * @constructor @final @struct
 * @param {!RuleConfigDef} config
 */
function Rule(config) {
  /** @private @const {!RuleConfigDef} */
  this.config_ = config;

  /** @private @const {string} */
  this.type_ = config.type || 'forbidden';

  /**
   * Default to all files if none given.
   * @private @const {!GlobsDef}
   */
  this.filesMatching_ = toArrayOrDefault(config.filesMatching, ['**/*.js']);

  /** @private @const {!GlobsDef} */
  this.mustNotDependOn_ = toArrayOrDefault(config.mustNotDependOn, []);

  /** @private @const {!Array<string>} */
  this.allowlist_ = toArrayOrDefault(config.allowlist, []);

  /** @const {!Set<string>} */
  this.unusedAllowlistEntries = new Set(this.allowlist_);
}

/**
 * @param {string} moduleName
 * @param {!Array<string>} deps
 * @return {!Array<string>}
 */
Rule.prototype.run = function (moduleName, deps) {
  // If forbidden rule and current module has no dependencies at all
  // then no need to match.
  if (this.type_ == 'forbidden' && !deps.length) {
    return [];
  }

  return this.matchBadDeps(moduleName, deps);
};

/**
 * @param {string} moduleName
 * @param {!Array<string>} deps
 * @return {!Array<string>}
 */
Rule.prototype.matchBadDeps = function (moduleName, deps) {
  if (this.type_ != 'forbidden') {
    return [];
  }

  const isFilenameMatch = this.filesMatching_.some((x) =>
    minimatch(moduleName, x)
  );
  if (!isFilenameMatch) {
    return [];
  }

  const mustNotDependErrors = [];
  // These nested loops are ok as we usually only have a few rules
  // to run against.
  deps.forEach((dep) => {
    this.mustNotDependOn_.forEach((badDepPattern) => {
      if (minimatch(dep, badDepPattern)) {
        // Allow extension files to depend on their own code.
        const dir = path.dirname(dep);
        if (dir.startsWith('extensions/')) {
          // eg, 'extensions/amp-geo/0.1'
          const match = /extensions\/[^\/]+\/[^\/]+/.exec(dir);
          if (match && path.dirname(moduleName).startsWith(match[0])) {
            return;
          }
        }

        for (const entry of this.allowlist_) {
          const pair = entry.split('->');
          const allowlistedModuleName = pair[0];
          const allowlistedDep = pair[1];
          if (!minimatch(moduleName, allowlistedModuleName)) {
            continue;
          }

          if (dep == allowlistedDep) {
            this.unusedAllowlistEntries.delete(entry);
            return;
          }
        }
        mustNotDependErrors.push(
          cyan(moduleName) + ' must not depend on ' + cyan(dep)
        );
      }
    });
  });

  return mustNotDependErrors;
};

const rules = depCheckConfig.rules.map((config) => new Rule(config));

/**
 * Returns a single module that contains a list of entry points to these files:
 * - extensions/{$extension}/{$version}/{$extension}.js
 * - src/amp.js
 * - 3p/integration.js
 * @return {Promise<string>}
 */
async function getEntryPointModule() {
  const coreBinaries = ['src/amp.js', '3p/integration.js'];
  const extensions = await fs.promises.readdir('extensions');
  const extensionEntryPoints = extensions
    .map((x) => `extensions/${x}`)
    .filter((x) => fs.statSync(x).isDirectory())
    .map(getEntryPoint);
  const allEntryPoints = flatten(extensionEntryPoints).concat(coreBinaries);
  await fs.ensureDir(depCheckDir);
  const entryPointModule = path.join(depCheckDir, 'entry-point-module.js');
  const entryPointData = allEntryPoints
    .map((file) => `import '../${file}';`)
    .join('\n');
  await fs.promises.writeFile(entryPointModule, entryPointData);
  logLocalDev('Added all entry points to', cyan(entryPointModule));
  return entryPointModule;
}

/**
 * @param {string} entryPointModule
 * @return {!Promise<ModuleDef>}
 */
async function getModuleGraph(entryPointModule) {
  const bundleFile = path.join(depCheckDir, 'entry-point-bundle.js');
  const moduleGraphFile = path.join(depCheckDir, 'module-graph.json');
  const plugin = getEsbuildBabelPlugin('dep-check', /* enableCache */ false);
  await esbuild.build({
    entryPoints: [entryPointModule],
    bundle: true,
    outfile: bundleFile,
    metafile: moduleGraphFile,
    plugins: [plugin],
  });
  logLocalDev('Bundled all entry points into', cyan(bundleFile));

  const moduleGraphJson = await fs.readJson(moduleGraphFile);
  const entryPoints = moduleGraphJson.inputs;
  const moduleGraph = Object.create(null);
  moduleGraph.name = entryPointModule;
  moduleGraph.deps = [];

  for (const entryPoint in entryPoints) {
    moduleGraph.deps.push({
      name: entryPoint,
      deps: entryPoints[entryPoint].imports.map((dep) => dep.path),
    });
  }
  logLocalDev('Extracted module graph from', cyan(moduleGraphFile));
  return moduleGraph;
}

/**
 * @param {string} extensionFolder
 * @return {!Array<!ModuleDef>}
 */
function getEntryPoint(extensionFolder) {
  const extension = path.basename(extensionFolder);
  return fs
    .readdirSync(extensionFolder)
    .map((x) => `${extensionFolder}/${x}`)
    .filter((x) => fs.statSync(x).isDirectory())
    .map((x) => `${x}/${extension}.js`)
    .filter((x) => fs.existsSync(x))
    .filter((x) => fs.statSync(x).isFile());
}

/**
 * Flattens the module dependency graph and makes its entries unique. This
 * serves as the input on which all rules are tested.
 *
 * @param {!ModuleDef} entryPoints
 * @return {!ModuleDef}
 */
function flattenGraph(entryPoints) {
  return flatten(entryPoints.deps).reduce((acc, cur) => {
    const {name} = cur;
    if (!acc[name]) {
      acc[name] = Object.values(cur.deps);
    }
    return acc;
  }, Object.create(null));
}

/**
 * Run Module dependency graph against the rules.
 *
 * @param {!ModuleDef} moduleGraph
 * @return {boolean} true if violations were discovered.
 */
function runRules(moduleGraph) {
  const errors = [];
  Object.entries(moduleGraph).forEach(([moduleName, deps]) => {
    // Run Rules against the modules and flatten for reporting.
    const results = rules.flatMap((rule) => rule.run(moduleName, deps));
    errors.push(...results);
  });

  rules
    .flatMap((r) => Array.from(r.unusedAllowlistEntries))
    .forEach((unusedEntry) => {
      errors.push(cyan(unusedEntry) + ' is an unused allowlist entry');
    });

  errors.forEach((error) => {
    log(red('ERROR:'), error);
  });

  return errors.length > 0;
}

/**
 * @return {Promise<void>}
 */
async function depCheck() {
  const handlerProcess = createCtrlcHandler('dep-check');
  await css();
  await compileJison();
  logLocalDev('Checking dependencies...');
  const entryPointModule = await getEntryPointModule();
  const moduleGraph = await getModuleGraph(entryPointModule);
  const errorsFound = runRules(flattenGraph(moduleGraph));
  if (errorsFound) {
    log(
      yellow('NOTE:'),
      'Invalid dependencies must be removed, while valid ones must be added to',
      cyan('build-system/test-configs/dep-check-config.js')
    );
    throw new Error('Dependency checks failed');
  } else {
    logLocalDev(green('SUCCESS:'), 'Checked all dependencies.');
  }
  exitCtrlcHandler(handlerProcess);
}

/**
 * Put value in Array context.
 *
 * @param {!GlobsDef|string} value
 * @param {!Array<string>} defaultValue
 * @return {!GlobsDef}
 */
function toArrayOrDefault(value, defaultValue) {
  if (Array.isArray(value)) {
    return value;
  }
  if (typeof value === 'string') {
    return [value];
  }
  return defaultValue;
}

/**
 * Flatten array of arrays.
 *
 * @param {!Array<!Array>} arr
 * @return {!Array}
 */
function flatten(arr) {
  return [].concat.apply([], arr);
}

module.exports = {
  depCheck,
};

depCheck.description = 'Runs a dependency check on each module';
