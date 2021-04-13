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

const {
  staticTemplateFactories,
  staticTemplateTags,
  staticTemplateFactoryFns,
} = require('../babel-plugins/static-template-metadata');

/**
 * @param {*} context
 * @return {!Object<string, function(CompilerNode):void>}
 */
function create(context) {
  /**
   * @param {CompilerNode} node
   */
  function tagCannotBeCalled(node) {
    const {name} = node.callee;
    context.report({
      node,
      message:
        `The ${name} helper MUST NOT be called directly. ` +
        'Instead, use it as a template literal tag: ``` ' +
        name +
        '`<div />` ```',
    });
  }

  /**
   * @param {CompilerNode} node
   */
  function shouldBeAssignedToTagHelper(node) {
    const {parent} = node;
    const {name} = node.callee;

    const expectedTagName = staticTemplateFactories[name];

    if (
      parent.type === 'VariableDeclarator' &&
      parent.init === node &&
      parent.id.type === 'Identifier' &&
      parent.id.name === expectedTagName
    ) {
      return;
    }

    if (
      parent.type === 'AssignmentExpression' &&
      parent.right === node &&
      parent.left.type === 'Identifier' &&
      parent.left.name === expectedTagName
    ) {
      return;
    }

    context.report({
      node,
      message: `${name} result must be stored into a helper constant named "${expectedTagName}".`,
    });
  }

  /**
   * @param {CompilerNode} node
   */
  function tagContentShouldBeStatic(node) {
    const {quasi, tag} = node;
    if (quasi.expressions.length !== 0) {
      context.report({
        node,
        message:
          `The ${tag.name} template tag CANNOT accept expression.` +
          ' The template MUST be static only.',
      });
    }

    const template = quasi.quasis[0];
    const string = template.value.cooked;
    if (!string) {
      context.report({
        node: template,
        message: 'Illegal escape sequence detected in template literal.',
      });
    }

    if (/<(html|body|head)/i.test(string)) {
      context.report({
        node: template,
        message:
          'It it not possible to generate HTML, BODY, or' +
          ' HEAD root elements. Please do so manually with' +
          ' document.createElement.',
      });
    }

    const invalids = invalidVoidTag(string);
    if (invalids.length) {
      const sourceCode = context.getSourceCode();
      const {start} = template;

      for (let i = 0; i < invalids.length; i++) {
        const {tag, offset} = invalids[i];
        context.report({
          node: template,
          loc: sourceCode.getLocFromIndex(start + offset),
          message: `Invalid void tag "${tag}"`,
        });
      }
    }
  }

  /**
   * @param {*} string
   * @return {{
   *   tag: string,
   *   offset: number,
   * }[]}
   */
  function invalidVoidTag(string) {
    // Void tags are defined at
    // https://html.spec.whatwg.org/multipage/syntax.html#void-elements
    const invalid = /<(?!area|base|br|col|embed|hr|img|input|link|meta|param|source|track|wbr)([a-zA-Z-]+)( [^>]*)?\/>/g;
    const matches = [];

    let match;
    while ((match = invalid.exec(string))) {
      matches.push({
        tag: match[1],
        offset: match.index,
      });
    }

    return matches;
  }

  function cannotImplicitlyReturnCalls(node) {
    context.report({
      node,
      message: `Do not implicitly return ${node.tag.callee.name}()\`...\`, since it requires a helper constant in function scope.`,
      fix: function* (fixer) {
        yield fixer.insertTextBefore(node, `{\nreturn (`);
        yield fixer.insertTextAfter(node, `);\n}`);
      },
    });
  }

  const checkedScopeBlocks = new Set();
  function tagMustBeHelperConstant(node) {
    const {name} = node.tag.callee;
    // Fixer inserts constant when required:
    //   const html = htmlFor(...);
    const helperConstName = staticTemplateFactories[name];
    context.report({
      node,
      message: `Do not use ${name}() call directly as template tag. Store its result in a helper constant named "${helperConstName}", and use that as the template tag. This enforces code format, and enables syntax highlighting in some editors.`,
      fix: function* (fixer) {
        let scope = context.getScope();
        // Find the highest scope within the same function block that calls this
        // factory function, so that the helper is shared.
        while (
          scope.type !== 'function' &&
          scope.upper &&
          scope.upper.references.filter(
            ({identifier}) => identifier && identifier.name === name
          ).length > 0
        ) {
          scope = scope.upper;
        }
        // A scope's block may not take children directly, we need to insert
        // it as part of its body field.
        let insertionBlock = scope.block;
        insertionBlock =
          insertionBlock.body && !Array.isArray(insertionBlock.body)
            ? insertionBlock.body
            : insertionBlock;
        if (!checkedScopeBlocks.has(insertionBlock)) {
          checkedScopeBlocks.add(insertionBlock);
          if (!scope.set.get(helperConstName)) {
            // Insert const as close as possible above the node, while also
            // being a direct child of the selected scope's block.
            let insertBeforeNode = node;
            while (insertBeforeNode.parent !== insertionBlock) {
              insertBeforeNode = insertBeforeNode.parent;
            }
            const helperConstInit = context.getSourceCode().getText(node.tag);
            yield fixer.insertTextBefore(
              insertBeforeNode,
              `const ${helperConstName} = ${helperConstInit};\n`
            );
          }
        }

        // htmlFor(...)`...` to html`...`
        yield fixer.replaceText(node.tag, helperConstName);

        // Prettier formats this in a silly way unless the quasi's content is
        // wrapped in whitespace.
        const {quasi} = node;
        yield fixer.replaceText(
          quasi,
          context
            .getSourceCode()
            .getText(quasi)
            .replace(/^`([^\s])/gm, '` $1')
            .replace(/([^\s])`$/gm, '$1 `')
        );
      },
    });
  }

  function isTestFile() {
    return /test-/.test(context.getFilename());
  }

  const fns = Array.from(staticTemplateFactoryFns);
  const tags = Array.from(staticTemplateTags);

  return {
    // html(...)
    [tags
      .map(
        (name) =>
          'CallExpression' +
          '[callee.type="Identifier"]' +
          `[callee.name="${name}"]`
      )
      .join(',')]: function (node) {
      if (!isTestFile()) {
        tagCannotBeCalled(node);
      }
    },

    // html`...`
    [tags
      .map(
        (name) =>
          'TaggedTemplateExpression' +
          '[tag.type="Identifier"]' +
          `[tag.name="${name}"]`
      )
      .join(',')]: function (node) {
      if (!isTestFile()) {
        tagContentShouldBeStatic(node);
      }
    },

    // htmlFor(...)
    [fns.map(
      (name) =>
        'CallExpression' +
        '[callee.type="Identifier"]' +
        `[callee.name="${name}"]`
    )]: function (node) {
      const {parent} = node;
      if (parent.type === 'TaggedTemplateExpression' && parent.tag === node) {
        // We first wrap implicit returns if required like:
        // () => { return htmlFor(...)`...` }
        // Fixes are applied recursively, so the helper constant is inserted
        // after wrapping.
        if (parent.parent.type === 'ArrowFunctionExpression') {
          cannotImplicitlyReturnCalls(parent);
        } else {
          tagMustBeHelperConstant(parent);
        }
      }
      // Test files may do forbidden calls like htmlFor(...)(...), which is fine.
      // However, if they actually do create trees like htmlFor(...)`...` then
      // we would like to enforce the helper constant style above.
      else if (!isTestFile()) {
        shouldBeAssignedToTagHelper(node);
      }
    },
  };
}

module.exports = {
  meta: {fixable: 'code'},
  create,
};
