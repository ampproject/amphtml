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

/**
 * @typedef {{
 *   name: string,
 *   deps: !Array<string>
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
  /** @const {!RuleConfigDef} */
  this.config_ = config;

  /** @const {string} */
  this.type_ = config.type || 'forbidden';

  /**
   * Default to all files if none given.
   * @const {!GlobsDef}
   */
  this.filesMatching_ = toArrayOrDefault(config.filesMatching, ['**/*.js']);

  /** @const {!GlobsDef} */
  this.mustNotDependOn_ = toArrayOrDefault(config.mustNotDependOn, []);

  /** @const {!Array<string>} */
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
  const vendors = await fs.promises.readdir('3p/vendors');
  const vendorEntryPoints = vendors.map((x) => `3p/vendors/${x}`);
  const allEntryPoints = flatten(extensionEntryPoints)
    .concat(coreBinaries)
    .concat(vendorEntryPoints);
  const entryPointData = allEntryPoints
    .map((file) => `import './${file}';`)
    .join('\n');
  return entryPointData;
}

/**
 * @param {string} entryPointModule
 * @return {!Promise<ModuleDef>}
 */
async function getModuleGraph(entryPointModule) {
  const plugin = getEsbuildBabelPlugin('unminified', /* enableCache */ true);
  const result = await esbuild.build({
    stdin: {
      contents: entryPointModule,
      resolveDir: '.',
    },
    bundle: true,
    write: false,
    metafile: true,
    plugins: [plugin],
  });

  const entryPoints = result.metafile?.inputs || [];
  const moduleGraph = Object.create(null);
  moduleGraph.name = entryPointModule;
  moduleGraph.deps = [];

  for (const entryPoint in entryPoints) {
    moduleGraph.deps.push({
      name: entryPoint,
      deps: entryPoints[entryPoint].imports.map((dep) => dep.path),
    });
  }
  logLocalDev('Extracted module graph');
  return moduleGraph;
}

/**
 * @param {string} extensionFolder
 * @return {!Array<string>}
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
  Object.keys(moduleGraph).forEach((moduleName) => {
    // Run Rules against the modules and flatten for reporting.
    const results = rules.flatMap((rule) =>
      rule.run(moduleName, moduleGraph[moduleName])
    );
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
 * @param {GlobsDef|string|undefined} value
 * @param {!GlobsDef} defaultValue
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
 * Flatten array of arrays if necessary.
 *
 * @param {Array} arr
 * @return {!Array}
 */
function flatten(arr) {
  return [].concat.apply([], arr);
}

module.exports = {
  depCheck,
};

depCheck.description = 'Run a dependency check on each module';
