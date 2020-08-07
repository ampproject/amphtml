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
const path = require('path');
const remapping = require('@ampproject/remapping');
const terser = require('terser');
const through = require('through2');
const {debug, CompilationLifecycles} = require('./debug-compilation-lifecycle');
const { catch } = require('fetch-mock');

/**
 * Minify passed string.
 *
 * @param {string} code
 * @return {Promise<Object<string, string>>}
 */
async function terserMinify(code) {
  const minified = await terser.minify(code, {
    mangle: false,
    compress: {
      defaults: false,
      unused: true,
    },
    output: {
      beautify: !!argv.pretty_print,
      comments: /\/*/,
      // eslint-disable-next-line google-camelcase/google-camelcase
      keep_quoted_props: true,
    },
    sourceMap: true,
  });

  return {
    compressed: minified.code,
    terserMap: minified.map,
  };
}

/**
 * Apply Babel Transforms on output from Closure Compuler, then cleanup added
 * space with Terser. Used only in esm mode.
 *
 * @return {!Promise}
 */
exports.postClosureBabel = function () {
  return through.obj(async function (file, enc, next) {
    if (!argv.esm || path.extname(file.path) === '.map') {
      debug(
        CompilationLifecycles['complete'],
        file.path,
        file.contents,
        file.sourceMap
      );
      return next(null, file);
    }

    const map = file.sourceMap;

    debug(
      CompilationLifecycles['closured-pre-babel'],
      file.path,
      file.contents,
      file.sourceMap
    );
    const {code, map: babelMap} = babel.transformSync(file.contents, {
      caller: {name: 'post-closure'},
    });

    debug(
      CompilationLifecycles['closured-pre-terser'],
      file.path,
      file.contents,
      file.sourceMap
    );

    try {
      const {compressed, terserMap} = await terserMinify(code);
      file.contents = Buffer.from(compressed, 'utf-8');
      file.sourceMap = remapping(
        [terserMap, babelMap, map],
        () => null,
        !argv.full_sourcemaps
      );
    } catch(e) {
      return next(e);
    }

    debug(
      CompilationLifecycles['complete'],
      file.path,
      file.contents,
      file.sourceMap
    );

    return next(null, file);
  });
};
