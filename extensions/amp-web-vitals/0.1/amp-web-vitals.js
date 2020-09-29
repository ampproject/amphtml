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

import {Layout} from '../../../src/layout';
import {childElementsByTag, isJsonScriptTag} from '../../../src/dom';
import {
  getCLS,
  getFCP,
  getFID,
  getLCP,
  getTTFB,
} from '../../../third_party/web-vitals/web-vitals';
import {tryParseJson} from '../../../src/json';
import {user, userAssert} from '../../../src/log';

const TAG = 'amp-web-vitals';
const CONFIG_TYPE = ['local', 'remote'];

export class AmpWebVitals extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);
  }

  /**
   * Get config
   * @private
   * @return {?*} Config JSON object, or null if there some issues with the properties
   */
  getConfig_() {
    const inlineConfig = this.getInlineConfig_();
    if (!inlineConfig) {
      user().error(TAG, `The inline config is empty`);
      return null;
    }

    if (!inlineConfig.type) {
      user().error(TAG, `The type property is required in the JSON config`);
      return null;
    }

    if (!CONFIG_TYPE.includes(inlineConfig.type)) {
      user().error(TAG, `The type property is incorrect`);
      return null;
    }

    if (!inlineConfig.url) {
      user().error(TAG, `The url property is required in the JSON config`);
      return null;
    }

    if (inlineConfig.url === 'remote' && !inlineConfig.remote_service_url) {
      user().error(
        TAG,
        `The remote_service_url property is required if the type is local in the JSON config`
      );
      return null;
    }

    if (inlineConfig.tags && !Array.isArray(inlineConfig.tags)) {
      user().error(TAG, `The tags property should be an array of strings`);
      return null;
    }
    return inlineConfig;
  }

  /**
   * Reads the inline config from the element.
   * @return {?*} Config JSON object, or null if no inline config specified.
   * @private
   */
  getInlineConfig_() {
    const scriptElements = childElementsByTag(this.element, 'SCRIPT');
    if (!scriptElements.length) {
      return null;
    }
    userAssert(
      scriptElements.length === 1,
      `${TAG} should contain at most one <script> child`
    );
    const scriptElement = scriptElements[0];
    userAssert(
      isJsonScriptTag(scriptElement),
      `${TAG} config should ` +
        'be inside a <script> tag with type="application/json"'
    );
    return tryParseJson(scriptElement.textContent, (error) => {
      user().error(TAG, 'failed to parse config', error);
    });
  }

  /** @override */
  buildCallback() {
    this.config_ = this.getConfig_();
    if (!this.config_) {
      return null;
    }

    if (this.config_.type === 'remote') {
      getCLS(this.sendToAnalytics.bind(this), true);
      getFID(this.sendToAnalytics.bind(this));
      getLCP(this.sendToAnalytics.bind(this), true);
      getFCP(this.sendToAnalytics.bind(this));
      getTTFB(this.sendToAnalytics.bind(this));
    }

    if (this.config_.type === 'local') {
      getCLS(console.log, true);
      getFID(console.log);
      getLCP(console.log, true);
      getFCP(console.log);
      getTTFB(console.log);
    }
  }

  /**
   * Send to Analytics
   * @param {Object} metric
   */
  sendToAnalytics(metric) {
    // Amend payload with URL and blog_id
    metric.url = this.config_.url; // This is normalized

    if (this.config_.tags) {
      metric.tags = this.config_.tags;
    }

    const body = JSON.stringify(metric);
    // Use `navigator.sendBeacon()` if available, falling back to `fetch()`.
    const rumUrl = this.config_.remote_service_url;
    /* eslint-disable no-unused-expressions */
    (navigator.sendBeacon && navigator.sendBeacon(rumUrl, body)) ||
      fetch(rumUrl, {
        body,
        mode: 'cors',
        method: 'POST',
        keepalive: true,
        headers: {
          'Content-Type': 'application/json',
        },
      });
  }

  /** @override */
  isLayoutSupported(layout) {
    return layout === Layout.NODISPLAY;
  }
}

AMP.extension('amp-web-vitals', '0.1', (AMP) => {
  AMP.registerElement('amp-web-vitals', AmpWebVitals);
});
