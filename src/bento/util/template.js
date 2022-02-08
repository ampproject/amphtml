/**
 * @param {HTMLElement} element
 * @return {HTMLTemplateElement|null}
 */
export function getTemplate(element) {
  if (element.hasAttribute('template')) {
    const id = element.getAttribute('template')
    return element.ownerDocument.querySelector(`template#${id}`);
  }
  return element.querySelector('template');
}
