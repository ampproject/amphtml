import {defineBentoElement} from '#preact/bento-ce';

import {BENTO_TAG, BaseElement} from './base-element';
import {
  BENTO_TAG as EMBEDLY_KEY_BENTO_TAG,
  EmbedlyKeyBaseElement,
} from './key-base-element';

/**
 * Registers `<bento-embedly-card> component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineElement(win) {
  defineBentoElement(BENTO_TAG, BaseElement, win);
  defineElementEmbedlyKey(win);
}

/**
 * Registers <bento-embedly-key>` component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineElementEmbedlyKey(win) {
  defineBentoElement(EMBEDLY_KEY_BENTO_TAG, EmbedlyKeyBaseElement, win);
}
