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

const globby = require('globby');
const path = require('path');
const {jsifyCssAsync} = require('../tasks/css/jsify-css');

/**
 * @param {?Array<string>=} cssInputFiles When this array is provided, the list
 *   of imported CSS files is added.
 * @return {import('esbuild').Plugin}
 *
 * TODO(alanorozco): Remove cssInputFiles, or this comment, once we resolve the
 * concert of esbuild's ability to propagate watchFiles into the Metafile.
 *
 * (See getDependencies() on build-system/tasks/helpers.js
 * and https://github.com/evanw/esbuild/issues/1268)
 */
function getEsbuildCssPlugin(cssInputFiles) {
  return {
    name: 'css-plugin',
    setup(build) {
      build.onLoad({filter: /\.css$/}, async (args) => {
        // Omit references to built files.
        if (args.path.includes('/build/')) {
          return null;
        }

        // We currently lack a way to determine all transitive CSS imports, so
        // in the meantime we naïvely watch all .css paths in the same directory
        // as the processed file.
        // TODO(alanorozco): Add the correct chain of imported files
        (cssInputFiles || null)?.push(
          ...(await globby(path.join(path.dirname(args.path), '**/*.css')))
        );

        const css = await jsifyCssAsync(args.path);
        return {
          contents: css,
          loader: 'text',
        };
      });
    },
  };
}

module.exports = {getEsbuildCssPlugin};
