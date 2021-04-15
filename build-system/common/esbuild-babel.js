/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

const babel = require('@babel/core');
const path = require('path');
const {TransformCache, batchedRead, md5} = require('./transform-cache');

/**
 * Used to cache babel transforms done by esbuild.
 * @const {TransformCache}
 */
let transformCache;

/**
 * Creates a babel plugin for esbuild for the given caller. Optionally enables
 * caching to speed up transforms.
 * @param {string} callerName
 * @param {boolean} enableCache
 * @param {function()} preSetup
 * @param {function()} postLoad
 * @return {!Object}
 */
function getEsbuildBabelPlugin(
  callerName,
  enableCache,
  preSetup = () => {},
  postLoad = () => {}
) {
  if (!transformCache) {
    transformCache = new TransformCache('.babel-cache', '.js');
  }

  async function transformContents(contents, hash, babelOptions) {
    if (enableCache) {
      const cached = transformCache.get(hash);
      if (cached) {
        return cached;
      }
    }

    const promise = babel
      .transformAsync(contents, babelOptions)
      .then((result) => result.code);

    if (enableCache) {
      await transformCache.set(hash, promise);
    }

    return promise.finally(postLoad);
  }

  return {
    name: 'babel',

    async setup(build) {
      preSetup();

      const babelOptions =
        babel.loadOptions({caller: {name: callerName}}) || {};
      const optionsHash = md5(
        JSON.stringify({babelOptions, argv: process.argv.slice(2)})
      );

      build.onLoad({filter: /\.[cm]?js$/, namespace: ''}, async (file) => {
        const filename = file.path;
        const {contents, hash} = await batchedRead(filename, optionsHash);
        const transformed = await transformContents(contents, hash, {
          ...babelOptions,
          filename,
          filenameRelative: path.basename(filename),
        });
        return {contents: transformed};
      });
    },
  };
}

module.exports = {
  getEsbuildBabelPlugin,
};
