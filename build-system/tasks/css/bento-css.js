const CssSelectorTokenizer = require('css-selector-tokenizer');
const postcss = require('postcss');

/**
 * Renames element selectors in a css-selector-tokenizer tree from amp-* into
 * bento-*.
 * @param {Object<string, *>} node
 * @return {Object<string, *>} Modification is done in-place, but the tree is
 *   returned for convenience.
 */
function renameSelectorTokens(node) {
  /** @type {Object<string, *>[]} */
  const stack = [node];
  while (stack.length > 0) {
    const node = stack.pop();
    // annoying condition for type check
    if (!node) {
      continue;
    }
    if (node.type === 'element') {
      node.name = node.name.replace(/^amp-/, 'bento-');
    }
    if (Array.isArray(node.nodes)) {
      stack.push(...node.nodes);
    }
  }
  return node;
}

/**
 * PostCSS plugin to rename element selectors from amp-* to bento-*
 * @param {postcss.Root} root
 */
function renameSelectorPlugin(root) {
  root.walkRules((rule) => {
    if (!rule.selector) {
      return;
    }
    const parsed = CssSelectorTokenizer.parse(rule.selector);
    const renamed = renameSelectorTokens(parsed);
    rule.selector = CssSelectorTokenizer.stringify(renamed);
  });
}

/**
 * Renames element selectors in a CSS file from amp-* to bento-*
 * @param {string} css
 * @return {!Promise<string>} The transformed CSS source
 */
async function renameSelectorsToBentoTagNames(css) {
  const result = await postcss.default([renameSelectorPlugin]).process(css);
  return result.css;
}

module.exports = {renameSelectorsToBentoTagNames};
