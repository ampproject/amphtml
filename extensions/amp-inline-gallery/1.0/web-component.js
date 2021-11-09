import {BaseElement, TAG} from './base-element';
import {
  TAG as THUMBNAIL_TAG,
  ThumbnailsBaseElement,
} from './thumbnails-base-element';
import {
  TAG as PAGINATION_TAG,
  PaginationBaseElement,
} from './pagination-base-element';

/**
 * Registers `<bento-inline-gallery> component to CustomElements registry
 */
export function defineElement() {
  customElements.define(TAG, BaseElement.CustomElement(BaseElement));
  defineThumbnailsElement();
  definePaginationElement();
}

/**
 * Registers `<bento-inline-gallery-pagination> component to CustomElements registry
 */
export function definePaginationElement() {
  customElements.define(
    PAGINATION_TAG,
    PaginationBaseElement.CustomElement(PaginationBaseElement)
  );
}

/**
 * Registers `<bento-inline-gallery-thumbnails> component to CustomElements registry
 */
export function defineThumbnailsElement() {
  customElements.define(
    THUMBNAIL_TAG,
    ThumbnailsBaseElement.CustomElement(ThumbnailsBaseElement)
  );
}
