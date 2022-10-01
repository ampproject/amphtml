import {PaginationBaseElement} from '#bento/components/bento-inline-gallery/1.0/pagination-base-element';

import {isExperimentOn} from '#experiments';

import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {userAssert} from '#utils/log';

/** @const {string} */
export const TAG = 'amp-inline-gallery-pagination';

export class AmpInlineGalleryPagination extends setSuperClass(
  PaginationBaseElement,
  AmpPreactBaseElement
) {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-inline-gallery'),
      'expected global "bento" or specific "bento-inline-gallery" experiment to be enabled'
    );
    // Any layout is allowed for Bento, but "fixed-height" is the recommend
    // layout for AMP.
    return super.isLayoutSupported(layout);
  }
}
