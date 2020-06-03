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

import * as path from 'path';
import alias from '@rollup/plugin-alias';

// eslint-disable-next-line no-undef
const projectRootDir = path.resolve(__dirname);

const ROLLUP_PLUGINS = [
  alias({
    entries: [
      {
        find: /.*\/log$/,
        replacement: path.resolve(projectRootDir, './noop.js'),
      },
      {
        find: /.*\/config$/,
        replacement: path.resolve(projectRootDir, './noop.js'),
      },
    ],
  }),
];

export default [
  {
    input: 'purifier.js',
    output: {
      file: 'dist/purifier.mjs',
      format: 'es',
      sourcemap: true,
    },
    external: ['dompurify'],
    plugins: ROLLUP_PLUGINS,
  },
  {
    input: 'purifier.js',
    output: {
      file: 'dist/purifier.js',
      format: 'cjs',
      sourcemap: true,
    },
    external: ['dompurify'],
    plugins: ROLLUP_PLUGINS,
  },
];
