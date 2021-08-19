'use strict';

module.exports = {
  meta: {
    fixable: 'code',
  },
  create(context) {
    /**
     * @type {{
     *   used: Set,
     *   declared: Map,
     * }[]}
     * */
    const stack = [];
    /**
     * @return {{
     *   used: Set,
     *   declared: Map,
     * }}
     */
    function current() {
      return stack[stack.length - 1];
    }

    /**
     * @return {boolean}
     */
    function shouldIgnoreFile() {
      return /\b(test|examples)\b/.test(context.getFilename());
    }

    const checkers = {
      '@visibleForTesting': visibleForTestingUse,
      '@restricted': restrictedUse,
      '@protected': uncheckableUse,
      '@override': uncheckableUse,
    };

    /**
     * @param {CompilerNode} node
     * @return {Function(): void|void}
     */
    function checkerForAnnotation(node) {
      const comments = context.getCommentsBefore(node);

      for (let i = 0; i < comments.length; i++) {
        const comment = comments[i].value;

        for (const type in checkers) {
          if (comment.includes(type)) {
            return checkers[type];
          }
        }
      }

      return unannotatedUse;
    }

    /**
     * Restricteds must be used in the file, but not in the class.
     * @param {CompilerNode} node
     * @param {string} name
     * @param {boolean} used
     */
    function restrictedUse(node, name, used) {
      if (used) {
        const message = [
          `Used restricted private "${name}".`.padEnd(80),
          "It's marked @restricted, but it's used in the class.",
          'Please remove the @restricted annotation.',
        ].join('\n\t');
        context.report({node, message});
        return;
      }

      const sourceCode = context.getSourceCode();
      const {text} = sourceCode;

      let index = -1;
      while (true) {
        index = text.indexOf(name, index + 1);
        if (index === -1) {
          break;
        }

        const node = sourceCode.getNodeByRangeIndex(index);
        if (!node || node.type !== 'Identifier') {
          continue;
        }

        const {parent} = node;
        if (
          parent.type === 'MemberExpression' &&
          shouldCheckMember(parent, false) &&
          !isAssignment(parent)
        ) {
          return;
        }

        if (
          parent.type === 'Property' &&
          parent.key === node &&
          parent.parent.type === 'ObjectPattern'
        ) {
          return;
        }
      }

      const message = [
        `Unused restricted private "${name}".`.padEnd(80),
        "It's marked @restricted, but it's still unused in the file.",
      ].join('\n\t');
      context.report({node, message});
    }

    /**
     * VisibleForTestings must not be used in the class.
     *
     * @param {CompilerNode} node
     * @param {string} name
     * @param {boolean} used
     */
    function visibleForTestingUse(node, name, used) {
      if (!used) {
        return;
      }

      const message = [
        `Used visibleForTesting private "${name}".`.padEnd(80),
        "It's marked @visibleForTesting, but it's used in the class.",
        'Please remove the @visibleForTesting annotation.',
      ].join('\n\t');
      context.report({node, message});
    }

    /**
     * Protected and Override are uncheckable. Let Closure handle that.
     */
    function uncheckableUse() {
      // Noop.
    }

    /**
     * Unannotated fields must be used in the class
     *
     * @param {CompilerNode} node
     * @param {string} name
     * @param {boolean} used
     */
    function unannotatedUse(node, name, used) {
      if (used) {
        return;
      }

      const message = [
        `Unused private "${name}".`.padEnd(80), // Padding for alignment
        'If this is used for testing, annotate with `@visibleForTesting`.',
        'If this is a private used in the file, `@restricted`.',
        'If this is used in a subclass, `@protected`.',
        'If this is an override of a protected, `@override`.',
        'If none of these exceptions applies, please contact @jridgewell.',
      ].join('\n\t');
      context.report({node, message});
    }

    /**
     * @param {CompilerNode} node
     * @param {boolean=} needsThis
     * @return {boolean}
     */
    function shouldCheckMember(node, needsThis = true) {
      const {computed, object, property} = node;
      if (
        computed ||
        (needsThis && object.type !== 'ThisExpression') ||
        property.type !== 'Identifier'
      ) {
        return false;
      }

      return isPrivateName(property);
    }

    /**
     * @param {CompilerNode} node
     * @return {boolean}
     */
    function isAssignment(node) {
      const {parent} = node;
      if (!parent) {
        return false;
      }
      return parent.type === 'AssignmentExpression' && parent.left === node;
    }

    /**
     * @param {CompilerNode} node
     * @return {boolean}
     */
    function isPrivateName(node) {
      return (node.name || node.value).endsWith('_');
    }

    return {
      ClassBody() {
        if (shouldIgnoreFile()) {
          return;
        }

        stack.push({used: new Set(), declared: new Map()});
      },

      'ClassBody:exit': function () {
        if (shouldIgnoreFile()) {
          return;
        }

        const {declared, used} = stack.pop();

        declared.forEach((node, name) => {
          const checker = checkerForAnnotation(node);
          checker(node, name, used.has(name));
        });
      },

      'ClassBody > MethodDefinition': function (node) {
        if (shouldIgnoreFile()) {
          return;
        }

        const {computed, key} = node;
        if (computed || !isPrivateName(key)) {
          return;
        }

        const {name} = key;
        const {declared} = current();
        declared.set(name, node);
      },

      'MethodDefinition[kind="constructor"] MemberExpression': function (node) {
        if (
          shouldIgnoreFile() ||
          !shouldCheckMember(node) ||
          !isAssignment(node)
        ) {
          return;
        }

        const {name} = node.property;
        const {declared} = current();
        if (!declared.has(name)) {
          declared.set(name, node.parent);
        }
      },

      'ClassBody MemberExpression': function (node) {
        if (
          shouldIgnoreFile() ||
          !shouldCheckMember(node, false) ||
          isAssignment(node)
        ) {
          return;
        }

        const {name} = node.property;
        const {used} = current();
        used.add(name);
      },

      'ClassBody VariableDeclarator > ObjectPattern': function (node) {
        if (shouldIgnoreFile()) {
          return;
        }

        if (node.parent.init.type !== 'ThisExpression') {
          return;
        }

        const {properties} = node;
        for (let i = 0; i < properties.length; i++) {
          const prop = properties[i];
          if (prop.computed || !isPrivateName(prop.key)) {
            continue;
          }

          const {name} = prop.key;
          const {used} = current();
          used.add(name);
        }
      },
    };
  },
};
