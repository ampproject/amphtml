import {AmpPreactBaseElement, setSuperClass} from '#preact/amp-base-element';

import {ThumbnailsBaseElement} from './thumbnails-base-element';

/** @const {string} */
export const TAG = 'amp-inline-gallery-thumbnails';

export class AmpInlineGalleryThumbnails extends setSuperClass(
  ThumbnailsBaseElement,
  AmpPreactBaseElement
) {}
