

/**
 * @fileoverview Base layer from which other layers in a story page extend from.
 */

import {Layout} from '#core/dom/layout';

/**
 * Base layer template.
 */
export class AmpStoryBaseLayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.CONTAINER;
  }

  /** @override */
  buildCallback() {
    this.element.classList.add('i-amphtml-story-layer');
  }
}
