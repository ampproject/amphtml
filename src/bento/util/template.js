/**
 * @param {HTMLElement} element
 * @return {HTMLTemplateElement|null}
 */
export function getTemplate(element) {
  return element.hasAttribute('template')
    ? element.ownerDocument.getElementById(element.getAttribute('template'))
    : element.querySelector('template');
}
