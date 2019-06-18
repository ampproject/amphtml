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

const babelify = require('babelify');
const BBPromise = require('bluebird');
const browserify = require('browserify');
const colors = require('ansi-colors');
const depCheckConfig = require('../dep-check-config');
const fs = BBPromise.promisifyAll(require('fs-extra'));
const gulp = require('gulp');
const log = require('fancy-log');
const minimatch = require('minimatch');
const path = require('path');
const source = require('vinyl-source-stream');
const through = require('through2');
const {createCtrlcHandler, exitCtrlcHandler} = require('../ctrlcHandler');
const {css} = require('./css');
const {isTravisBuild} = require('../travis');

const root = process.cwd();
const absPathRegExp = new RegExp(`^${root}/`);
const red = msg => log(colors.red(msg));

/**
 * @typedef {{
 *   name: string,
 *   deps: ?Array<!Object<string, !ModuleDef>
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
  this.whitelist_ = toArrayOrDefault(config.whitelist, []);
}

/**
 * @param {string} moduleName
 * @param {!Array<string>} deps
 * @return {!Array<string>}
 */
Rule.prototype.run = function(moduleName, deps) {
  const errors = [];

  // If forbidden rule and current module has no dependencies at all
  // then no need to match.
  if (this.type_ == 'forbidden' && !deps.length) {
    return errors;
  }

  return errors.concat(this.matchBadDeps(moduleName, deps));
};

/**
 * @param {string} moduleName
 * @param {!Array<string>} deps
 * @return {!Array<string>}
 */
Rule.prototype.matchBadDeps = function(moduleName, deps) {
  if (this.type_ != 'forbidden') {
    return [];
  }

  const isFilenameMatch = this.filesMatching_.some(x =>
    minimatch(moduleName, x)
  );
  if (!isFilenameMatch) {
    return [];
  }

  const mustNotDependErrors = [];
  // These nested loops are ok as we usually only have a few rules
  // to run against.
  deps.forEach(dep => {
    this.mustNotDependOn_.forEach(badDepPattern => {
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

        const inWhitelist = this.whitelist_.some(entry => {
          const pair = entry.split('->');
          const whitelistedModuleName = pair[0];
          const whitelistedDep = pair[1];
          if (!minimatch(moduleName, whitelistedModuleName)) {
            return false;
          }
          return dep == whitelistedDep;
        });
        if (inWhitelist) {
          return;
        }
        mustNotDependErrors.push(
          `${moduleName} must not depend on ${dep}. ` +
            `Rule: ${JSON.stringify(this.config_)}.`
        );
      }
    });
  });
  return mustNotDependErrors;
};

const rules = depCheckConfig.rules.map(config => new Rule(config));

/**
 * Returns a list of entryPoint modules.
 * extensions/{$extension}/{$version}/{$extension}.js
 * src/amp.js
 * 3p/integration.js
 *
 * @return {!Promise<!Array<string>>}
 */
function getSrcs() {
  return fs
    .readdirAsync('extensions')
    .then(dirItems => {
      // Look for extension entry points
      return flatten(
        dirItems
          .map(x => `extensions/${x}`)
          .filter(x => fs.statSync(x).isDirectory())
          .map(getEntryModule)
          // Concat the core binary and integration binary as entry points.
          .concat('src/amp.js', '3p/integration.js')
      );
    })
    .then(files => {
      // Write all the entry modules into a single file so they can be processed
      // together.
      fs.mkdirpSync('./.amp-build');
      const filename = './.amp-build/gulp-dep-check-collection.js';
      fs.writeFileSync(
        filename,
        files
          .map(file => {
            return `import '../${file}';`;
          })
          .join('\n')
      );
      return [filename];
    });
}

/**
 * @param {string} entryModule
 * @return {!Promise<!ModuleDef>}
 */
function getGraph(entryModule) {
  let resolve;
  const promise = new BBPromise(r => {
    resolve = r;
  });
  const module = Object.create(null);
  module.name = entryModule;
  module.deps = [];

  // TODO(erwinm): Try and work this in with `gulp build` so that
  // we're not running browserify twice on travis.
  const bundler = browserify(entryModule, {debug: true}).transform(babelify, {
    compact: false,
    // Transform files in node_modules since deps use ES6 export.
    // https://github.com/babel/babelify#why-arent-files-in-node_modules-being-transformed
    global: true,
  });

  bundler.pipeline.get('deps').push(
    through.obj(function(row, enc, next) {
      module.deps.push({
        name: row.file.replace(absPathRegExp, ''),
        deps: row.deps,
      });
      this.push(row);
      next();
    })
  );
  bundler
    .bundle()
    .pipe(source(entryModule))
    // Unfortunately we need to write the files out.
    .pipe(gulp.dest('./.amp-build'))
    .on('end', () => {
      resolve(module);
    });
  return promise;
}

/**
 * @param {string} extensionFolder
 * @return {!Array<!ModuleDef>}
 */
function getEntryModule(extensionFolder) {
  const extension = path.basename(extensionFolder);
  return fs
    .readdirSync(extensionFolder)
    .map(x => `${extensionFolder}/${x}`)
    .filter(x => fs.statSync(x).isDirectory())
    .map(x => `${x}/${extension}.js`)
    .filter(x => fs.existsSync(x))
    .filter(x => fs.statSync(x).isFile());
}

/**
 * Flattens the graph to easily run through the Rules. Original graph
 * would be nested ModuleDef's wherein the top level are entry points
 * with nested dependencies. We flatten it so all we have are individual
 * modules and their imports as well as making the entries unique.
 *
 * @param {!Array<!ModuleDef>} entryPoints
 * @return {!ModuleDef}
 */
function flattenGraph(entryPoints) {
  // Flatten the graph by just getting all the deps from all
  // the entry points.
  entryPoints = entryPoints.map(entryPoint => entryPoint.deps);
  // Now make the graph have unique entries
  return flatten(entryPoints).reduce((acc, cur) => {
    const {name} = cur;
    if (!acc[name]) {
      acc[name] = Object.keys(cur.deps)
        // Get rid of the absolute path for minimatch'ing
        .map(x => cur.deps[x].replace(absPathRegExp, ''));
    }
    return acc;
  }, Object.create(null));
}

/**
 * Run Module dependency graph against the rules.
 *
 * @param {!Array<!ModuleDef>} modules
 */
function runRules(modules) {
  let errorsFound = false;
  Object.keys(modules).forEach(moduleName => {
    const deps = modules[moduleName];
    // Run Rules against the modules and flatten for reporting.
    const errors = flatten(rules.map(rule => rule.run(moduleName, deps)));

    if (errors.length) {
      errorsFound = true;
      // Report errors.
      errors.forEach(red);
    }
  });
  return errorsFound;
}

async function depCheck() {
  const handlerProcess = createCtrlcHandler('dep-check');
  await css();
  if (!isTravisBuild()) {
    log('Checking dependencies...');
  }
  return getSrcs()
    .then(entryPoints => {
      // This check is for extension folders that actually dont have
      // an extension entry point module yet.
      entryPoints = entryPoints.filter(x => fs.existsSync(x));
      return BBPromise.all(entryPoints.map(getGraph));
    })
    .then(flattenGraph)
    .then(runRules)
    .then(errorsFound => {
      if (errorsFound) {
        process.exit(1);
      }
    })
    .then(() => exitCtrlcHandler(handlerProcess));
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
 */
function flatten(arr) {
  return [].concat.apply([], arr);
}

module.exports = {
  depCheck,
};

depCheck.description = 'Runs a dependency check on each module';
