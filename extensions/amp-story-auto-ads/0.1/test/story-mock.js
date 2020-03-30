/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

import {CommonSignals} from '../../../../src/common-signals';

/**
 * Fake story implementation mocking public methods.
 */
export class MockStoryImpl extends AMP.BaseElement {
  constructor(element) {
    super(element);
    this.element = element;
    this.pages_ = [];
    // Fire these events so that story ads thinks the parent story is ready.
    element.signals().signal(CommonSignals.BUILT);
    element.signals().signal(CommonSignals.INI_LOAD);
  }

  addPage(pageImpl) {
    this.pages_.push(pageImpl);
  }

  getPageById(pageId) {
    return this.pages_.find((page) => page.element.id === pageId);
  }

  // This is not very close to the real implementation as it ignores any
  // advance-to attributes. Should be close enough for testing.
  getNextPage(pageImpl) {
    const index = this.getPageIndexById(pageImpl.element.id);
    return this.pages_[index + 1];
  }

  getPageIndexById(pageId) {
    for (let i = 0; i < this.pages_.length; i++) {
      if (this.pages_[i].element.id === pageId) {
        return i;
      }
    }
  }

  insertPage(unusedPageBeforeId, unusedPageToBeInsertedId) {
    // TODO(ccordry): Implement this when writing test for insertion algo.
  }
}

/**
 * Create amp-story-auto-ads-element with config as a child of the given parent element.
 * @param {!Document} doc
 * @param {!Element} parent
 * @param {Object=} config
 * @return {!Element}
 */
export function createStoryAdElementAndConfig(doc, parent, config) {
  const autoAdsEl = doc.createElement('amp-story-auto-ads');
  addStoryAutoAdsConfig(autoAdsEl, config);
  parent.appendChild(autoAdsEl);
  return autoAdsEl;
}

/**
 * Adds a fake config as a child of the given story element.
 * @param {!Element} parent
 * @param {Object=} customConfig
 */
export function addStoryAutoAdsConfig(parent, customConfig) {
  const config = customConfig || {
    type: 'doubleclick',
    'data-slot': '/30497360/a4a/fake_ad_unit',
  };
  parent./*OK*/ innerHTML = `
    <script type="application/json">
      { "ad-attributes": ${JSON.stringify(config)} }
    </script>
  `;
}

/**
 * Adds story pages to the story object as well as appending them to the DOM.
 * Also fires built signal on created elements.
 * @param {!Document} doc
 * @param {!../../amp-story/1.0/amp-story.AmpStory} storyImpl
 * @param {number=} numPages
 * @return {Promise}
 */
export function addStoryPages(doc, storyImpl, numPages = 3) {
  const {element} = storyImpl;
  const promises = [];
  for (let i = 0; i < numPages; i++) {
    const page = doc.createElement('amp-story-page');
    page.id = 'story-page-' + i;
    element.appendChild(page);
    page.signals().signal(CommonSignals.BUILT);
    const implPromise = page
      .getImpl()
      .then((pageImpl) => storyImpl.addPage(pageImpl));
    promises.push(implPromise);
  }
  return Promise.all(promises);
}

/**
 * Fires `built` signal on elements story ads needs to access. This is necessary
 * so that calls to getImpl() will resolve.
 * @param {!Document} doc
 * @param {Array<string>=} additonalSelectors
 */
export function fireBuildSignals(doc, additonalSelectors = []) {
  const defaultSelectors = ['amp-ad', 'amp-story', 'amp-story-page'];
  const selectors = defaultSelectors.concat(additonalSelectors).join(',');
  doc.querySelectorAll(selectors).forEach((element) => {
    const signals = element.signals();
    signals.signal(CommonSignals.BUILT);
    signals.signal(CommonSignals.INI_LOAD);
  });
}
