/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

const path = require('path');

// Forbids using these imports unless is is explicitly imported as the same
// name. This aids in writing lint rules for these imports.
//
// GOOD
// import { dict } from 'src/utils/object';
// dict();
//
// BAD
// import * as obj from 'src/utils/object';
// obj.dict()
//
// Bad
// import { dict as otherName } from 'src/utils/object';
// otherName()

const imports = {
  'src/utils/object': ['dict'],
  'src/static-template': ['cachedHtmlFor', 'htmlFor'],
  'src/experiments': ['isExperimentOn'],
  'src/style': [
    'assertDoesNotContainDisplay',
    'assertNotDisplay',
    'resetStyles',
    'setImportantStyles',
    'setStyle',
    'setStyles',
  ],
  'src/css': [
    'escapeCssSelectorIdent',
    'escapeCssSelectorNth',
  ],
  'src/dom': [
    'scopedQuerySelector',
    'scopedQuerySelectorAll',
  ],
  'src/log': [
    'user',
    'dev',
  ]
};

module.exports = function(context) {
  function ImportSpecifier(node, modulePath, mods) {
    const {imported, local} = node;
    const {name} = imported;
    if (!mods.includes(name)) {
      return;
    }

    if (name === local.name) {
      return;
    }

    context.report({
      node,
      message: [
        `Forbidden rename of import ${name} from ${modulePath}`,
        'This makes it easier to write lint rules for incorrect usage',
      ].join('\n\t'),
    });
  }

  function ImportNamespaceSpecifier(node, modulePath, mods) {
    const ns = node.local.name;
    const variable = context.getScope().set.get(ns);
    const {references} = variable;

    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      const node = context.getNodeByRangeIndex(ref.identifier.start);
      const {parent} = node;

      if (parent.type !== 'MemberExpression') {
        // Don't know what's going on here...
        continue;
      }

      if (parent.computed) {
        context.report({
          node: parent,
          message: 'Unable to determine what import is being used here.',
        });
        continue;
      }

      const {name} = parent.property;
      if (mods.includes(name)) {
        context.report({
          node: parent,
          message: [
            `Illegal ${ns}.${name} use, must import and use as a lexical binding`,
            'This makes it easier to write lint rules for incorrect usage',
            `\`import { ..., ${name}, ...} from '${modulePath}'\`;`
          ].join('\n\t'),
        });
      }
    }
  }

  return {
    ImportDeclaration(node) {
      const fileName = context.getFilename();
      if (/test-/.test(context.getFilename())) {
        return;
      }

      const {source, specifiers} = node;
      const sourceValue = source.value;
      const absolutePath = path.resolve(path.dirname(fileName),
          sourceValue).replace(/\.js$/, '');

      // Find out if the import matches one of the modules.
      // But we don't know the repo's root directory, so do some work.
      const parts = absolutePath.split('/');
      let modulePath = parts.pop();
      let mods;
      while (parts.length && !mods) {
        modulePath = `${parts.pop()}/${modulePath}`;
        mods = imports[modulePath];
      }

      if (!mods) {
        return;
      }

      for (let i = 0; i < specifiers.length; i++) {
        const spec = specifiers[i];

        if (spec.type === 'ImportSpecifier') {
          ImportSpecifier(spec, modulePath, mods);
        } else if (spec.type === 'ImportNamespaceSpecifier') {
          ImportNamespaceSpecifier(spec, sourceValue, mods);
        }
      }
    },
  };
};
