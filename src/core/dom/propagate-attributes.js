import {arrayOrSingleItemToArray} from '#core/types/array';

/**
 * Utility method that propagates attributes from a source element
 * to an updateable element.
 * If `opt_removeMissingAttrs` is true, then also removes any specified
 * attributes that are missing on the source element from the updateable element.
 * @param {string|Array<string>} attributes
 * @param {Element} sourceElement
 * @param {Element} updateElement
 * @param {boolean=} opt_removeMissingAttrs
 */
export function propagateAttributes(
  attributes,
  sourceElement,
  updateElement,
  opt_removeMissingAttrs
) {
  const attrs = arrayOrSingleItemToArray(attributes);
  for (const attr of attrs) {
    const val = sourceElement.getAttribute(attr);
    if (null !== val) {
      updateElement.setAttribute(attr, val);
    } else if (opt_removeMissingAttrs) {
      updateElement.removeAttribute(attr);
    }
  }
}
