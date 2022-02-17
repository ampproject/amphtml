const {readFileSync} = require('fs');

/**
 * @fileoverview
 * Ensures that forbidden-terms.js is up-to-date by reporting listed files that
 * do not include the allowed term.
 */

const allowlistProperty = 'allowlist';

module.exports = {
  meta: {fixable: 'code'},
  create(context) {
    // Some files are allowlisted for multiple terms, so caching their content
    // greatly speeds up this rule.
    const fileContent = {};

    /**
     * @param {string} filename
     * @return {string}
     */
    function readFileContent(filename) {
      try {
        return (
          fileContent[filename] ||
          (fileContent[filename] = readFileSync(filename, 'utf-8'))
        );
      } catch (_) {
        return null;
      }
    }

    /**
     * @param {Object} fixer
     * @param {Node} node
     */
    function* removeFromArray(fixer, node) {
      const {text} = context.getSourceCode();
      let [start] = node.range;
      const [, end] = node.range;
      while (/\s/.test(text[start - 1])) {
        start--;
      }
      yield fixer.removeRange([start, end]);

      const after = context.getTokenAfter(node);
      if (after.type === 'Punctuator' && after.value === ',') {
        node = after;
        yield fixer.remove(after);
      }

      const [nextComment] = context.getCommentsAfter(node);
      if (nextComment) {
        const [nextCommentStart] = nextComment.range;
        if (text.substr(end, nextCommentStart - end).indexOf('\n') < 0) {
          yield fixer.remove(nextComment);
        }
      }
    }

    return {
      ['Property' +
      `[key.name='${allowlistProperty}']` +
      "[value.type='ArrayExpression']" +
      "[parent.parent.type='Property']"]: function (node) {
        const termProperty = node.parent.parent;
        const termKey = termProperty.key;

        const termKeyIsIdentifier = termKey.type === 'Identifier';
        if (termProperty.computed || termKeyIsIdentifier) {
          let fix;
          if (!termProperty.computed && termKeyIsIdentifier) {
            // we can replace non-computed ids with string literals
            fix = function (fixer) {
              return fixer.replaceText(termKey, `'${termKey.name}'`);
            };
          }
          context.report({
            node: termKey,
            message: 'Term keys should be string literals.',
            fix,
          });
          return;
        }

        if (node.value.elements.length < 1) {
          context.report({
            node,
            message: `Remove empty ${allowlistProperty}`,
            fix(fixer) {
              return removeFromArray(fixer, node);
            },
          });
          return;
        }

        const termRegexp = new RegExp(termKey.value, 'gm');

        for (const stringLiteral of node.value.elements) {
          if (!stringLiteral.type.endsWith('Literal')) {
            context.report({
              node: stringLiteral,
              message: `${allowlistProperty} should only contain string literals`,
            });
            continue;
          }

          const filename = stringLiteral.value;
          const content = readFileContent(filename);

          if (content && content.match(termRegexp)) {
            continue;
          }

          context.report({
            node: stringLiteral,
            message: content
              ? 'File does not use this term.'
              : 'File does not exist.',
            suggest: [
              {
                desc: `Remove from ${allowlistProperty}`,
                fix(fixer) {
                  return removeFromArray(fixer, stringLiteral);
                },
              },
            ],
          });
        }
      },
    };
  },
};
