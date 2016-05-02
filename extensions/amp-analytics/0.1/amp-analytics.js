/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

import {ANALYTICS_CONFIG} from './vendors';
import {addListener, instrumentationServiceFor} from './instrumentation';
import {assertHttpsUrl, addParamsToUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {expandTemplate} from '../../../src/string';
import {installCidService} from '../../../src/service/cid-impl';
import {installStorageService} from '../../../src/service/storage-impl';
import {installActivityService} from '../../../src/service/activity-impl';
import {installVisibilityService} from '../../../src/service/visibility-impl';
import {isArray, isObject} from '../../../src/types';
import {sendRequest, sendRequestUsingIframe} from './transport';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {userNotificationManagerFor} from '../../../src/user-notification';
import {xhrFor} from '../../../src/xhr';
import {toggle} from '../../../src/style';


installActivityService(AMP.win);
installCidService(AMP.win);
installStorageService(AMP.win);
installVisibilityService(AMP.win);
instrumentationServiceFor(AMP.win);

const MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

export class AmpAnalytics extends AMP.BaseElement {

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /**
   * @override
   */
  createdCallback() {
    /**
     * @const {!JSONObject} Copied here for tests.
     * @private
     */
    this.predefinedConfig_ = ANALYTICS_CONFIG;
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');
    /**
     * The html id of the `amp-user-notification` element.
     * @private @const {?string}
     */
    this.consentNotificationId_ = this.element
        .getAttribute('data-consent-notification-id');

    /** @private {!Promise} */
    this.consentPromise_ = Promise.resolve();

    if (this.consentNotificationId_ != null) {
      this.consentPromise_ = userNotificationManagerFor(this.getWin())
          .then(service => service.get(this.consentNotificationId_));
    }
  }

  /** @override */
  layoutCallback() {
    // Now that we are rendered, stop rendering the element to reduce
    // resource consumption.
    toggle(this.element, false);

    /**
     * @private {?string} Predefinedtype associated with the tag. If specified,
     * the config from the predefined type is merged with the inline config
     */
    this.type_ = null;

    /**
     * @private {Object<string, string>} A map of request names to the request
     * format string used by the tag to send data
     */
    this.requests_ = {};

    /**
     * @private {JSONObject}
     */
    this.remoteConfig = {};

    return this.consentPromise_
        .then(this.fetchRemoteConfig_.bind(this))
        .then(this.onFetchRemoteConfigSuccess_.bind(this));
  }

  /**
   * Handle successful fetching of (possibly) remote config.
   * @return {!Promise|undefined}
   * @private
   */
  onFetchRemoteConfigSuccess_() {
    /**
     * @private {!JSONObject} The analytics config associated with the tag
     */
    this.config_ = this.mergeConfigs_();

    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      dev.fine(this.getName_(), 'User has opted out. No hits will be sent.');
      return Promise.resolve();
    }

    this.generateRequests_();

    if (!this.config_['triggers']) {
      user.error(this.getName_(), 'No triggers were found in the ' +
          'config. No analytics data will be sent.');
      return Promise.resolve();
    }
    if (this.config_['extraUrlParams'] &&
        this.config_['extraUrlParamsReplaceMap']) {
      // If the config includes a extraUrlParamsReplaceMap, apply it as a set
      // of params to String.replace to allow aliasing of the keys in
      // extraUrlParams.
      let count = 0;
      for (const replaceMapKey in this.config_['extraUrlParamsReplaceMap']) {
        if (++count > MAX_REPLACES) {
          user.error(this.getName_(),
            'More than ' + MAX_REPLACES.toString() +
            ' extraUrlParamsReplaceMap rules aren\'t allowed; Skipping the rest'
          );
          break;
        }

        for (const extraUrlParamsKey in this.config_['extraUrlParams']) {
          const newkey = extraUrlParamsKey.replace(
            replaceMapKey,
            this.config_['extraUrlParamsReplaceMap'][replaceMapKey]
          );
          if (extraUrlParamsKey != newkey) {
            const value = this.config_['extraUrlParams'][extraUrlParamsKey];
            delete this.config_['extraUrlParams'][extraUrlParamsKey];
            this.config_['extraUrlParams'][newkey] = value;
          }
        }
      }
    }

    // Trigger callback can be synchronous. Do the registration at the end.
    for (const k in this.config_['triggers']) {
      if (this.config_['triggers'].hasOwnProperty(k)) {
        const trigger = this.config_['triggers'][k];
        if (!trigger) {
          user.error(this.getName_(), 'Trigger should be an object: ', k);
          continue;
        }
        if (!trigger['on'] || !trigger['request']) {
          user.error(this.getName_(), '"on" and "request" ' +
              'attributes are required for data to be collected.');
          continue;
        }
        addListener(this.getWin(), trigger,
            this.handleEvent_.bind(this, trigger));
      }
    }
  }

  /**
   * Returns a promise that resolves when remote config is ready (or
   * immediately if no remote config is specified.)
   * @private
   * @return {!Promise<>}
   */
  fetchRemoteConfig_() {
    let remoteConfigUrl = this.element.getAttribute('config');
    if (!remoteConfigUrl) {
      return Promise.resolve();
    }
    assertHttpsUrl(remoteConfigUrl);
    dev.fine(this.getName_(), 'Fetching remote config', remoteConfigUrl);
    const fetchConfig = {
      requireAmpResponseSourceOrigin: true,
    };
    if (this.element.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element.getAttribute('data-credentials');
    }
    return urlReplacementsFor(this.getWin()).expand(remoteConfigUrl)
        .then(expandedUrl => {
          remoteConfigUrl = expandedUrl;
          return xhrFor(this.getWin()).fetchJson(remoteConfigUrl, fetchConfig);
        })
        .then(jsonValue => {
          this.remoteConfig_ = jsonValue;
          dev.fine(this.getName_(), 'Remote config loaded', remoteConfigUrl);
        }, err => {
          user.error(this.getName_(), 'Error loading remote config: ',
              remoteConfigUrl, err);
        });
  }

  /**
   * Merges various sources of configs and stores them in a member variable.
   *
   * Order of precedence for configs from highest to lowest:
   * - Remote config: specified through an attribute of the tag.
   * - Inline config: specified insize the tag.
   * - Predefined config: Defined as part of the platform.
   * - Default config: Built-in config shared by all amp-analytics tags.
   *
   * @private
   * @return {!JSONObject}
   */
  mergeConfigs_() {
    let inlineConfig = {};
    try {
      const children = this.element.children;
      if (children.length == 1) {
        const child = children[0];
        if (child.tagName.toUpperCase() == 'SCRIPT' &&
            child.getAttribute('type').toUpperCase() == 'APPLICATION/JSON') {
          inlineConfig = JSON.parse(children[0].textContent);
        } else {
          user.error(this.getName_(), 'The analytics config should ' +
              'be put in a <script> tag with type=application/json');
        }
      } else if (children.length > 1) {
        user.error(this.getName_(), 'The tag should contain only one' +
            ' <script> child.');
      }
    }
    catch (er) {
      user.error(this.getName_(), 'Analytics config could not be ' +
          'parsed. Is it in a valid JSON format?', er);
    }

    // Initialize config with analytics related vars.
    const config = {
      'vars': {
        'requestCount': 0,
      },
    };
    const defaultConfig = this.predefinedConfig_['default'] || {};
    const typeConfig = this.predefinedConfig_[
      this.element.getAttribute('type')] || {};

    this.mergeObjects_(defaultConfig, config);
    this.mergeObjects_(typeConfig, config, /* predefined */ true);
    this.mergeObjects_(inlineConfig, config);
    this.mergeObjects_(this.remoteConfig_, config);
    return config;
  }

  /**
   * @return {boolean} true if the user has opted out.
   */
  hasOptedOut_() {
    if (!this.config_['optout']) {
      return false;
    }

    const props = this.config_['optout'].split('.');
    let k = this.getWin();
    for (let i = 0; i < props.length; i++) {
      if (!k) {
        return false;
      }
      k = k[props[i]];
    }
    return k();
  }

  /**
   * Goes through all the requests in predefined vendor config and tag's config
   * and creates a map of request name to request template. These requests can
   * then be used while sending a request to a server.
   *
   * @private
   */
  generateRequests_() {
    const requests = {};
    if (!this.config_ || !this.config_['requests']) {
      dev.error(this.getName_(), 'No request strings defined. Analytics data ' +
          'will not be sent from this page.');
      return;
    }
    for (const k in this.config_['requests']) {
      if (this.config_['requests'].hasOwnProperty(k)) {
        requests[k] = this.config_['requests'][k];
      }
    }
    this.requests_ = requests;

    // Expand any placeholders. For requests, we expand each string up to 5
    // times to support nested requests. Leave any unresolved placeholders.
    for (const k in this.requests_) {
      this.requests_[k] = expandTemplate(this.requests_[k], key => {
        return this.requests_[key] || '${' + key + '}';
      }, 5);
    }
  }

  /**
   * Callback for events that are registered by the config's triggers. This
   * method generates the request and sends the request out.
   *
   * @param {!JSONObject} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @private
   */
  handleEvent_(trigger, event) {
    let request = this.requests_[trigger['request']];
    if (!request) {
      user.error(this.getName_(), 'Ignoring event. Request string ' +
          'not found: ', trigger['request']);
      return Promise.resolve();
    }

    // Add any given extraUrlParams as query string param
    if (this.config_['extraUrlParams']) {
      request = addParamsToUrl(request, this.config_['extraUrlParams']);
    }

    this.config_['vars']['requestCount']++;

    // Replace placeholders with URI encoded values.
    // Precedence is event.vars > trigger.vars > config.vars.
    // Nested expansion not supported.
    request = expandTemplate(request, key => {
      const match = key.match(/([^(]*)(\([^)]*\))?/);
      const name = match[1];
      const argList = match[2] || '';
      const raw = event.vars[name] ||
          (trigger['vars'] && trigger['vars'][name] ||
          this.config_['vars'] && this.config_['vars'][name]);
      const val = this.encodeVars_(raw != null ? raw : '', name);
      return val + argList;
    });

    // For consistency with amp-pixel we also expand any url replacements.
    return urlReplacementsFor(this.getWin()).expand(request).then(request => {
      this.sendRequest_(request, trigger);
      return request;
    });
  }

  /**
   * @param {string} raw The values to URI encode.
   * @param {string} unusedName Name of the variable.
   * @private
   */
  encodeVars_(raw, unusedName) {
    if (isArray(raw)) {
      return raw.map(encodeURIComponent).join(',');
    }
    return encodeURIComponent(raw);
  }

  /**
   * @param {string} request The full request string to send.
   * @param {!JSONObject} trigger
   * @private
   */
  sendRequest_(request, trigger) {
    if (!request) {
      user.error(this.getName_(), 'Request not sent. Contents empty.');
      return;
    }
    if (trigger['iframePing']) {
      user.assert(trigger['on'] == 'visible',
          'iframePing is only available on page view requests.');
      sendRequestUsingIframe(this.getWin(), request);
    } else {
      sendRequest(this.getWin(), request, this.config_['transport'] || {});
    }
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return 'AmpAnalytics ' +
        (this.element.getAttribute('id') || '<unknown id>');
  }

  /**
   * Merges two objects. If the value is array or plain object, the values are
   * merged otherwise the value is overwritten.
   *
   * @param {Object|Array} from Object or array to merge from
   * @param {Object|Array} to Object or Array to merge into
   * @param {boolean=} opt_predefinedConfig
   * @private
   */
  mergeObjects_(from, to, opt_predefinedConfig) {
    if (to === null || to === undefined) {
      to = {};
    }

    for (const property in from) {
      user.assert(opt_predefinedConfig || property != 'iframePing',
          'iframePing config is only available to vendor config.');
      // Only deal with own properties.
      if (from.hasOwnProperty(property)) {
        if (isArray(from[property])) {
          if (!isArray(to[property])) {
            to[property] = [];
          }
          to[property] = this.mergeObjects_(from[property], to[property],
              opt_predefinedConfig);
        } else if (isObject(from[property])) {
          if (!isObject(to[property])) {
            to[property] = {};
          }
          to[property] = this.mergeObjects_(from[property], to[property],
              opt_predefinedConfig);
        } else {
          to[property] = from[property];
        }
      }
    }
    return to;
  }
}

AMP.registerElement('amp-analytics', AmpAnalytics);
