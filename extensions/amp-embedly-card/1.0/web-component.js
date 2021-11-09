import {BENTO_TAG, BaseElement} from './base-element';
import {
  BENTO_TAG as EMBEDLY_KEY_BENTO_TAG,
  EmbedlyKeyBaseElement,
} from './key-base-element';

/**
 * Registers `<bento-embedly-card> component to CustomElements registry
 */
export function defineElement() {
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
