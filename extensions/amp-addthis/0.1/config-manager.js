/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {isObject} from '../../../src/types';
import {tryParseJson} from '../../../src/json';
import {getData, listen} from '../../../src/event-helper';
import {startsWith} from '../../../src/string';
import {dict} from '../../../src/utils/object';

import {CONFIGURATION_EVENT, ORIGIN} from './constants';

/**
 * Configuration request status enum.
 * @enum {number}
 */
const RequestStatus = {
  NOT_REQUESTED: 0,
  REQUESTED: 1,
  COMPLETED: 2,
};

/**
 * Utility method to parse out the data from the supplied `postMessage` event.
 */
function getMessageData(event) {
  const data = getData(event);

  if (isObject(data)) {
    return data;
  }

  if (typeof data === 'string' && startsWith(data, '{')) {
    return tryParseJson(data);
  }

  return undefined;
}

/**
 * The ConfigManager manages requests for publishers' dashboard configurations from addthis.com,
 * ensuring that a configuration is requested for a given publisher id at most once, that
 * all relevant amp-addthis iframes are notified when configs are received, etc. The exposed API
 * is specified in the typedef, below; everything else is private. When an AMPElement registers
 * with the ConfigManager, this kicks off a request for the relevant dashboard configuration, if
 * necessary, and eventually delivers that configuration to the AMPElement's iframe. When an
 * AMPElement unregisters, the ConfigManager destroys its references to that AMPElement's iframe and
 * performs other cleanup when necessary (such as removing event listeners and destroying other
 * element references).
 */
export class ConfigManager {
  constructor() {
    /**
     * @type {!Object<string, ConfigManager.PubIdData>}
     * @private
     */
    this.dataForPubId_ = {};

    /**
     * @type {!Array<Element>}
     * @private
     */
    this.configProviderIframes_ = [];

    /**
     * @type {function():void|null}
     * @private
     */
    this.removeMessageListener_ = null;

    /**
     * Flag; only a single request should register as a page view.
     * @type {boolean}
     * @private
     */
    this.registerView_ = true;
  }

  /**
   * Store the configuration received for the provided pubId, mark the request for the config as
   * completed, and broadcast the config to relevant iframes.
   * @private
   */
  receiveConfiguration_({config, pubId}) {
    const pubData = this.dataForPubId_[pubId];
    pubData.config = config;
    pubData.requestStatus = RequestStatus.COMPLETED;
    const {iframeData} = pubData;
    iframeData.forEach(iframeDatum => {
      const {iframe, widgetId, shareConfig} = iframeDatum;
      this.sendConfiguration_({iframe, widgetId, pubId, shareConfig});
    });
  }

  /** @private */
  sendConfiguration_({iframe, widgetId, pubId, shareConfig}) {
    const pubData = this.dataForPubId_[pubId];
    const dashboardConfig = pubData.config;
    const configRequestStatus = pubData.requestStatus;
    const jsonToSend = dict({
      'event': CONFIGURATION_EVENT,
      'shareConfig': shareConfig,
      'pubId': pubId,
      'widgetId': widgetId,
      'configRequestStatus': configRequestStatus,
      'dashboardConfig': dashboardConfig,
      'registerView': this.registerView_,
    });

    iframe.contentWindow./*OK*/postMessage(JSON.stringify(jsonToSend), ORIGIN);

    if (this.registerView_) {
      this.registerView_ = false;
    }

    if (configRequestStatus === RequestStatus.NOT_REQUESTED) {
      // If a config for this pubId has not been requested yet, then this iframe will be the one
      // responsible for requesting it and sending it back here.
      this.configProviderIframes_.push(iframe);
      pubData.requestStatus = RequestStatus.REQUESTED;
    }
  }

  /**
   * Handles messages posted from amp-addthis iframes, ensuring the correct origin, and ensuring
   * that the iframe is one that is expected to provide configuration information.
   * @private
   */
  handleAddThisMessage_(event) {
    if (event.origin !== ORIGIN || !getData(event)) {
      return;
    }

    const isProviderIframe = this.configProviderIframes_.some(iframe => {
      return iframe.contentWindow === event.source;
    });

    if (!isProviderIframe) {
      return;
    }

    const data = getMessageData(event) || {};

    if (data.event === CONFIGURATION_EVENT) {
      this.receiveConfiguration_(data);
    }
  }

  /**
   * Register relevant data with the configuration manager and prepare request/response cycle
   * between frames.
   * @param {{pubId:!string, widgetId:!string, iframe:!Element, iframeLoadPromise:!Promise, win:!EventTarget, shareConfig:(JsonObject|undefined)}} param
   */
  register({pubId, widgetId, iframe, iframeLoadPromise, win, shareConfig}) {
    if (!this.removeMessageListener_) {
      this.removeMessageListener_ = listen(
          win, 'message', this.handleAddThisMessage_.bind(this)
      );
    }

    if (!this.dataForPubId_[pubId]) {
      this.dataForPubId_[pubId] = {};
    }

    const pubData = this.dataForPubId_[pubId];

    if (!pubData.requestStatus) {
      pubData.requestStatus = RequestStatus.NOT_REQUESTED;
    }

    if (!pubData.iframeData) {
      pubData.iframeData = [];
    }

    pubData.iframeData.push({iframe, shareConfig, widgetId});

    iframeLoadPromise.then(() => this.sendConfiguration_({
      iframe,
      pubId,
      widgetId,
      shareConfig,
    }));
  }

  /**
   * Relinquish as many element references as possible and remove listeners when applicable.
   * @param {{pubId:string, iframe:Element}} param
   */
  unregister({pubId, iframe}) {
    this.configProviderIframes_ = this.configProviderIframes_.filter(
        providerFrame => providerFrame !== iframe
    );

    if (this.configProviderIframes_.length === 0 &&
        this.removeMessageListener_) {
      // If there aren't any provider iframes left, there will be no messages to receive.
      this.removeMessageListener_();
      this.removeMessageListener_ = null;
    }

    const pubData = this.dataForPubId_[pubId] || {};

    if (pubData.iframeData) {
      pubData.iframeData = pubData.iframeData.filter(iframeDatum => {
        return iframeDatum.iframe !== iframe;
      });
    }
  }
}

/**
 * @typedef {{
 *   config:(Object|undefined),
 *   requestStatus:(RequestStatus|undefined),
 *   iframeData:(Array<ConfigManager.IframeDatum>|undefined)
 * }}
 */
ConfigManager.PubIdData; // purely for typedef

/**
 * @typedef {{
 *   widgetId:string,
 *   shareConfig:(Object<string,string>|undefined),
 *   iframe: Element
 * }}
 */
ConfigManager.IframeDatum; // purely for typedef
