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
const Remapping = require('@ampproject/remapping');
const terser = require('terser');
const through = require('through2');
const {debug, CompilationLifecycles} = require('./debug-compilation-lifecycle');
const {jsBundles} = require('./bundles.config.js');

/** @type {Remapping.default} */
const remapping = /** @type {*} */ (Remapping);

let mainBundles;

/**
 * Minify passed string.
 *
 * @param {string} code
 * @param {string} filename
 * @return {Promise<Object<string, terser.SourceMapOptions['content']>>}
 */
async function terserMinify(code, filename) {
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
  const basename = path.basename(filename, argv.esm ? '.mjs' : '.js');
  if (!mainBundles) {
    mainBundles = Object.keys(jsBundles).map((key) => {
      const bundle = jsBundles[key];
      if (bundle.options && bundle.options.minifiedName) {
        return path.basename(bundle.options.minifiedName, '.js');
      }
      return path.basename(key, '.js');
    });
  }
  if (mainBundles.includes(basename)) {
    options.output.preamble = ';';
  }
  const minified = await terser.minify(code, options);

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
  return through.obj(async function (file, _enc, next) {
    if ((!argv.esm && !argv.sxg) || path.extname(file.path) === '.map') {
      debug(
        CompilationLifecycles['complete'],
        file.path,
        file.contents,
        file.sourceMap
      );
      return next(null, file);
    }

    const map = file.sourceMap;

    try {
      debug(
        CompilationLifecycles['closured-pre-babel'],
        file.path,
        file.contents,
        file.sourceMap
      );
      const {code, map: babelMap} =
        babel.transformSync(file.contents, {
          caller: {name: 'post-closure'},
        }) || {};
      if (!code || !babelMap) {
        throw new Error(`Error transforming contents of ${file.path}`);
      }

      debug(
        CompilationLifecycles['closured-pre-terser'],
        file.path,
        file.contents,
        file.sourceMap
      );

      const {compressed, terserMap} = await terserMinify(
        code,
        path.basename(file.path)
      );
      if (!compressed) {
        throw new Error(`Error minifying contents of ${file.path}`);
      }
      file.contents = Buffer.from(compressed.toString(), 'utf-8');
      file.sourceMap = remapping(
        [terserMap, babelMap, map],
        () => null,
        !argv.full_sourcemaps
      );
    } catch (e) {
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
