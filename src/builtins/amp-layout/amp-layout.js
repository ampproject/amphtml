

import {Layout, applyFillContent, isLayoutSizeDefined} from '#core/dom/layout';
import {realChildNodes} from '#core/dom/query';

import {registerElement} from '#service/custom-element-registry';

import {BaseElement} from '../../base-element';
import {getEffectiveLayout} from '../../static-layout';

export class AmpLayout extends BaseElement {
  /** @override @nocollapse */
  static prerenderAllowed() {
    return true;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER || isLayoutSizeDefined(layout);
  }

  /** @override */
  buildCallback() {
    buildDom(this.element);
  }
}

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

/**
 * @param {!Window} win Destination window for the new element.
 */
export function installLayout(win) {
  registerElement(win, 'amp-layout', AmpLayout);
}
