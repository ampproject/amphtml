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

import {CSS} from '../../../build/amp-story-panning-media-0.1.css';
import {CommonSignals} from '../../../src/common-signals';
import {Layout} from '../../../src/layout';
import {StateProperty} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {dev, user} from '../../../src/log';
import {setStyles} from '../../../src/style';
import {whenUpgradedToCustomElement} from '../../../src/dom';

/** @const {string} */
const TAG = 'AMP_STORY_PANNING_MEDIA';

export class AmpStoryPanningMedia extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.element_ = element;

    /** @private {?Element} The element that is transitioned. */
    this.ampImgEl_ = dev().assertElement(
      this.element_.querySelector('amp-img')
    );

    /** @private {?string} Sent to siblings to update their position. */
    this.x = this.element_.getAttribute('x') || '0%';

    /** @private {?string} Sent to siblings to update their position. */
    this.y = this.element_.getAttribute('y') || '0%';

    /** @private {?string} Sent to siblings to update their position. */
    this.zoom = this.element_.getAttribute('zoom') || '1';

    /** @private {Array<Element>} */
    this.siblings_ = [];
  }

  /** @override */
  buildCallback() {
    this.getSiblings_().then((siblings_) => {
      this.siblings_ = siblings_;
    });

    return Services.storyStoreServiceForOrNull(this.win).then(
      (storeService) => {
        storeService.subscribe(StateProperty.CURRENT_PAGE_ID, (currPageId) => {
          const isOnActivePage = currPageId === this.getPageId_();
          if (isOnActivePage) {
            this.updateSiblings_();
          }
        });
      }
    );
  }

  /** @override */
  layoutCallback() {
    return whenUpgradedToCustomElement(this.ampImgEl_)
      .then(() => this.ampImgEl_.signals().whenSignal(CommonSignals.LOAD_END))
      .then(() => {
        const imgEl = dev().assertElement(this.element_.querySelector('img'));
        // Remove layout="fill" classes so image is not clipped.
        imgEl.classList = '';
        // Centers the amp-img horizontally. The image does not load if this is done in CSS.
        // TODO(#31515): Handle base zoom of aspect ratio wider than image
        setStyles(this.ampImgEl_, {
          left: 'auto',
          right: 'auto',
        });
        return Promise.resolve();
      })
      .catch(() => user().error(TAG, 'Failed to load the amp-img.'));
  }

  /**
   * @return {!Promise<Array<Element>>}
   */
  getSiblings_() {
    // TODO Group siblings to be transitioned together #31932
    const siblings = Array.from(
      document.querySelectorAll('amp-story-panning-media')
    );

    return Promise.all(
      siblings.map((sibling) =>
        sibling.getImpl().then((siblingImpl) => siblingImpl)
      )
    ).then((siblings) => Promise.resolve(siblings));
  }

  /** @private */
  updateSiblings_() {
    this.siblings_.forEach((siblingImpl) => {
      siblingImpl.updateTransform_(this.x, this.y, this.zoom);
    });
  }

  /**
   * The active page's instance calls this and passes it's position values.
   * @private
   * @param {x} string
   * @param {y} string
   * @param {z} string
   * @return {!Promise}
   */
  updateTransform_(x, y, zoom) {
    return this.mutateElement(() => {
      setStyles(this.ampImgEl_, {
        transform: `scale(${zoom}) translate(${x}, ${y})`,
      });
    });
  }

  /**
   * @private
   * @return {string} the page id
   */
  getPageId_() {
    if (this.pageId_ == null) {
      this.pageId_ = closest(
        dev().assertElement(this.element),
        (el) => el.tagName.toLowerCase() === 'amp-story-page'
      ).getAttribute('id');
    }
    return this.pageId_;
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout == Layout.FILL;
  }
}

AMP.extension('amp-story-panning-media', '0.1', (AMP) => {
  AMP.registerElement('amp-story-panning-media', AmpStoryPanningMedia, CSS);
});
