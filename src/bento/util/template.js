import {escapeCssSelectorIdent} from '#core/dom/css-selectors';

/**
 * @param {HTMLElement} element
 * @return {HTMLTemplateElement|null}
 */
export function getTemplate(element) {
  if (element.hasAttribute('template')) {
    const id = element.getAttribute('template');
    return Boolean(id)
      ? element.ownerDocument.querySelector(
          `template#${escapeCssSelectorIdent(id)}`
        )
      : null;
  }
  return element.querySelector('template');
}
