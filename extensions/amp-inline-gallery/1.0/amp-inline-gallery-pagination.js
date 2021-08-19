import {CSS} from './pagination.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {Pagination} from './pagination';
import {PreactBaseElement} from '#preact/base-element';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
export const TAG = 'amp-inline-gallery-pagination';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class AmpInlineGalleryPagination extends PreactBaseElement {
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

/** @override */
AmpInlineGalleryPagination['Component'] = Pagination;

/** @override */
AmpInlineGalleryPagination['props'] = {
  'inset': {attr: 'inset', type: 'boolean', media: true},
};

/** @override */
AmpInlineGalleryPagination['layoutSizeDefined'] = true;

/** @override */
AmpInlineGalleryPagination['shadowCss'] = CSS;

/** @override */
AmpInlineGalleryPagination['usesShadowDom'] = true;

/** @override */
AmpInlineGalleryPagination['useContexts'] = [CarouselContextProp];
