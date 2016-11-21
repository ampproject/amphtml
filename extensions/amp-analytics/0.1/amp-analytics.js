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
import {
  InstrumentationService,
  instrumentationServiceForDoc,
} from './instrumentation';
import {isJsonScriptTag} from '../../../src/dom';
import {assertHttpsUrl, appendEncodedParamStringToUrl} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {expandTemplate} from '../../../src/string';
import {installCidService} from './cid-impl';
import {installCryptoService} from './crypto-impl';
import {installActivityService} from './activity-impl';
import {isArray, isObject} from '../../../src/types';
import {sendRequest, sendRequestUsingIframe} from './transport';
import {urlReplacementsForDoc} from '../../../src/url-replacements';
import {userNotificationManagerFor} from '../../../src/user-notification';
import {cryptoFor} from '../../../src/crypto';
import {xhrFor} from '../../../src/xhr';
import {toggle} from '../../../src/style';

// Register doc-service factory.
AMP.registerServiceForDoc(
    'amp-analytics-instrumentation', InstrumentationService);

installActivityService(AMP.win);
installCidService(AMP.win);
installCryptoService(AMP.win);

const MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

export class AmpAnalytics extends AMP.BaseElement {

  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /**
     * @const {!JSONType} Copied here for tests.
     * @private
     */
    this.predefinedConfig_ = ANALYTICS_CONFIG;


    /** @private {!Promise} */
    this.consentPromise_ = Promise.resolve();

    /**
     * The html id of the `amp-user-notification` element.
     * @private {?string}
     */
    this.consentNotificationId_ = null;

    /**
     * @private {?string} Predefined type associated with the tag. If specified,
     * the config from the predefined type is merged with the inline config
     */
    this.type_ = null;

    /**
     * @private {Object<string, string>} A map of request names to the request
     * format string used by the tag to send data
     */
    this.requests_ = {};

    /**
     * @private {JSONType}
     */
    this.config_ = /** @type {JSONType} */ ({});

    /**
     * @private {JSONType}
     */
    this.remoteConfig_ = /** @type {JSONType} */ ({});

