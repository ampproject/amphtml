/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AmpInlineGalleryPagination,
  TAG as PAGINATION_TAG,
} from './amp-inline-gallery-pagination';
import {
  AmpInlineGalleryThumbnails,
  TAG as THUMBNAILS_TAG,
} from './amp-inline-gallery-thumbnails';
import {BaseElement} from './base-element';
import {Layout} from '../../../src/layout';
import {CSS as PAGINATION_CSS} from '../../../build/amp-inline-gallery-pagination-1.0.css';
import {isExperimentOn} from '../../../src/experiments';
import {userAssert} from '../../../src/log';

/** @const {string} */
const TAG = 'amp-inline-gallery';

class AmpInlineGallery extends BaseElement {
  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-inline-gallery'),
      'expected global "bento" or specific "bento-inline-gallery" experiment to be enabled'
    );
    return layout == Layout.CONTAINER;
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpInlineGallery);
  AMP.registerElement(
    PAGINATION_TAG,
    AmpInlineGalleryPagination,
    PAGINATION_CSS
  );
  AMP.registerElement(THUMBNAILS_TAG, AmpInlineGalleryThumbnails);
});
