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

const babel = require('@babel/core');
const fs = require('fs-extra');
const globby = require('globby');
const path = require('path');
const tempy = require('tempy');
const {BABEL_SRC_GLOBS} = require('./sources');
const {debug, CompilationLifecycles} = require('./debug-compilation-lifecycle');
const {log} = require('../common/logging');
const {red, cyan} = require('../common/colors');
const {TransformCache, batchedRead, md5} = require('../common/transform-cache');

/**
 * Files on which to run pre-closure babel transforms.
 *
 * @private @const {!Array<string>}
 */
let filesToTransform;

/**
 * Directory used to output babel transformed files for closure compilation.
 *
 * @private @const {string}
 */
let outputDir;

/**
 * Used to cache pre-closure babel transforms.
 *
 * @const {TransformCache}
 */
let transformCache;

/**
 * Returns the name of the babel output directory if it has been created.
 *
 * @return {string}
 */
function getBabelOutputDir() {
  return outputDir || '';
}

/**
 * Computes the set of files on which to run pre-closure babel transforms.
 *
 * @return {!Array<string>}
 */
function getFilesToTransform() {
  return globby.sync([...BABEL_SRC_GLOBS, '!node_modules/', '!third_party/']);
}

/**
 * Apply babel transforms prior to closure compiler pass, store the transformed
 * file in an output directory (used by closure compiler), and return the path
 * of the transformed file.
 *
 * When a source file is transformed for the first time, it is written to a
 * persistent transform cache from where it is retrieved every subsequent time
 * without invoking babel. A change to the file contents or to the invocation
 * arguments will invalidate the cached result and re-transform the file.
 *
 * @param {string} file
 * @param {string} outputFilename
 * @param {!Object} options
 * @return {Promise<string>}
 */
async function preClosureBabel(file, outputFilename, options) {
  if (!outputDir) {
    outputDir = tempy.directory();
  }
  if (!transformCache) {
    transformCache = new TransformCache('.pre-closure-cache', '.js');
  }
  if (!filesToTransform) {
    filesToTransform = getFilesToTransform();
  }
  const transformedFile = path.join(outputDir, file);
  if (!filesToTransform.includes(file)) {
    if (!(await fs.exists(transformedFile))) {
      await fs.copy(file, transformedFile);
    }
    return transformedFile;
  }
  try {
    debug(CompilationLifecycles['pre-babel'], file);
    const babelOptions =
      babel.loadOptions({caller: {name: 'pre-closure'}}) || {};
    const optionsHash = md5(
      JSON.stringify({babelOptions, argv: process.argv.slice(2)})
    );
    const {contents, hash} = await batchedRead(file, optionsHash);
    const cachedPromise = transformCache.get(hash);
    if (cachedPromise) {
      if (!(await fs.exists(transformedFile))) {
        await fs.outputFile(transformedFile, await cachedPromise);
      }
    } else {
      const transformPromise = babel
        .transformAsync(contents, {
          ...babelOptions,
          filename: file,
          filenameRelative: path.basename(file),
          sourceFileName: path.relative(process.cwd(), file),
        })
        .then((result) => result?.code);
      transformCache.set(hash, transformPromise);
      await fs.outputFile(transformedFile, await transformPromise);
      debug(CompilationLifecycles['pre-closure'], transformedFile);
    }
  } catch (err) {
    const reason = handlePreClosureError(err, outputFilename, options);
    if (reason) {
      throw reason;
    }
  }
  return transformedFile;
}

/**
 * Handles a pre-closure babel error. Returns an error when transformation fails
 * except except in watch mode, where we want to print a message and continue.
 *
 * @param {Error} err
 * @param {string} outputFilename
 * @param {?Object=} options
 * @return {Error|undefined}
 */
function handlePreClosureError(err, outputFilename, options) {
  log(red('ERROR:'), err.message, '\n');
  const reasonMessage = `Could not transform ${cyan(outputFilename)}`;
  if (options && options.continueOnError) {
    log(red('ERROR:'), reasonMessage);
    options.errored = true;
    return;
  }
  return new Error(reasonMessage);
}

module.exports = {
  getBabelOutputDir,
  preClosureBabel,
};
