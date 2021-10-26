import {CarouselContextProp} from '#bento/components/amp-base-carousel/carousel-props';
import {CSS as CAROUSEL_CSS} from '#bento/components/amp-base-carousel/component.jss';

import {isExperimentOn} from '#experiments';

import {PreactBaseElement} from '#preact/base-element';

import {userAssert} from '#utils/log';

import {BentoInlineGalleryThumbnails} from './thumbnails';
import {CSS as THUMBNAIL_CSS} from './thumbnails.jss';

/** @const {string} */
export const TAG = 'amp-inline-gallery-thumbnails';

/** @extends {PreactBaseElement<BaseCarouselDef.CarouselApi>} */
export class AmpInlineGalleryThumbnails extends PreactBaseElement {
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
AmpInlineGalleryThumbnails['Component'] = BentoInlineGalleryThumbnails;

/** @override */
AmpInlineGalleryThumbnails['props'] = {
  'aspectRatio': {attr: 'aspect-ratio', type: 'number', media: true},
  'children': {passthroughNonEmpty: true},
  'loop': {attr: 'loop', type: 'boolean', media: true},
};

/** @override */
AmpInlineGalleryThumbnails['layoutSizeDefined'] = true;

/** @override */
AmpInlineGalleryThumbnails['usesShadowDom'] = true;

/** @override */
AmpInlineGalleryThumbnails['shadowCss'] = CAROUSEL_CSS + THUMBNAIL_CSS;

/** @override */
AmpInlineGalleryThumbnails['useContexts'] = [CarouselContextProp];
