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
import {Services} from './services';
import {createElementWithAttributes, removeElement} from './dom';
import {devAssert} from './log';
import {dict} from './utils/object';
import {isArray, toWin} from './types';
import {triggerAnalyticsEvent} from './analytics';

/**
 * Method to create scoped analytics element for any element.
 * TODO: Make this function private
 * @param {!Element} parentElement
 * @param {!JsonObject} config
 * @param {boolean=} loadAnalytics
 * @param {boolean=} disableImmediate
 * @return {!Element} created analytics element
 */
export function insertAnalyticsElement(
  parentElement,
  config,
  loadAnalytics = false,
  disableImmediate = false
) {
  const doc = /** @type {!Document} */ (parentElement.ownerDocument);
  const analyticsElem = createElementWithAttributes(
    doc,
    'amp-analytics',
    dict({
      'sandbox': 'true',
      'trigger': disableImmediate ? '' : 'immediate',
    })
  );
  const scriptElem = createElementWithAttributes(
    doc,
    'script',
    dict({
      'type': 'application/json',
    })
  );
  scriptElem.textContent = JSON.stringify(config);
  analyticsElem.appendChild(scriptElem);
  analyticsElem.CONFIG = config;

  // Force load analytics extension if script not included in page.
  if (loadAnalytics) {
    // Get Extensions service and force load analytics extension.
    const extensions = Services.extensionsFor(
      toWin(parentElement.ownerDocument.defaultView)
    );
    const ampdoc = Services.ampdoc(parentElement);
    extensions./*OK*/ installExtensionForDoc(ampdoc, 'amp-analytics');
  } else {
    Services.analyticsForDocOrNull(parentElement).then(analytics => {
      devAssert(analytics);
    });
  }
  parentElement.appendChild(analyticsElem);
  return analyticsElem;
}

/**
 * A class that handles customEvent reporting of extension element through
 * amp-analytics. This class is not exposed to extension element directly to
 * restrict the genration of the config Please use CustomEventReporterBuilder to
 * build a CustomEventReporter instance.
 */
class CustomEventReporter {
  /**
   * @param {!Element} parent
   * @param {!JsonObject} config
   */
  constructor(parent, config) {
    devAssert(config['triggers'], 'Config must have triggers defined');
    /** @private {string} */
    this.id_ = parent.getResourceId();

    /** @private {!AmpElement} */
    this.parent_ = parent;

    /** @private {JsonObject} */
    this.config_ = config;

    for (const event in config['triggers']) {
      const eventType = config['triggers'][event]['on'];
      devAssert(
        eventType,
        'CustomEventReporter config must specify trigger eventType'
      );
      const newEventType = this.getEventTypeInSandbox_(eventType);
      config['triggers'][event]['on'] = newEventType;
    }

    this.parent_
      .signals()
      .whenSignal(CommonSignals.LOAD_START)
      .then(() => {
        insertAnalyticsElement(this.parent_, config, true);
      });
  }

  /**
   * @param {string} eventType
   * @param {!JsonObject=} opt_vars A map of vars and their values.
   */
  trigger(eventType, opt_vars) {
    devAssert(
      this.config_['triggers'][eventType],
      'Cannot trigger non initiated eventType'
    );
    triggerAnalyticsEvent(
      this.parent_,
      this.getEventTypeInSandbox_(eventType),
      opt_vars
    );
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
 * A builder class that enable extension elements to easily build and get a
 * CustomEventReporter instance. Its constructor requires the parent AMP
 * element. It provides two methods #track() and #build() to build the
 * CustomEventReporter instance.
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
   * @param {!JsonObject} transportConfig
   */
  setTransportConfig(transportConfig) {
    this.config_['transport'] = transportConfig;
  }

  /**
   * @param {!JsonObject} extraUrlParamsConfig
   */
  setExtraUrlParams(extraUrlParamsConfig) {
    this.config_['extraUrlParams'] = extraUrlParamsConfig;
  }

  /**
   * The #track() method takes in a unique custom-event name, and the
   * corresponding request url (or an array of request urls). One can call
   * #track() multiple times with different eventType name (order doesn't
   * matter) before #build() is called.
   * @param {string} eventType
   * @param {string|!Array<string>} request
   */
  track(eventType, request) {
    request = isArray(request) ? request : [request];
    devAssert(
      !this.config_['triggers'][eventType],
      'customEventReporterBuilder should not track same eventType twice'
    );
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
   * Call the #build() method to build and get the CustomEventReporter instance.
   * One CustomEventReporterBuilder instance can only build one reporter, which
   * means #build() should only be called once after all eventType are added.
   */
  build() {
    devAssert(this.config_, 'CustomEventReporter already built');
    const report = new CustomEventReporter(
      this.parent_,
      /** @type {!JsonObject} */ (this.config_)
    );
    this.config_ = null;
    return report;
  }
}

/**
 * A helper method that should be used by all extension elements to add their
 * sandbox analytics tracking. This method takes care of insert and remove the
 * analytics tracker at the right time of the element lifecycle.
 * @param {!AmpElement} element
 * @param {!Promise<!JsonObject>} promise
 */
export function useAnalyticsInSandbox(element, promise) {
  let analyticsElement = null;
  let configPromise = promise;
  // Listener to LOAD_START signal. Insert analytics element on LOAD_START
  element
    .signals()
    .whenSignal(CommonSignals.LOAD_START)
    .then(() => {
      if (analyticsElement || !configPromise) {
        return;
      }
      configPromise.then(config => {
        if (!configPromise) {
          // If config promise resolve after unload, do nothing.
          return;
        }
        configPromise = null;
        analyticsElement = insertAnalyticsElement(element, config, false);
      });
    });

  // Listener to UNLOAD signal. Destroy remove element on UNLOAD
  element
    .signals()
    .whenSignal(CommonSignals.UNLOAD)
    .then(() => {
      configPromise = null;
      if (analyticsElement) {
        removeElement(analyticsElement);
        analyticsElement = null;
      }
    });
}
