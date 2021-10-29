import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';
import {
  TAG as BENTO_TAG,
  PaginationBaseElement,
} from './pagination-base-element';
import {getAmpName} from './utils';

/** @const {string} */
const TAG = getAmpName(BENTO_TAG);
export {TAG};

export class AmpInlineGalleryPagination extends PaginationBaseElement {
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
