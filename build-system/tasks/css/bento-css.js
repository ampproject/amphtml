const CssWhat = require('css-what');
const postcss = require('postcss');
const traverse = require('traverse');
const {getBentoName} = require('../bento-helpers');

/**
 * @param {string} selector
 * @return {string}
 */
function renameTagNamesInSelector(selector) {
  const tree = CssWhat.parse(selector);
  traverse(tree).forEach((node) => {
    if (node?.type === 'tag') {
      node.name = getBentoName(node.name);
    }
  });
  return CssWhat.stringify(tree);
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
