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

const {readFile} = require('fs-extra');
const {transformCssString} = require('../tasks/css/jsify-css');

const esbuildCssPlugin = {
  name: 'css-plugin',
  setup(build) {
    build.onLoad({filter: /\.css$/}, async (args) => {
      // Omit legacy references since they're resolved to Javascript.
      if (args.path.includes('../build/')) {
        return null;
      }
      const input = await readFile(args.path, 'utf8');
      const {css} = await transformCssString(input, args.path);
      return {
        contents: css,
        loader: 'text',
      };
    });
  },
};

module.exports = {esbuildCssPlugin};
