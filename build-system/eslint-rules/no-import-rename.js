'use strict';

const path = require('path');

// Forbids using these imports unless is is explicitly imported as the same
// name. This aids in writing lint rules and transforms for these imports.
//
// GOOD
// import { setStyle } from '#core/dom/style';
// setStyle();
//
// BAD
// import * as obj from '#core/dom/style';
// obj.setStyle()
//
// Bad
// import { setStyle as otherName } from '#core/dom/style';
// otherName()

const imports = {
  '#core/dom/css-selectors': ['escapeCssSelectorIdent', 'escapeCssSelectorNth'],
  '#core/dom/query': ['scopedQuerySelector', 'scopedQuerySelectorAll'],
  '#core/dom/static-template': ['htmlFor'],
  '#core/dom/style': [
    'assertDoesNotContainDisplay',
    'assertNotDisplay',
    'resetStyles',
    'setImportantStyles',
    'setStyle',
    'setStyles',
  ],
  '#core/types/enum': ['mangleObjectValues'],
  '#core/types/pure': ['pure'],
  '#experiments': ['isExperimentOn'],
  '#utils/log': ['user', 'dev'],
  '#preact/utils': ['propName', 'tabindexFromProps'],
  'src/mode': ['getMode'],
};

module.exports = function (context) {
  /**
   * @param {*} node
   * @param {string} modulePath
   * @param {*} mods
   */
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

  /**
   * @param {*} node
   * @param {string} modulePath
   * @param {*} mods
   * @return {{
   *   ImportDeclaration: {Function(node: *): void},
   * }}
   */
  function ImportNamespaceSpecifier(node, modulePath, mods) {
    const ns = node.local.name;
    const variable = context.getScope().set.get(ns);
    const {references} = variable;

    for (let i = 0; i < references.length; i++) {
      const ref = references[i];
      const [start] = ref.identifier.range;
      const node = context.getNodeByRangeIndex(start);

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
            `\`import { ..., ${name}, ...} from '${modulePath}'\`;`,
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
      const absolutePath = path
        .resolve(path.dirname(fileName), sourceValue)
        .replace(/\.js$/, '');

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
