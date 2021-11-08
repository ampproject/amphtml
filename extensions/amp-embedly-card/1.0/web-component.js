import {CSS as EMBEDLY_CARD_CSS} from '#build/bento-embedly-card-1.0.css.js';

import {BENTO_TAG, BaseElement} from './base-element';
import {
  BENTO_TAG as EMBEDLY_KEY_BENTO_TAG,
  EmbedlyKeyBaseElement,
} from './key-base-element';

/**
 * Registers `<bento-embedly-card> component to CustomElements registry
 */
export function defineElement() {
  const style = document.createElement('style');
  style.textContent = EMBEDLY_CARD_CSS;
  document.head.appendChild(style);
  customElements.define(BENTO_TAG, BaseElement.CustomElement(BaseElement));

  defineElementEmbedlyKey();
}

/**
 * Registers <bento-embedly-key>` component to CustomElements registry
 */
export function defineElementEmbedlyKey() {
  customElements.define(
    EMBEDLY_KEY_BENTO_TAG,
    EmbedlyKeyBaseElement.CustomElement(EmbedlyKeyBaseElement)
  );
}
