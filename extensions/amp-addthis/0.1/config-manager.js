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
     * @type {Object<string,string>}
     * @private
     */
    this.activeToolsMonitor_ = null;
  }

  /**
   * Store the configuration received for the provided pubId, mark the request for the config as
   * completed, and broadcast the config to relevant iframes.
   */
  receiveConfiguration({config, pubId, source}) {
    // Check that the configuration event is coming from an iframe that
    // should be providing configuration information.
    const isProviderIframe = this.configProviderIframes_.some(iframe => {
      return iframe.contentWindow === source;
    });

    if (!isProviderIframe) {
      return;
    }

    const pubData = this.dataForPubId_[pubId];
    pubData.config = config;
    pubData.requestStatus = RequestStatus.COMPLETED;
    const {iframeData} = pubData;

    iframeData.forEach(iframeDatum => {
      const {iframe, widgetId, shareConfig, atConfig} = iframeDatum;
      this.sendConfiguration_({iframe, widgetId, pubId, shareConfig, atConfig});
    });
  }

  /** @private */
  sendConfiguration_({iframe, widgetId, pubId, shareConfig, atConfig}) {
    const pubData = this.dataForPubId_[pubId];
    const dashboardConfig = pubData.config;
    const configRequestStatus = pubData.requestStatus;
    const jsonToSend = dict({
      'event': CONFIGURATION_EVENT,
      'shareConfig': shareConfig,
      'atConfig': atConfig,
      'pubId': pubId,
      'widgetId': widgetId,
      'configRequestStatus': configRequestStatus,
      'dashboardConfig': dashboardConfig,
    });

    if (dashboardConfig &&
        dashboardConfig.widgets &&
        Object.keys(dashboardConfig.widgets).length > 0) {
      this.activeToolsMonitor_.record({widget: dashboardConfig});
    }

    iframe.contentWindow./*OK*/postMessage(JSON.stringify(jsonToSend), ORIGIN);

    if (configRequestStatus === RequestStatus.NOT_REQUESTED) {
      // If a config for this pubId has not been requested yet, then this iframe will be the one
      // responsible for requesting it and sending it back here.
      this.configProviderIframes_.push(iframe);
      pubData.requestStatus = RequestStatus.REQUESTED;
    }
  }

  /**
   * Register relevant data with the configuration manager and prepare request/response cycle
   * between frames.
   * @param {{
   * pubId:!string,
   * activeToolsMonitor: Object<string,string>,
   * atConfig: Object<string,string>,
   * widgetId:!string, iframe:!Element,
   * iframeLoadPromise:!Promise,
   * win:(EventTarget|undefined),
   * shareConfig:(JsonObject|undefined)
   * }} param
   */
  register({
             pubId,
             widgetId,
             iframe,
             iframeLoadPromise,
             shareConfig,
             atConfig,
             activeToolsMonitor,
           }) {
    if (!this.activeToolsMonitor_) {
      this.activeToolsMonitor_ = activeToolsMonitor;
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

    pubData.iframeData.push({iframe, shareConfig, atConfig, widgetId});

    iframeLoadPromise.then(() => this.sendConfiguration_({
      iframe,
      pubId,
      widgetId,
      shareConfig,
      atConfig,
    }));
  }

  /**
   * Relinquish as many element references as possible.
   * @param {{pubId:string, iframe:Element}} param
   */
  unregister({pubId, iframe}) {
    this.configProviderIframes_ = this.configProviderIframes_.filter(
        providerFrame => providerFrame !== iframe
    );

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
