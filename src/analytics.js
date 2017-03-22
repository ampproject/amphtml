/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
  getElementServiceForDoc,
  getElementServiceIfAvailableForDoc,
} from './element-service';
import {createElementWithAttributes} from './dom';
import {extensionsFor} from './extensions';


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsForDoc(nodeOrDoc) {
  return (/** @type {!Promise<
            !../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementServiceForDoc(
                nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
};

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsForDocOrNull(nodeOrDoc) {
  return (/** @type {!Promise<
            ?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementServiceIfAvailableForDoc(
                nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
};

/**
 * Helper method to trigger analytics event if amp-analytics is available.
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {string} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 */
export function triggerAnalyticsEvent(nodeOrDoc, eventType, opt_vars) {
  analyticsForDocOrNull(nodeOrDoc).then(analytics => {
    if (!analytics) {
      return;
    }
    analytics.triggerEvent(eventType, opt_vars);
  });
}

export class ExtensionAnalytics {

  /**
   * @param {!Element} parentElement
   * @param {boolean=} opt_loadAnalytics
   */
  constructor(parentElement, opt_loadAnalytics) {
    /** @private {!Element} */
    this.parentElement_ = parentElement;

    /** @private {boolean} */
    this.loadAnalytics_ = opt_loadAnalytics || false;

    /** @private {!Array<!Element>} */
    this.analyticsElements_ = [];
  }

  /**
   *
   * @param {!JSONType} config
   */
  insertAnalyticsElement(config) {
    const doc = this.parentElement_.ownerDocument;
    const analyticsElem = doc.createElement('amp-analytics');
    analyticsElem.setAttribute('scope', 'true');
    const scriptElem = createElementWithAttributes(doc,
          'script', {
            'type': 'application/json',
          });
    scriptElem.textContent = JSON.stringify(config);
    analyticsElem.appendChild(scriptElem);
    analyticsElem.CONFIG = config;

    // Force load analytics extension if script not included in page.
    if (this.loadAnalytics_) {
      // Get Extensions service and force load analytics extension.
      const extensions =
          extensionsFor(this.parentElement_.ownerDocument.defaultView);
      extensions./*OK*/loadExtension('amp-analytics');
      this.parentElement_.appendChild(analyticsElem);
      this.analyticsElements_.push(analyticsElem);
    }

    analyticsForDocOrNull(this.parentElement_).then(analytics => {
      if (!analytics) {
        return;
      }
      this.parentElement_.appendChild(analyticsElem);
      this.analyticsElements_.push(analyticsElem);
    });
  }

  /**
   *
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars
   */
  triggerAnalyticsEvent(eventType, opt_vars) {
    // Note: analytics elements inserted later will not get this event.
    analyticsForDocOrNull(this.parentElement_).then(analytics => {
      if (!analytics) {
        return;
      }
      for (let i = 0; i < this.analyticsElements_.length; i++) {
        analytics.triggerEventForTarget(
            this.analyticsElements_[i], eventType, opt_vars);
      }
    });
  }
}
