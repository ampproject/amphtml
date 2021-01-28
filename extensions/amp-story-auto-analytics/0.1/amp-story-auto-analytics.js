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

import {Services} from '../../../src/services';
import {buildGtagConfig} from './auto-analytics-configs.js';
import {devAssert} from '../../../src/log';
import {htmlFor} from '../../../src/static-template';

const buildAutoAnalyticsTemplate = (element) => {
  const html = htmlFor(element);
  return html` <amp-analytics data-credentials="include" type="gtag">
    <script type="application/json"></script>
  </amp-analytics>`;
};

export class AmpStoryAutoAnalytics extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /** @override */
  buildCallback() {
    Services.extensionsFor(this.win).installExtensionForDoc(
      this.getAmpDoc(),
      'amp-analytics'
    );
    const analyticsEl = buildAutoAnalyticsTemplate(this.element);
    const configEl = analyticsEl.querySelector('script');
    const gtagId = devAssert(this.element.getAttribute('gtag-id'));
    const analyticsJson = buildGtagConfig(gtagId);
    configEl.textContent = JSON.stringify(analyticsJson);
    this.element.appendChild(analyticsEl);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }
}

AMP.extension('amp-story-auto-analytics', '0.1', (AMP) => {
  AMP.registerElement('amp-story-auto-analytics', AmpStoryAutoAnalytics);
});
