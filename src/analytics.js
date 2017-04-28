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
import {getAmpdoc} from './service';
import {extensionsFor} from './services';


/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @param {boolean=} loadAnalytics
 * @return {!Promise<!../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsForDoc(nodeOrDoc, loadAnalytics = false) {
  if (loadAnalytics) {
    // Get Extensions service and force load analytics extension.
    const ampdoc = getAmpdoc(nodeOrDoc);
    extensionsFor(ampdoc.win)./*OK*/loadExtension('amp-analytics');
  }
  return (/** @type {!Promise<
            !../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementServiceForDoc(
                nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
}

/**
 * @param {!Node|!./service/ampdoc-impl.AmpDoc} nodeOrDoc
 * @return {!Promise<?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService>}
 */
export function analyticsForDocOrNull(nodeOrDoc) {
  return (/** @type {!Promise<
            ?../extensions/amp-analytics/0.1/instrumentation.InstrumentationService
          >} */ (getElementServiceIfAvailableForDoc(
                nodeOrDoc, 'amp-analytics-instrumentation', 'amp-analytics')));
}

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

/**
 * Method to create scoped analytics element for any element.
 * @param {!Element} parentElement
 * @param {!JSONType} config
 * @param {boolean=} loadAnalytics
 * @return {!Element} created analytics element
 */
export function insertAnalyticsElement(
    parentElement, config, loadAnalytics = false) {
  const doc = /** @type {!Document} */ (parentElement.ownerDocument);
  const analyticsElem = createElementWithAttributes(
      doc,
      'amp-analytics', {
        'sandbox': 'true',
        'trigger': 'immediate',
      });
  const scriptElem = createElementWithAttributes(
      doc,
      'script', {
        'type': 'application/json',
      });
  scriptElem.textContent = JSON.stringify(config);
  analyticsElem.appendChild(scriptElem);
  analyticsElem.CONFIG = config;

  // Force load analytics extension if script not included in page.
  if (loadAnalytics) {
    // Get Extensions service and force load analytics extension.
    const extensions = extensionsFor(parentElement.ownerDocument.defaultView);
    extensions./*OK*/loadExtension('amp-analytics');
  } else {
    analyticsForDocOrNull(parentElement).then(analytics => {
      dev().assert(analytics);
    });
  }
  parentElement.appendChild(analyticsElem);
  return analyticsElem;
}
