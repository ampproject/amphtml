import {CSS as CAROUSEL_CSS} from '../../amp-base-carousel/1.0/component.jss';
import {CarouselContextProp} from '../../amp-base-carousel/1.0/carousel-props';
import {PreactBaseElement} from '#preact/base-element';
import {CSS as THUMBNAIL_CSS} from './thumbnails.jss';
import {BentoInlineGalleryThumbnails} from './thumbnails';

export const TAG = 'bento-inline-gallery-thumbnails';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class ThumbnailsBaseElement extends PreactBaseElement {}

/** @override */
ThumbnailsBaseElement['Component'] = BentoInlineGalleryThumbnails;

/** @override */
ThumbnailsBaseElement['props'] = {
  'aspectRatio': {attr: 'aspect-ratio', type: 'number', media: true},
  'children': {passthroughNonEmpty: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
};

/** @override */
ThumbnailsBaseElement['layoutSizeDefined'] = true;

/** @override */
ThumbnailsBaseElement['usesShadowDom'] = true;

/** @override */
ThumbnailsBaseElement['shadowCss'] = CAROUSEL_CSS + THUMBNAIL_CSS;

/** @override */
ThumbnailsBaseElement['useContexts'] = [CarouselContextProp];
