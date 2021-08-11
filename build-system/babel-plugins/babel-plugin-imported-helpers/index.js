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

const {addDefault} = require('@babel/helper-module-imports');

/**
 * @fileoverview
 * Imports runtime helpers from @babel/runtime/helpers
 *
 * This is similar to @babel/plugin-external-helpers, except we import the
 * helper's module instead of injecting a reference to a globally accessible
 * object (`babelHelpers`).
 */

/** Optionally maps a helper's name to an equivalent one. */
const helperMap = {
  // We don't care about symbols, so we treat both as objectWithoutPropertiesLoose.
  objectWithoutProperties: 'objectWithoutPropertiesLoose',
};

/**
 * Cache of identifiers to each helper's ImportDeclaration, per file.
 * @const {!WeakMap<
 *   import('@babel/core').BabelFileResult,
 *   Object<string, import('@babel/core').types.Identifier>
 * >}
 */
const importNamesPerFile = new WeakMap();

module.exports = function ({types: t}) {
  return {
    name: 'imported-helpers',
    pre(file) {
      file.set('helperGenerator', (unmappedName) => {
        const name = helperMap[unmappedName] || unmappedName;

        if (name.startsWith('interopRequire')) {
          // You can't import interopRequireDefault/interopRequireWildcard,
          // they must be local functions.
          return;
        }

        if (!importNamesPerFile.has(file)) {
          importNamesPerFile.set(file, Object.create(null));
        }

        const importNames = importNamesPerFile.get(file);

        if (!importNames[name]) {
          const source = `@babel/runtime/helpers/${name}`;
          importNames[name] = addDefault(file.path, source, {nameHint: name});
        }

        return t.cloneNode(importNames[name]);
      });
    },
  };
};
