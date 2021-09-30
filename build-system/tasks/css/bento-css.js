const CssSelectorTokenizer = require('css-selector-tokenizer');
const postcss = require('postcss');

/**
 * @param {string} selector
 * @return {string}
 */
function renameTagNamesInSelector(selector) {
  const tree = CssSelectorTokenizer.parse(selector);
  const nodes = [tree];
  while (nodes.length > 0) {
    const node = nodes.pop();
    if (!node) {
      continue;
    }
    if (node.type === 'element') {
      // TODO(alanorozco): This is repeated enough times that it should be a
      // utility function.
      node.name = node.name.replace(/^amp-/, 'bento-');
    }
    if (Array.isArray(node.nodes)) {
      nodes.push(...node.nodes);
    }
  }
  return CssSelectorTokenizer.stringify(tree);
}

/**
 * @param {postcss.Root} root
 */
function renameTagNamesInSelectorPostCssPlugin(root) {
  root.walkRules((rule) => {
    if (rule.selector) {
      rule.selector = renameTagNamesInSelector(rule.selector);
    }
  });
}

/**
 * Renames element selectors in a CSS file from amp-* to bento-*
 * @param {string} css
 * @return {!Promise<string>} The transformed CSS source
 */
async function renameSelectorsToBentoTagNames(css) {
  const result = await postcss
    .default([renameTagNamesInSelectorPostCssPlugin])
    .process(css);
  return result.css;
}

module.exports = {renameSelectorsToBentoTagNames};
