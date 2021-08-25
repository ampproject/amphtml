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
const fs = require('fs-extra');
const path = require('path');
const Remapping = require('@ampproject/remapping');
const terser = require('terser');
const {CompilationLifecycles, debug} = require('./debug-compilation-lifecycle');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

/**
 * Minify passed string.
 *
 * @param {string} code
 * @return {Promise<Object<string, terser.SourceMapOptions['content']>>}
 */
async function terserMinify(code) {
  const options = {
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
  };
  const minified = await terser.minify(code, options);

  return {
    compressed: minified.code,
    terserMap: minified.map,
  };
}

/**
 * Apply Babel Transforms on output from Closure Compuler, then cleanup added
 * space with Terser.
 * @param {string} file
 * @return {Promise<void>}
 */
async function postClosureBabel(file) {
  if (path.extname(file) === '.map') {
    debug(CompilationLifecycles['complete'], file);
    return;
  }

  debug(CompilationLifecycles['closured-pre-babel'], file);
  /** @type {?babel.TransformOptions} */
  const babelOptions = babel.loadOptions({caller: {name: 'post-closure'}});
  const {code, map: babelMap} =
    (await babel.transformFileAsync(file, babelOptions ?? undefined)) || {};
  if (!code || !babelMap) {
    throw new Error(`Error transforming contents of ${file}`);
  }

  debug(CompilationLifecycles['closured-pre-terser'], file, code, babelMap);
  const {compressed, terserMap} = await terserMinify(code);
  await fs.outputFile(file, compressed);

  const closureMap = await fs.readJson(`${file}.map`, 'utf-8');
  const sourceMap = remapping(
    [terserMap, babelMap, closureMap],
    () => null,
    !argv.full_sourcemaps
  );
  debug(
    CompilationLifecycles['complete'],
    file,
    compressed?.toString(),
    sourceMap
  );
  await fs.writeJson(`${file}.map`, sourceMap);
}

module.exports = {
  postClosureBabel,
};
