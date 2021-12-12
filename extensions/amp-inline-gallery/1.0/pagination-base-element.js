import {CSS} from './pagination.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {BentoInlineGalleryPagination} from './pagination';
import {PreactBaseElement} from '#preact/base-element';

export const TAG = 'bento-inline-gallery-pagination';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class PaginationBaseElement extends PreactBaseElement {}

/** @override */
PaginationBaseElement['Component'] = BentoInlineGalleryPagination;

/** @override */
PaginationBaseElement['props'] = {
  'inset': {attr: 'inset', type: 'boolean', media: true},
};

/** @override */
PaginationBaseElement['layoutSizeDefined'] = true;

/** @override */
PaginationBaseElement['shadowCss'] = CSS;

/** @override */
PaginationBaseElement['usesShadowDom'] = true;

/** @override */
PaginationBaseElement['useContexts'] = [CarouselContextProp];
