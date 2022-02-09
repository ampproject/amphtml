import {escapeCssSelectorIdent} from '#core/dom/css-selectors';

/**
 * @param {HTMLElement} element
 * @return {HTMLTemplateElement|null}
 */
export function getTemplate(element, attribute = 'template') {
  if (element.hasAttribute(attribute)) {
    const id = element.getAttribute(attribute);
    return Boolean(id)
      ? element.ownerDocument.querySelector(
          `template#${escapeCssSelectorIdent(id)}`
        )
      : null;
  }
  return element.querySelector('template');
}
