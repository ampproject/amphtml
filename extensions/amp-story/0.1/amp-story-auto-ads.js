/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {user} from '../../../src/log';


/** @const */
// const EXPERIMENT = 'amp-story-auto-ad';

/** @const */
const TAG = 'amp-story-auto-ads';

export class AmpStoryAutoAds extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?AmpStory} */
    this.ampStory_ = null;
  }

  /** @override */
  buildCallback() {
    const ampStory = this.element.parentElement;
    user().assert(ampStory.tagName === 'AMP-STORY',
        `<${TAG}> should be child of <amp-story>`);
    this.ampStory_ = ampStory;
  }

  /** @override */
  isLayoutSupported() {
    return true;
  }

  /** @override */
  layoutCallback() {
    this.ampStory.appendChild(this.makeMockPage());
  }

  // temporary to be replaced with real page later
  makeMockPage() {
    const ampStoryAdPage = document.createElement('amp-story-page');
    ampStoryAdPage.id = 'i-amphtml-ad-page-1';
    ampStoryAdPage./*OK*/innerHTML = `
      <amp-story-grid-layer template="vertical">
        <h1>First Ad Page</h1>
        <p>This is the first ad shown in this story.</p>
      </amp-story-grid-layer>
      `;
    return ampStoryAdPage;
  }
}

AMP.registerElement('amp-story-auto-ads', AmpStoryAutoAds);