    /** @private {?./instrumentation.InstrumentationService} */
    this.instrumentation_ = null;
  }

  /** @override */
  getPriority() {
    // Loads after other content.
    return 1;
  }

  /** @override */
  isAlwaysFixed() {
    return true;
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  buildCallback() {
    this.element.setAttribute('aria-hidden', 'true');

    this.consentNotificationId_ = this.element
        .getAttribute('data-consent-notification-id');

    this.instrumentation_ = instrumentationServiceForDoc(this.getAmpDoc());

    if (this.consentNotificationId_ != null) {
      this.consentPromise_ = userNotificationManagerFor(this.win)
          .then(service => service.get(this.consentNotificationId_));
    }
  }

  /** @override */
  layoutCallback() {
    // Now that we are rendered, stop rendering the element to reduce
    // resource consumption.
    toggle(this.element, false);

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
    this.config_ = this.mergeConfigs_();

    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      const TAG = this.getName_();
      user().fine(TAG, 'User has opted out. No hits will be sent.');
      return Promise.resolve();
    }

    this.generateRequests_();

    if (!this.config_['triggers']) {
      const TAG = this.getName_();
      user().error(TAG, 'No triggers were found in the ' +
          'config. No analytics data will be sent.');
      return Promise.resolve();
    }

    this.processExtraUrlParams_(this.config_['extraUrlParams'],
        this.config_['extraUrlParamsReplaceMap']);

    const promises = [];
    // Trigger callback can be synchronous. Do the registration at the end.
    for (const k in this.config_['triggers']) {
      if (this.config_['triggers'].hasOwnProperty(k)) {
        let trigger = null;
        trigger = this.config_['triggers'][k];
        const TAG = this.getName_();
        if (!trigger) {
          user().error(TAG, 'Trigger should be an object: ', k);
          continue;
        }
        if (!trigger['on'] || !trigger['request']) {
          user().error(TAG, '"on" and "request" ' +
              'attributes are required for data to be collected.');
          continue;
        }
        this.processExtraUrlParams_(trigger['extraUrlParams'],
            this.config_['extraUrlParamsReplaceMap']);
        promises.push(this.isSampledIn_(trigger).then(result => {
          if (!result) {
            return;
          }

          if (trigger['selector']) {
            // Expand the selector using variable expansion.
            trigger['selector'] = this.expandTemplate_(trigger['selector'],
                trigger, /* arg*/ undefined, /* arg */ undefined,
                /* arg*/ false);
            this.instrumentation_.addListener(
                trigger, this.handleEvent_.bind(this, trigger), this.element);

          } else {
            this.instrumentation_.addListener(
                trigger, this.handleEvent_.bind(this, trigger), this.element);
          }
        }));
      }
    }
    return Promise.all(promises);
  }

  /**
   * Replace the names of keys in params object with the values in replace map.
   *
   * @param {!Object<string, string>} params The params that need to be renamed.
   * @param {!Object<string, string>} replaceMap A map of pattern and replacement
   *    value.
   * @private
   */
  processExtraUrlParams_(params, replaceMap) {
    if (params && replaceMap) {
      // If the config includes a extraUrlParamsReplaceMap, apply it as a set
      // of params to String.replace to allow aliasing of the keys in
      // extraUrlParams.
      let count = 0;
      for (const replaceMapKey in replaceMap) {
        if (++count > MAX_REPLACES) {
          const TAG = this.getName_();
          user().error(TAG,
              'More than ' + MAX_REPLACES + ' extraUrlParamsReplaceMap rules ' +
              'aren\'t allowed; Skipping the rest');
          break;
        }

        for (const extraUrlParamsKey in params) {
          const newkey = extraUrlParamsKey.replace(
            replaceMapKey,
            replaceMap[replaceMapKey]
          );
          if (extraUrlParamsKey != newkey) {
            const value = params[extraUrlParamsKey];
            delete params[extraUrlParamsKey];
            params[newkey] = value;
          }
        }
      }
    }
  }

  /**
   * Returns a promise that resolves when remote config is ready (or
   * immediately if no remote config is specified.)
   * @private
   * @return {!Promise<undefined>}
   */
  fetchRemoteConfig_() {
    let remoteConfigUrl = this.element.getAttribute('config');
    if (!remoteConfigUrl) {
      return Promise.resolve();
    }
    assertHttpsUrl(remoteConfigUrl, this.element);
    const TAG = this.getName_();
    dev().fine(TAG, 'Fetching remote config', remoteConfigUrl);
    const fetchConfig = {
      requireAmpResponseSourceOrigin: true,
    };
    if (this.element.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element.getAttribute('data-credentials');
    }
    /** @const {!Window} */
    const win = this.win;
    return urlReplacementsForDoc(win.document).expandAsync(remoteConfigUrl)
        .then(expandedUrl => {
          remoteConfigUrl = expandedUrl;
          return xhrFor(win).fetchJson(remoteConfigUrl, fetchConfig);
        })
        .then(jsonValue => {
          this.remoteConfig_ = jsonValue;
          dev().fine(TAG, 'Remote config loaded', remoteConfigUrl);
        }, err => {
          user().error(TAG, 'Error loading remote config: ', remoteConfigUrl,
              err);
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
   * @return {!JSONType}
   */
  mergeConfigs_() {
    const inlineConfig = this.getInlineConfigNoInline();
    // Initialize config with analytics related vars.
    const config = /** @type {!JSONType} */ ({
      'vars': {
        'requestCount': 0,
      },
    });
    const defaultConfig = this.predefinedConfig_['default'] || {};
    const typeConfig = this.predefinedConfig_[
      this.element.getAttribute('type')] || {};

    this.mergeObjects_(defaultConfig, config);
    this.mergeObjects_(typeConfig, config, /* predefined */ true);
    this.mergeObjects_(inlineConfig, config);
    this.mergeObjects_(this.remoteConfig_, config);
    return config;
  }

  /** @private */
  getInlineConfigNoInline() {
    let inlineConfig = {};
    const TAG = this.getName_();
    try {
      const children = this.element.children;
      if (children.length == 1) {
        const child = children[0];
        if (isJsonScriptTag(child)) {
          inlineConfig = JSON.parse(children[0].textContent);
        } else {
          user().error(TAG, 'The analytics config should ' +
              'be put in a <script> tag with type="application/json"');
        }
      } else if (children.length > 1) {
        user().error(TAG, 'The tag should contain only one' +
            ' <script> child.');
      }
    }
    catch (er) {
      user().error(TAG, 'Analytics config could not be ' +
          'parsed. Is it in a valid JSON format?', er);
    }
    return inlineConfig;
  }

  /**
   * @return {boolean} true if the user has opted out.
   */
  hasOptedOut_() {
    if (!this.config_['optout']) {
      return false;
    }

    const props = this.config_['optout'].split('.');
    let k = this.win;
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
      const TAG = this.getName_();
      user().error(TAG, 'No request strings defined. Analytics ' +
          'data will not be sent from this page.');
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
   * method generates requests and sends them out.
   *
   * @param {!JSONType} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @return {!Promise} The request that was sent out.
   * @private
   */
  handleEvent_(trigger, event) {
    const requests = isArray(trigger['request'])
        ? trigger['request'] : [trigger['request']];

    const resultPromises = [];
    for (let r = 0; r < requests.length; r++) {
      const request = this.requests_[requests[r]];
      resultPromises.push(this.handleRequestForEvent_(request, trigger, event));
    }
    return Promise.all(resultPromises);
  }

  /**
   * Processes a request for an event callback and sends it out.
   *
   * @param {string} request The request to process.
   * @param {!JSONType} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @return {!Promise<string|undefined>} The request that was sent out.
   * @private
   */
  handleRequestForEvent_(request, trigger, event) {
    if (!request) {
      const TAG = this.getName_();
      user().error(TAG, 'Ignoring event. Request string ' +
          'not found: ', trigger['request']);
      return Promise.resolve();
    }

    // Add any given extraUrlParams as query string param
    if (this.config_['extraUrlParams'] || trigger['extraUrlParams']) {
      const params = Object.create(null);
      Object.assign(params, this.config_['extraUrlParams'],
          trigger['extraUrlParams']);
      for (const k in params) {
        if (typeof params[k] == 'string') {
          params[k] = this.expandTemplate_(params[k], trigger, event);
        }
      }
      request = this.addParamsToUrl_(request, params);
    }

    this.config_['vars']['requestCount']++;
    request = this.expandTemplate_(request, trigger, event);

    // For consistency with amp-pixel we also expand any url replacements.
    return urlReplacementsForDoc(this.win.document).expandAsync(request)
        .then(request => {
          this.sendRequest_(request, trigger);
          return request;
        });
  }

  /**
   * @param {!JSONType} trigger The config to use to determine sampling.
   * @return {!Promise<boolean>} Whether the request should be sampled in or
   * not based on sampleSpec.
   * @private
   */
  isSampledIn_(trigger) {
    /** @const {!JSONType} */
    const spec = trigger['sampleSpec'];
    const resolve = Promise.resolve(true);
    const TAG = this.getName_();
    if (!spec) {
      return resolve;
    }
    if (!spec['sampleOn']) {
      user().error(TAG, 'Invalid sampleOn value.');
      return resolve;
    }
    const threshold = parseFloat(spec['threshold']); // Threshold can be NaN.
    if (threshold >= 0 && threshold <= 100) {
      const key = this.expandTemplate_(spec['sampleOn'], trigger);
      const keyPromise = urlReplacementsForDoc(this.win.document)
          .expandAsync(key);
      const cryptoPromise = cryptoFor(this.win);
      return Promise.all([keyPromise, cryptoPromise])
          .then(results => results[1].uniform(results[0]))
          .then(digest => digest * 100 < spec['threshold']);
    }
    user()./*OK*/error(TAG, 'Invalid threshold for sampling.');
    return resolve;
  }

  /**
   * @param {string} template The template to expand.
   * @param {!JSONType} trigger The object to use for variable value lookups.
   * @param {!Object=} opt_event Object with details about the event.
   * @param {number=} opt_iterations Number of recursive expansions to perform.
   *    Defaults to 2 substitutions.
   * @param {boolean=} opt_encode Used to determine if the vars should be
   *    encoded or not. Defaults to true.
   * @return {string} The expanded string.
   * @private
   */
  expandTemplate_(template, trigger, opt_event, opt_iterations, opt_encode) {
    opt_iterations = opt_iterations === undefined ? 2 : opt_iterations;
    opt_encode = opt_encode === undefined ? true : opt_encode;
    if (opt_iterations < 0) {
      user().error('AMP-ANALYTICS', 'Maximum depth reached while expanding ' +
          'variables. Please ensure that the variables are not recursive.');
      return template;
    }

    // Replace placeholders with URI encoded values.
    // Precedence is opt_event.vars > trigger.vars > config.vars.
    // Nested expansion not supported.
    return expandTemplate(template, key => {
      const {name, argList} = this.getNameArgs_(key);
      let raw = (opt_event && opt_event['vars'] && opt_event['vars'][name]) ||
          (trigger['vars'] && trigger['vars'][name]) ||
          (this.config_['vars'] && this.config_['vars'][name]) ||
          '';

      // Values can also be arrays and objects. Don't expand them.
      if (typeof raw == 'string') {
        raw = this.expandTemplate_(raw, trigger, opt_event, opt_iterations - 1);
      }
      const val = opt_encode ? this.encodeVars_(raw, name) : raw;
      return val ? val + argList : val;
    });
  }

  /**
   * Returns an array containing two values: name and args parsed from the key.
   *
   * @param {string} key The key to be parsed.
   * @return {!Object<string>}
   * @private
   */
  getNameArgs_(key) {
    if (!key) {
      return {name: '', argList: ''};
    }
    const match = key.match(/([^(]*)(\([^)]*\))?/);
    if (!match) {
      const TAG = this.getName_();
      user().error(TAG,
          'Variable with invalid format found: ' + key);
    }
    return {name: match[1], argList: match[2] || ''};
  }

  /**
   * @param {string|!Array<string>} raw The values to URI encode.
   * @param {string} unusedName Name of the variable.
   * @return {string} The encoded value.
   * @private
   */
  encodeVars_(raw, unusedName) {
    if (!raw) {
      return '';
    }

    if (isArray(raw)) {
      return raw.map(encodeURIComponent).join(',');
    }
    // Separate out names and arguments from the value and encode the value.
    const {name, argList} = this.getNameArgs_(String(raw));
    return encodeURIComponent(name) + argList;
  }

  /**
   * Adds parameters to URL. Similar to the function defined in url.js but with
   * a different encoding method.
   * @param {string} request
   * @param {!Object<string, string>} params
   * @return {string}
   * @private
   */
  addParamsToUrl_(request, params) {
    const s = [];
    for (const k in params) {
      const v = params[k];
      if (v == null) {
        continue;
      } else {
        const sv = this.encodeVars_(v, k);
        s.push(`${encodeURIComponent(k)}=${sv}`);
      }
    }

    const paramString = s.join('&');
    if (request.indexOf('${extraUrlParams}') >= 0) {
      return request.replace('${extraUrlParams}', paramString);
    } else {
      return appendEncodedParamStringToUrl(request, paramString);
    }
  }

  /**
   * @param {string} request The full request string to send.
   * @param {!JSONType} trigger
   * @private
   */
  sendRequest_(request, trigger) {
    if (!request) {
      const TAG = this.getName_();
      user().error(TAG, 'Request not sent. Contents empty.');
      return;
    }
    if (trigger['iframePing']) {
      user().assert(trigger['on'] == 'visible',
          'iframePing is only available on page view requests.');
      sendRequestUsingIframe(this.win, request);
    } else {
      sendRequest(this.win, request, this.config_['transport'] || {});
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
      user().assert(opt_predefinedConfig || property != 'iframePing',
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
