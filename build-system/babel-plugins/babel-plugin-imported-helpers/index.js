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

const helperMap = {
  // We don't care about symbols, so we treat both as objectWithoutPropertiesLoose.
  objectWithoutProperties: 'objectWithoutPropertiesLoose',
};

const importNamesPerFile = new WeakMap();

module.exports = function ({types: t}) {
  return {
    name: 'imported-helpers',
    pre(file) {
      file.set('helperGenerator', (unmappedName) => {
        const name = helperMap[unmappedName] || unmappedName;

        if (!importNamesPerFile.has(file)) {
          importNamesPerFile.set(file, Object.create(null));
        }

        const importNames = importNamesPerFile.get(file);

        if (!importNames[name]) {
          const source = `@babel/runtime/helpers/esm/${name}`;
          importNames[name] = addDefault(file.path, source, {nameHint: name});
        }

        return t.cloneNode(importNames[name]);
      });
    },
  };
};
