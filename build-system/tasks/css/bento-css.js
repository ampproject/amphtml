const CssSelectorTokenizer = require('css-selector-tokenizer');
const postcss = require('postcss');

/**
 * Renames element selectors in a css-selector-tokenizer tree from amp-* into
 * bento-*.
 * @param {Object<string, *>} node
 * @return {Object<string, *>} Modification is done in-place, but the tree is
 *   returned for convenience.
 */
function renameSelectorTokensRecursive(node) {
  if (node.type === 'element') {
    node.name = node.name.replace(/^amp-/, 'bento-');
  } else if (Array.isArray(node.nodes)) {
    for (const child of node.nodes) {
      renameSelectorTokensRecursive(child);
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
    const renamed = renameSelectorTokensRecursive(parsed);
    rule.selector = CssSelectorTokenizer.stringify(renamed);
  });
}

/**
 * Renames element selectors in a CSS file from amp-* to bento-*
 * @param {string} css
 * @param {string} from
 * @return {!Promise<string>} The transformed CSS source
 */
async function renameSelectorsToBentoTagNames(css, from) {
  const result = await postcss
    .default([renameSelectorPlugin])
    .process(css, {from});
  return result.css;
}

module.exports = {renameSelectorsToBentoTagNames};
