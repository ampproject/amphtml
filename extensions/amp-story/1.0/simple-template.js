import {createElementWithAttributes} from '#core/dom';

/**
 * @typedef {{
 *   tag: string,
 *   attrs: (!JsonObject|undefined),
 *   children: (!Array<!ElementDef|string|null>|undefined),
 * }}
 */
export let ElementDef;

/**
 * @param {!Document} doc
 * @param {!ElementDef} elementDef
 * @return {!Element}
 */
export function renderAsElement(doc, elementDef) {
  const el = createElementWithAttributes(
    doc,
    elementDef.tag,
    /** @type {!JsonObject} */ (elementDef.attrs || {})
  );
  elementDef.children?.forEach((child) => {
    if (child) {
      el.appendChild(
        typeof child === 'string'
          ? document.createTextNode(child)
          : renderAsElement(doc, child)
      );
    }
  });
  return el;
}
