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
const fs = require('fs-extra');
const path = require('path');
const remapping = require('@ampproject/remapping');
const terser = require('terser');
const through = require('through2');

/**
 * Given a filepath, return the sourcemap.
 *
 * @param {string} file
 * @return {string|null}
 */
function loadSourceMap(file) {
  if (file.startsWith('dist')) {
    return fs.readFile(`${file}.map`);
  }
  return null;
}

/**
 * @param {string} map
 * @return {function(string)}
 */
function returnMapFirst(map) {
  let first = true;
  return function(file) {
    if (first) {
      first = false;
      return map;
    }
    return loadSourceMap(file);
  };
}

/**
 * Minify passed string.
 *
 * @param {string} code
 * @return {Object<string, string>}
 */
function terserMinify(code) {
  const minified = terser.minify(code, {
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
 * Apply Babel Transforms on output from Closure Compuler, then cleanup added space with Terser.
 *
 * @param {string} directory directory this file lives in
 * @param {boolean} isEsmBuild
 * @return {!Promise}
 */
exports.postClosureBabel = function(directory, isEsmBuild) {
  const babelPlugins = conf.plugins({isPostCompile: true, isEsmBuild});

  return through.obj(function(file, enc, next) {
    if (path.extname(file.path) === '.map' || babelPlugins.length === 0) {
      return next(null, file);
    }

    const map = loadSourceMap(file.path);
    const {code, map: babelMap} = babel.transformSync(file.contents, {
      plugins: babelPlugins,
      retainLines: false,
      sourceMaps: true,
      inputSourceMap: false,
    });
    let remapped = remapping(
      babelMap,
      returnMapFirst(map),
      !argv.full_sourcemaps
    );

    const {compressed, terserMap} = terserMinify(code);
    file.contents = Buffer.from(compressed, 'utf-8');

    // TODO: Remapping should support a chain, instead of multiple invocations.
    remapped = remapping(
      terserMap,
      returnMapFirst(remapped),
      !argv.full_sourcemaps
    );
    fs.writeFileSync(
      path.resolve(directory, `${path.basename(file.path)}.map`),
      remapped.toString()
    );

    return next(null, file);
  });
};
