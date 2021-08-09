/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {BaseElement} from './base-element';
import {isExperimentOn} from '#experiments';
import {userAssert} from '../../../src/log';
import {dict} from '#core/types/object';
import {measureIntersection} from '#core/dom/layout/intersection';

/** @const {string} */
const TAG = 'amp-iframe';

class AmpIframe extends BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * Keep track if we've already errored on `embed-size` request to resize the iframe.
     * @private {boolean}
     */
    this.hasErroredEmbedSize_ = false;
  }

  /** @override */
  isLayoutSupported(layout) {
    userAssert(
      isExperimentOn(this.win, 'bento') ||
        isExperimentOn(this.win, 'bento-iframe'),
      'expected global "bento" or specific "bento-iframe" experiment to be enabled'
    );
    return super.isLayoutSupported(layout);
  }

  /**
   * Updates the element's dimensions to accommodate the iframe's
   * requested dimensions.
   * @param {number|undefined} height
   * @param {number|undefined} width
   * @private
   */
  updateSize_(height, width) {
    if (!this.element.hasAttribute('resizable')) {
      if (!this.hasErroredEmbedSize_) {
        this.user().error(
          TAG,
          'Ignoring embed-size request because this iframe is not resizable',
          this.element
        );
        this.hasErroredEmbedSize_ = true;
      }
      return;
    }

    if (height < 100) {
      this.user().error(
        TAG,
        'Ignoring embed-size request because the resize height is less ' +
          'than 100px. If you are using amp-iframe to display ads, consider ' +
          'using amp-ad instead.',
        this.element
      );
      return;
    }

    // Calculate new width and height of the container to include the padding.
    // If padding is negative, just use the requested width and height directly.
    let newHeight, newWidth;
    height = parseInt(height, 10);
    if (!isNaN(height)) {
      newHeight = height;
      // newHeight = Math.max(
      //   height +
      //     (this.element./*OK*/ offsetHeight - this.iframe_./*OK*/ offsetHeight),
      //   height
      // );
    }
    width = parseInt(width, 10);
    if (!isNaN(width)) {
      newWidth = width;
      // newWidth = Math.max(
      //   width +
      //     (this.element./*OK*/ offsetWidth - this.iframe_./*OK*/ offsetWidth),
      //   width
      // );
    }

    if (newHeight !== undefined || newWidth !== undefined) {
      this.attemptChangeSize(newHeight, newWidth).then(
        () => {
          if (newHeight !== undefined) {
            this.element.setAttribute('height', newHeight);
          }
          if (newWidth !== undefined) {
            this.element.setAttribute('width', newWidth);
          }
          this.element.overflowCallback(
            /* overflown */ false,
            newHeight,
            newWidth
          );
        },
        () => {}
      );
    } else {
      this.user().error(
        TAG,
        'Ignoring embed-size request because ' +
          'no width or height value is provided',
        this.element
      );
    }
  }

  /** @override */
  init() {
    return dict({
      'onLoadCallback': () => {
        const hasPlaceholder = Boolean(this.getPlaceholder());
        if (hasPlaceholder) {
          this.togglePlaceholder(false);
          return;
        }
        // TODO(dmanek): Extract this to a common function & share
        // between 0.1 and 1.0 versions.
        measureIntersection(this.element).then((intersectionEntry) => {
          const {top} = intersectionEntry.boundingClientRect;
          const viewportHeight = intersectionEntry.rootBounds.height;
          const minTop = Math.min(600, viewportHeight * 0.75);
          userAssert(
            top >= minTop,
            '<amp-iframe> elements must be positioned outside the first 75% ' +
              'of the viewport or 600px from the top (whichever is smaller): %s ' +
              ' Current position %s. Min: %s' +
              "Positioning rules don't apply for iframes that use `placeholder`." +
              'See https://github.com/ampproject/amphtml/blob/main/extensions/' +
              'amp-iframe/amp-iframe.md#iframe-with-placeholder for details.',
            this.element,
            top,
            minTop
          );
        });
      },
      'requestResize': (height, width) => {
        this.updateSize_(height, width);
      },
    });
  }
}

AMP.extension(TAG, '1.0', (AMP) => {
  AMP.registerElement(TAG, AmpIframe);
});
