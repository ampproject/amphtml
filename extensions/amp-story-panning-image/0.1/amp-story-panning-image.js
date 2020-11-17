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

import {StateProperty} from '../../../extensions/amp-story/1.0/amp-story-store-service';
import {Services} from '../../../src/services';
import {closest} from '../../../src/dom';
import {dev} from '../../../src/log';
import {isLayoutSizeDefined} from '../../../src/layout';
import {htmlFor} from '../../../src/static-template';

export class AmpStoryPanningImage extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.container_ = null;

    /** @private {?../../../extensions/amp-story/1.0/amp-story-store-service.AmpStoryStoreService} */
    this.storeService_ = null;

    this.pageId_ = null;

    this.siblings_ = null;

    this.isOnActivePage_ = null;

    this.src_ = element.getAttribute('src');
    this.x_ = parseInt(element.getAttribute('x'));
    this.y_ = parseInt(element.getAttribute('y'));
    this.zoom_ = parseInt(element.getAttribute('zoom') || 1);
  }

  /** @override */
  buildCallback() {
    this.container_ = htmlFor(this.element)`
      <div class='wrapper'>
        <div class='scaler'>
          <img class='panner' src="map.png">
        </div>
      </div>
    `;
    this.element.appendChild(this.container_);
    this.container_.querySelector('img').setAttribute('src', this.src_);
    this.applyFillContent(this.container_, /* replacedContent */ true);

    this.siblings_ = Array.from(
      document.querySelectorAll('amp-story-panning-image')
    ).reduce((acc, el) => {
      if (el.getAttribute('src') === this.src_) {
        acc.push(el);
      }
      return acc;
    }, []);

    // Initialize all services before proceeding
    return Promise.all([
      Services.storyStoreServiceForOrNull(this.win).then((storeService) => {
        this.storeService_ = storeService;
        storeService.subscribe(StateProperty.CURRENT_PAGE_ID, (currPageId) => {
          this.isOnActivePage_ = currPageId === this.getPageId_();
          this.update_();
        });
        storeService.subscribe(StateProperty.PAGE_SIZE, () => this.update_());
      }),
    ]).then(() => Promise.resolve());
  }

  update_() {
    // get active siblings attributes
    if (this.isOnActivePage_) {
      this.siblings_.forEach((sibling) => {
        sibling.querySelector(
          '.scaler'
        ).style.transform = `scale(${this.zoom_})`;

        const offsetX = this.x_ * 0.01 * this.element.offsetWidth;
        sibling.querySelector(
          '.panner'
        ).style.transform = `translate(calc(-${this.x_}% + ${offsetX}px), -${this.y_}%)`;
      });
    }
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
    return isLayoutSizeDefined(layout);
  }
}

AMP.extension('amp-story-panning-image', '0.1', (AMP) => {
  AMP.registerElement('amp-story-panning-image', AmpStoryPanningImage);
});
