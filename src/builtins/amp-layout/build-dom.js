import {Layout, applyFillContent} from '#core/dom/layout';
import {realChildNodes} from '#core/dom/query';

import {getEffectiveLayout} from '../../static-layout';

/**
 * @see amphtml/compiler/types.js for full description
 *
 * @param {!Element} element
 */
export function buildDom(element) {
  const layout = getEffectiveLayout(element);
  if (layout == Layout.CONTAINER) {
    return;
  }

  const doc = element.ownerDocument;
  const container = doc.createElement('div');
  applyFillContent(container);
  realChildNodes(element).forEach((child) => {
    container.appendChild(child);
  });
  element.appendChild(container);
}
