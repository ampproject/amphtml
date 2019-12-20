/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

const rewrites = {
  __proto__: null,
  'preact': 'preact/dist/preact.module.js',
  'preact/hooks': 'preact/hooks/dist/hooks.module.js',
  'dompurify': 'dompurify/dist/purify.es',
  'promise-pjs': 'promise-pjs/promise.mjs',
  '@ampproject/worker-dom': '@ampproject/worker-dom/dist/amp/main.mjs',
  '@ampproject/animations': '@ampproject/animations/dist/animations.mjs',
};

// Rewrites import paths from a colloquial name into a full name.
//
// Before:
// import {createElement} from 'preact';
// import {useState} from 'preact/hooks';
//
// After:
// import {createElement} from 'preact/dist/preact.module.js';
// import {useState} from 'preact/hooks/dist/hooks.module.js';
module.exports = function(babel) {
  const {types: t} = babel;

  return {
    name: 'rewrite-imports',
    visitor: {
      ImportDeclaration(path) {
        const source = path.get('source');
        const rewrite = rewrites[source.node.value];
        if (rewrite) {
          source.replaceWith(t.stringLiteral(rewrite));
        }
      },

      ExportDeclaration(path) {
        const source = path.get('source');
        if (!source.node) {
          return;
        }

        const rewrite = rewrites[source.node.value];
        if (rewrite) {
          source.replaceWith(t.stringLiteral(rewrite));
        }
      },
    },
  };
};
