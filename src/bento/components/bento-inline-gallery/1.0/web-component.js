import {defineBentoElement} from '#preact/bento-ce';

import {BaseElement, TAG} from './base-element';
import {
  TAG as PAGINATION_TAG,
  PaginationBaseElement,
} from './pagination-base-element';
import {
  TAG as THUMBNAIL_TAG,
  ThumbnailsBaseElement,
} from './thumbnails-base-element';

/**
 * Registers `<bento-inline-gallery> component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineElement(win) {
  defineBentoElement(TAG, BaseElement, win);
  defineThumbnailsElement(win);
  definePaginationElement(win);
}

/**
 * Registers `<bento-inline-gallery-pagination> component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function definePaginationElement(win) {
  defineBentoElement(PAGINATION_TAG, PaginationBaseElement, win);
}

/**
 * Registers `<bento-inline-gallery-thumbnails> component to CustomElements registry
 * @param {typeof globalThis=} win
 */
export function defineThumbnailsElement(win) {
  defineBentoElement(THUMBNAIL_TAG, ThumbnailsBaseElement, win);
}
