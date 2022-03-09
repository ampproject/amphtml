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
 */
export function defineElement() {
  defineBentoElement(TAG, BaseElement);
  defineThumbnailsElement();
  definePaginationElement();
}

/**
 * Registers `<bento-inline-gallery-pagination> component to CustomElements registry
 */
export function definePaginationElement() {
  defineBentoElement(PAGINATION_TAG, PaginationBaseElement);
}

/**
 * Registers `<bento-inline-gallery-thumbnails> component to CustomElements registry
 */
export function defineThumbnailsElement() {
  defineBentoElement(THUMBNAIL_TAG, ThumbnailsBaseElement);
}
