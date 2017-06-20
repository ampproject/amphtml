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

import {CommonSignals} from './common-signals';
import {
  getElementServiceForDoc,
  getElementServiceIfAvailableForDoc,
} from './element-service';
import {
  createElementWithAttributes,
  removeElement,
  whenUpgradedToCustomElement,
} from './dom';
import {getAmpdoc} from './service';
import {extensionsFor} from './services';
import {dev} from './log';
import {dict} from './utils/object';
import {isArray} from './types';

const BUFFER_SIZE_LIMIT = 50;
const TAG = 'SANDBOX-ANALYTICS-ADAPTER';


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
 * TODO: Do not expose this function
 * @param {!Element} target
 * @param {string} eventType
 * @param {!Object<string, string>=} opt_vars A map of vars and their values.
 */
export function triggerAnalyticsEvent(target, eventType, opt_vars) {
  analyticsForDocOrNull(target).then(analytics => {
    if (!analytics) {
      return;
    }
    analytics.triggerEventForTarget(target, eventType, opt_vars);
  });
}

/**
 * Method to create scoped analytics element for any element.
 * @param {!Element} parentElement
 * @param {!JsonObject} config
 * @param {boolean=} loadAnalytics
 * @return {!Element} created analytics element
 */
export function insertAnalyticsElement(
    parentElement, config, loadAnalytics = false) {
  const doc = /** @type {!Document} */ (parentElement.ownerDocument);
  const analyticsElem = createElementWithAttributes(
      doc,
      'amp-analytics', dict({
        'sandbox': 'true',
        'trigger': 'immediate',
      }));
  const scriptElem = createElementWithAttributes(
      doc,
      'script', dict({
        'type': 'application/json',
      }));
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

/**
 * A class that handles customEvent reporting of extension element through
 * amp-analytics.
 * This class is not exposed to extension element directly to restrict the genration of the config
 * Please use CustomEventReporterBuilder to build a CustomEventReporter instance.
 */
class CustomEventReporter {
  /**
   * @param {!Element} parent
   * @param {!JsonObject} config
   */
  constructor(parent, config) {
    dev().assert(config['triggers'], 'Config must have triggers defined');
    /** @private {string} */
    this.id_ = parent.getResourceId();

    /** @private {!AmpElement} */
    this.parent_ = parent;

    /** @private {JsonObject} */
    this.config_ = config;

    for (const event in config['triggers']) {
      const eventType = config['triggers'][event]['on'];
      dev().assert(eventType,
          'CustomEventReporter config must specify trigger eventType');
      const newEventType = this.getEventTypeInSandbox_(eventType);
      config['triggers'][event]['on'] = newEventType;
    }

    this.parent_.signals().whenSignal(CommonSignals.LOAD_START).then(() => {
      insertAnalyticsElement(this.parent_, config, false);
    });
  }

  /**
   * @param {string} eventType
   * @param {!Object<string, string>=} opt_vars A map of vars and their values.
   */
  trigger(eventType, opt_vars) {
    dev().assert(this.config_['triggers'][eventType],
        'Cannot trigger non initiated eventType');
    triggerAnalyticsEvent(this.parent_,
        this.getEventTypeInSandbox_(eventType), opt_vars);
  }

  /**
   * @param {string} eventType
   * @return {string}
   */
  getEventTypeInSandbox_(eventType) {
    return `sandbox-${this.id_}-${eventType}`;
  }
}


/**
 * A builder class that enable extension elements to easily build a CustomEventReporter instance
 */
export class CustomEventReporterBuilder {
  /** @param {!AmpElement} parent */
  constructor(parent) {
    /** @private {!AmpElement} */
    this.parent_ = parent;

    /** @private {?JsonObject} */
    this.config_ = /** @type {JsonObject} */ ({
      'requests': {},
      'triggers': {},
    });
  }

  /**
   * @param {string} eventType
   * @param {string|!Array<string>} request
   */
  track(eventType, request) {
    request = isArray(request) ? request : [request];
    dev().assert(!this.config_['triggers'][eventType],
        'customEventReporterBuilder should not track same eventType twice');
    const requestList = [];
    for (let i = 0; i < request.length; i++) {
      const requestName = `${eventType}-request-${i}`;
      this.config_['requests'][requestName] = request[i];
      requestList.push(requestName);
    }
    this.config_['triggers'][eventType] = {
      'on': eventType,
      'request': requestList,
    };
    return this;
  }

  /**
   * Call to build the CustomEventReporter instance.
   * Should only be called after all eventType added.
   */
  build() {
    dev().assert(this.config_, 'CustomEventReporter already built');
    const report = new CustomEventReporter(
        this.parent_, /** @type {!JsonObject} */ (this.config_));
    this.config_ = null;
    return report;
  }
}
