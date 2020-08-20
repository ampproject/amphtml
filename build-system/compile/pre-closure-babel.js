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

const globby = require('globby');
const gulpBabel = require('gulp-babel');
const log = require('fancy-log');
const path = require('path');
const through = require('through2');
const {BABEL_SRC_GLOBS, THIRD_PARTY_TRANSFORM_GLOBS} = require('./sources');
const {debug, CompilationLifecycles} = require('./debug-compilation-lifecycle');
const {EventEmitter} = require('events');
const {red, cyan} = require('ansi-colors');

/**
 * Files on which to run pre-closure babel transforms.
 *
 * @private @const {!Array<string>}
 */
const filesToTransform = getFilesToTransform();

/**
 * Used to cache babel transforms.
 *
 * @private @const {!Map<string, File>}
 */
const cache = new Map();

/**
 * Computes the set of files on which to run pre-closure babel transforms.
 *
 * @return {!Array<string>}
 */
function getFilesToTransform() {
  return globby
    .sync([...BABEL_SRC_GLOBS, '!node_modules/', '!third_party/'])
    .concat(globby.sync(THIRD_PARTY_TRANSFORM_GLOBS))
    .map(path.normalize);
}

/**
 * Apply babel transforms prior to closure compiler pass.
 *
 * When a source file is transformed for the first time, it is written to an
 * in-memory cache from where it is retrieved every subsequent time without
 * invoking babel.
 *
 * @return {!Promise}
 */
function preClosureBabel() {
  const babel = gulpBabel({caller: {name: 'pre-closure'}});

  return through.obj((file, enc, next) => {
    if (!filesToTransform.includes(file.relative)) {
      return next(null, file);
    }

    if (cache.has(file.path)) {
      return next(null, cache.get(file.path));
    }

    let data, err;
    debug(
      CompilationLifecycles['pre-babel'],
      file.path,
      file.contents,
      file.sourceMap
    );
    function onData(d) {
      babel.off('error', onError);
      data = d;
    }
    function onError(e) {
      babel.off('data', onData);
      err = e;
    }
    babel.once('data', onData);
    babel.once('error', onError);
    babel.write(file, enc, () => {
      if (err) {
        return next(err);
      }

      debug(
        CompilationLifecycles['pre-closure'],
        file.path,
        data.contents,
        data.sourceMap
      );
      cache.set(file.path, data);
      next(null, data);
    });
  });
}

/**
 * Handles a pre-closure babel error. Optionally doesn't emit a fatal error when
 * compilation fails and signals the error so subsequent operations can be
 * skipped (used in watch mode).
 *
 * @param {Error} err
 * @param {string} outputFilename
 * @param {?Object} options
 * @param {?Function} resolve
 */
function handlePreClosureError(err, outputFilename, options, resolve) {
  log(red('ERROR:'), err.message, '\n');
  const reasonMessage = `Could not compile ${cyan(outputFilename)}`;
  if (options && options.continueOnError) {
    log(red('ERROR:'), reasonMessage);
    options.errored = true;
    if (resolve) {
      resolve();
    }
  } else {
    const reason = new Error(reasonMessage);
    reason.showStack = false;
    new EventEmitter().emit('error', reason);
  }
}

module.exports = {
  handlePreClosureError,
  preClosureBabel,
};
