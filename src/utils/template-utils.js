/**
 * @fileoverview Utils for supporting <template> element in for Bento web components like bento-date-display.
 */

/**
 * @param {string} str string with backticks
 * @return {string} string with escaped backticks for use in template strings
 */
function escapeBackticks(str) {
  return str.replaceAll('`', '\\`');
}

/**
 * @param {Object} data
 * @return {string}
 */
function getVariablesAsString(data) {
  let variables = '';
  for (const [key, value] of Object.entries(data)) {
    variables += `const ${key} = '${value}';`;
  }
  return variables;
}

/**
 * @param {HTMLTemplateElement} template
 * @return {string}
 */
function getTemplateContentsAsString(template) {
  let templateStr = '';
  // `template.content` returns a Document Fragment, so iterate over it's
  // children to return as a string.
  for (let i = 0; i < template.content.children.length; i++) {
    templateStr += template.content.children[i]./*OK*/ outerHTML;
  }
  return templateStr;
}

/**
 * @param {HTMLElement} element
 * @return {HTMLTemplateElement|null}
 */
export function getTemplateElement(element) {
  return element.hasAttribute('template')
    ? element.ownerDocument.getElementById(element.getAttribute('template'))
    : element.querySelector('template');
}

/**
 *
 * @param {Object} data
 * @param {HTMLTemplateElement} template
 * @return {Function}
 */
export function getTemplateFunction(data, template) {
  const variables = getVariablesAsString(data);
  const templateContents = getTemplateContentsAsString(template);
  return new Function(
    `${variables} return \`${escapeBackticks(templateContents)}\`;`
  );
}
