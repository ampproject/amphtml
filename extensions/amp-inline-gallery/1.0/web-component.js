import {BaseElement, TAG} from './base-element';
import {
  TAG as THUMBNAIL_TAG,
  ThumbnailsBaseElement,
} from './thumbnails-base-element';
import {
  TAG as PAGINATION_TAG,
  PaginationBaseElement,
} from './pagination-base-element';
import {CSS as PAGINATION_CSS} from '#build/bento-inline-gallery-pagination-1.0.css.js';

/**
 * Registers `<bento-inline-gallery> component to CustomElements registry
 */
export function defineElement() {
  installStyles(CSS);
  customElements.define(TAG, BaseElement.CustomElement(BaseElement));
  defineThumbnailsElement();
  definePaginationElement();
}

/**
 * Registers `<bento-inline-gallery-pagination> component to CustomElements registry
 */
export function definePaginationElement() {
  installStyles(PAGINATION_CSS);
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

/**
 * Creates and populates `<style>` with given css and appends to document head
 * @param {string} cssString stringified css
 */
function installStyles(cssString) {
  const style = document.createElement('style');
  style.textContent = cssString;
  document.head.appendChild(style);
}
