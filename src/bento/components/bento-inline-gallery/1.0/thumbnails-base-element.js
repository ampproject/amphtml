import {CarouselContextProp} from '#bento/components/bento-base-carousel/1.0/carousel-props';
import {CSS as CAROUSEL_CSS} from '#bento/components/bento-base-carousel/1.0/component.jss';

import {PreactBaseElement} from '#preact/base-element';

import {BentoInlineGalleryThumbnails} from './thumbnails';
import {CSS as THUMBNAIL_CSS} from './thumbnails.jss';

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
