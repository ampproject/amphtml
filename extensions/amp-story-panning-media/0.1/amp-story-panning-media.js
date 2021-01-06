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

    /** @public {?Element} */
    this.image = null;

    /** @private {?string} */
    this.x_ = null;

    /** @private {?string} */
    this.y_ = null;

    /** @private {?string} */
    this.zoom_ = null;

    /** @private {?string} */
    this.activeX_ = null;

    /** @private {?string} */
    this.activeY_ = null;

    /** @private {?string} */
    this.activeZoom_ = null;

    /** @private {Array<Element>} */
    this.siblings_ = [];

    /** @private {?boolean} */
    this.isOnActivePage_ = null;
  }

  /** @override */
  buildCallback() {
    this.x_ = this.element_.getAttribute('x') || '0%';
    this.y_ = this.element_.getAttribute('y') || '0%';
    this.zoom_ = this.element_.getAttribute('zoom') || '1';

    // Gets components with same children.
    document.querySelectorAll('amp-story-panning-media').forEach((sibling) => {
      sibling.getImpl().then((siblingImpl) => {
        this.siblings_.push(siblingImpl);
      });
    });

    // Initialize all services before proceeding
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        storeService.subscribe(StateProperty.CURRENT_PAGE_ID, (currPageId) => {
          this.isOnActivePage_ = currPageId === this.getPageId_();
          this.update_();
        });
      }),
    ]).then(() => Promise.resolve());
  }

  /** @override */
  layoutCallback() {
    this.ampImgEl = dev().assertElement(this.element_.querySelector('amp-img'));
    return whenUpgradedToCustomElement(this.ampImgEl)
      .then(() => this.ampImgEl.signals().whenSignal(CommonSignals.LOAD_END))
      .then(() => {
        this.image = dev().assertElement(this.element.querySelector('img'));
        // Remove layout="fill" classes so image is not clipped.
        this.image.classList = '';
        // Fill image to 100% height of viewport.
        // TODO(#31515): Handle base zoom of aspect ratio wider than image
        setStyles(this.image, {height: '100%'});
        return this.updateTransform();
      })
      .catch(() => user().error(TAG, 'Failed to load the amp-img.'));
  }

  /** @private */
  update_() {
    if (this.isOnActivePage_) {
      this.siblings_.forEach((siblingImpl) => {
        siblingImpl.activeX_ = this.x_;
        siblingImpl.activeY_ = this.y_;
        siblingImpl.activeZoom_ = this.zoom_;
        if (siblingImpl.image) {
          siblingImpl.updateTransform();
        }
      });
    }
  }

  /**
   * @return {!Promise}
   * @public
   */
  updateTransform() {
    return this.mutateElement(() => {
      setStyles(this.image, {
        transform: `scale(${this.activeZoom_}) translate(${this.activeX_}, ${this.activeY_})`,
      });
    });
  }

  /**
   * @return {string} the page id
   * @private
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
