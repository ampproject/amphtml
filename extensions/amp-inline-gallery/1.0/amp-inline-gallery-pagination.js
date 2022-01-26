import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {PaginationBaseElement} from './pagination-base-element';

/** @const {string} */
export const TAG = 'amp-inline-gallery-pagination';

export class AmpInlineGalleryPagination extends setSuperClass(
  PaginationBaseElement,
  AmpPreactBaseElement
) {}
