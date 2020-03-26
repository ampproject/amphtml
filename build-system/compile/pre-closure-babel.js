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
const babel = require('@babel/core');
const conf = require('./build.conf');
const globby = require('globby');
const path = require('path');
const through = require('through2');
const {BABEL_SRC_GLOBS, THIRD_PARTY_TRANSFORM_GLOBS} = require('./sources');

const ROOT_DIR = path.resolve(__dirname, '../../');

/**
 * Files on which to run pre-closure babel transforms.
 *
 * @private @const {!Array<string>}
 */
const filesToTransform = getFilesToTransform();

/**
 * Used to cache babel transforms.
 *
 * @private @const {!Object<string, string>}
 */
const cachedTransforms = {};

/**
 * Computes the set of files on which to run pre-closure babel transforms.
 *
 * @return {!Array<string>}
 */
function getFilesToTransform() {
  return globby
    .sync([...BABEL_SRC_GLOBS, '!node_modules/', '!third_party/'])
    .concat(globby.sync(THIRD_PARTY_TRANSFORM_GLOBS));
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
  return through.obj((file, enc, next) => {
    const cachedTransform = cachedTransforms[file.path];
    if (cachedTransform) {
      file.contents = Buffer.from(cachedTransform);
    } else if (filesToTransform.includes(path.relative(ROOT_DIR, file.path))) {
      const babelPlugins = conf.plugins({
        isForTesting: !!argv.fortesting,
        isEsmBuild: !!argv.esm,
        isSinglePass: !!argv.single_pass,
        isChecktypes: argv._.includes('check-types'),
      });
      const {code} = babel.transformFileSync(file.path, {
        plugins: babelPlugins,
        retainLines: true,
        compact: false,
      });
      cachedTransforms[file.path] = code;
      file.contents = Buffer.from(code);
    }
    return next(null, file);
  });
}

module.exports = {
  preClosureBabel,
};
