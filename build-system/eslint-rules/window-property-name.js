/**
 * @fileoverview
 * Checks that custom properties set on the window are prefixed with '__AMP_'.
 * The prefix is invalid in `id` attributes which prevents DOM clobbering.
 */

'use strict';

const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../../');

// TODO(choumx): Fix extensions code and add 'extensions/' here.
const PATHS_TO_INCLUDE = [
  path.resolve(ROOT_DIR, 'src/'),
  path.resolve(ROOT_DIR, 'builtins/'),
];

const PATHS_TO_IGNORE = [
  path.resolve(ROOT_DIR, 'src/polyfills'),
  path.resolve(ROOT_DIR, 'test/'),
];

const WINDOW_PROPERTIES = ['win', 'window', 'global', 'self', 'globalThis'];

module.exports = function (context) {
  /**
   * Looks up value of an identifier property.
   * E.g. given `window[FOO]`, finds `FOO = 'abc'` in code and returns `'abc'`.
   * @param {!Node} property
   * @return {string}
   */
  function findPropertyValue(property) {
    const {name, type} = property;
    if (type === 'Identifier') {
      const sourceCode = context.getSourceCode();
      const {text} = sourceCode;

      // Look through source code to find where the variable is assigned to a
      // literal value (if any), and then return that value.
      let index = -1;
      while (true) {
        index = text.indexOf(name, index + 1);
        if (index < 0) {
          break;
        }
        const n = sourceCode.getNodeByRangeIndex(index);
        const p = n.parent;
        if (p.type === 'VariableDeclarator' && p.init.type === 'Literal') {
          return p.init.value;
        }
      }
    }
    return null;
  }

  /**
   * @param {string} prop
   * @return {boolean}
   */
  function isWindowPropertyClobberProof(prop) {
    // The AMP Validator forbids "__AMP_*" and "AMP" in `id` attribute values,
    // which prevents them from being clobbered.
    return prop.startsWith('__AMP_') || prop === 'AMP' || prop.startsWith('on');
  }

  return {
    AssignmentExpression(node) {
      const filePath = context.getFilename();
      // Only check source paths.
      if (!PATHS_TO_INCLUDE.some((path) => filePath.includes(path))) {
        return;
      }
      // Ignore polyfills etc.
      if (PATHS_TO_IGNORE.some((path) => filePath.includes(path))) {
        return;
      }
      // Ignore test files.
      const filename = path.basename(filePath);
      if (/^(test-[\w-]+|[\w-]+-testing)\.js$/.test(filename)) {
        return;
      }
      // We only care if LHS of assignment is a member expression e.g. foo.bar.
      const {left} = node;
      if (left.type !== 'MemberExpression') {
        return;
      }
      // We only care if member object looks like a window.
      const object = left.object.name;
      if (!object || !WINDOW_PROPERTIES.includes(object.toLowerCase())) {
        return;
      }
      // Attempt to look up computed property value so we can enforce naming
      // convention on window properties. E.g. "foo" in window.foo is easy,
      // but window[foo] requires finding the value of `foo`.
      const prop = left.computed
        ? findPropertyValue(left.property)
        : left.property.name;
      if (!prop) {
        context.report({
          node,
          message:
            'Computed property names are not allowed on window, except ' +
            'references to local constants.',
        });
        return;
      }
      // Disallow properties on window that are subject to DOM clobbering.
      if (isWindowPropertyClobberProof(prop)) {
        return;
      }
      context.report({
        node,
        message: 'Window property "{{prop}}" should be prefixed with "__AMP_".',
        data: {prop},
      });
    },
  };
};
