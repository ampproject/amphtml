import * as Preact from '#preact';
import {
  AmpInlineGalleryPagination,
  TAG as PAGINATION_TAG,
} from './amp-inline-gallery-pagination';
import {
  AmpInlineGalleryThumbnails,
  TAG as THUMBNAILS_TAG,
} from './amp-inline-gallery-thumbnails';
import {Layout_Enum} from '#core/dom/layout';
import {CSS as PAGINATION_CSS} from '../../../build/amp-inline-gallery-pagination-1.0.css';
import {isExperimentOn} from '#experiments';
import {userAssert} from '#utils/log';

import {Component, ContextExporter, detached, props} from './element';
import {AmpPreactBaseElement} from '#preact/amp-base-element';
import {dict} from '#core/types/object';

/** @const {string} */
const TAG = 'amp-inline-gallery';

class AmpInlineGallery extends AmpPreactBaseElement {
  /** @override */
  init() {
    return dict({
      'children': <ContextExporter shimDomElement={this.element} />,
    });
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-inline-gallery'),
      'expected global "bento" or specific "bento-inline-gallery" experiment to be enabled'
    );
    return layout == Layout_Enum.CONTAINER;
  }
}

/** @override */
AmpInlineGallery['Component'] = Component;

/** @override */
AmpInlineGallery['detached'] = detached;

/** @override */
AmpInlineGallery['props'] = props;

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInlineGallery);
  AMP.registerElement(
    PAGINATION_TAG,
    AmpInlineGalleryPagination,
    PAGINATION_CSS
  );
  AMP.registerElement(THUMBNAILS_TAG, AmpInlineGalleryThumbnails);
});
