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
const conf = require('./build.conf');
const fs = require('fs');
const globby = require('globby');
const gulpBabel = require('gulp-babel');
const gulpCache = require('gulp-cache');
const gulpIf = require('gulp-if');
const path = require('path');
const {BABEL_SRC_GLOBS, THIRD_PARTY_TRANSFORM_GLOBS} = require('./sources');

const ROOT_DIR = path.resolve(__dirname, '../../');

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
  const babelPlugins = conf.plugins({
    isForTesting: !!argv.fortesting,
    isEsmBuild: !!argv.esm,
    isSinglePass: !!argv.single_pass,
    isChecktypes: argv._.includes('check-types'),
  });

  const babel = gulpBabel({
    plugins: babelPlugins,
    compact: false,
    retainLines: false,
  });

  const salt = [
    fs.readFileSync(require.resolve('./build.conf.js')).toString('hex'),
    fs.readFileSync('./babel.config.js').toString('hex'),
    JSON.stringify(argv),
  ].join(':');

  const filesToTransform = getFilesToTransform();
  const ifPipe = gulpIf(file => {
    return filesToTransform.includes(path.relative(ROOT_DIR, file.path));
  }, babel);

  ifPipe.on('data', () => {
    ifPipe.emit('gulp-cache:transformed');
  });

  const cache = gulpCache(ifPipe, {
    name: 'amp-pre-closure-babel',
    key(file) {
      return `${file.path}:${salt}:${file.contents.toString('hex')}`;
    },
  });
  return cache;
}

module.exports = {
  preClosureBabel,
};
