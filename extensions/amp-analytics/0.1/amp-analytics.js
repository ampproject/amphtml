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

import {isJsonScriptTag} from '../../../src/dom';
import {assertHttpsUrl, appendEncodedParamStringToUrl} from '../../../src/url';
import {dev, rethrowAsync, user} from '../../../src/log';
import {expandTemplate} from '../../../src/string';
import {isArray, isObject} from '../../../src/types';
import {hasOwn, map} from '../../../src/utils/object';
import {sendRequest, sendRequestUsingIframe, Transport} from './transport';
import {urlReplacementsForDoc} from '../../../src/services';
import {userNotificationManagerFor} from '../../../src/services';
import {cryptoFor} from '../../../src/crypto';
import {timerFor, viewerForDoc, xhrFor} from '../../../src/services';
import {toggle} from '../../../src/style';
import {isEnumValue} from '../../../src/types';
import {Activity} from './activity-impl';
import {Cid} from './cid-impl';
import {
    InstrumentationService,
    instrumentationServicePromiseForDoc,
    AnalyticsEventType,
} from './instrumentation';
import {
  ExpansionOptions,
  installVariableService,
  variableServiceFor,
} from './variables';
import {ANALYTICS_CONFIG} from './vendors';
import {SANDBOX_AVAILABLE_VARS} from './sandbox-vars-whitelist';

// Register doc-service factory.
AMP.registerServiceForDoc(
    'amp-analytics-instrumentation', InstrumentationService);
AMP.registerServiceForDoc('activity', Activity);
AMP.registerServiceForDoc('cid', Cid);

installVariableService(AMP.win);

const MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

const WHITELIST_EVENT_IN_SANDBOX = [
  AnalyticsEventType.VISIBLE,
  AnalyticsEventType.HIDDEN,
];

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

    /** @private {!boolean} */
    this.isSandbox_ = element.hasAttribute('sandbox');

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

    /** @private {?./instrumentation.AnalyticsGroup} */
    this.analyticsGroup_ = null;

    /** @private {!./variables.VariableService} */
    this.variableService_ = variableServiceFor(this.win);

    /** @private {!../../../src/service/crypto-impl.Crypto} */
    this.cryptoService_ = cryptoFor(this.win);

    /** @private {?Promise} */
    this.iniPromise_ = null;
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

    if (this.consentNotificationId_ != null) {
      this.consentPromise_ = userNotificationManagerFor(this.win)
          .then(service => service.get(this.consentNotificationId_));
    }

    if (this.element.getAttribute('trigger') == 'immediate') {
      this.ensureInitialized_();
    }
  }

  /** @override */
  layoutCallback() {
    // Now that we are rendered, stop rendering the element to reduce
    // resource consumption.
    return this.ensureInitialized_();
  }

  /** @override */
  detachedCallback() {
    if (this.analyticsGroup_) {
      this.analyticsGroup_.dispose();
      this.analyticsGroup_ = null;
    }
  }

  /**
   * @return {!Promise}
   * @private
   */
  ensureInitialized_() {
    if (this.iniPromise_) {
      return this.iniPromise_;
    }
    toggle(this.element, false);
    this.iniPromise_ =
        viewerForDoc(this.getAmpDoc()).whenFirstVisible()
            // Rudimentary "idle" signal.
            .then(() => timerFor(this.win).promise(1))
            .then(() => this.consentPromise_)
            .then(this.fetchRemoteConfig_.bind(this))
            .then(() => instrumentationServicePromiseForDoc(this.getAmpDoc()))
            .then(instrumentation => {
              this.instrumentation_ = instrumentation;
            })
            .then(this.onFetchRemoteConfigSuccess_.bind(this));
    return this.iniPromise_;
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

    this.analyticsGroup_ =
        this.instrumentation_.createAnalyticsGroup(this.element);

    if (this.config_['transport'] && this.config_['transport']['iframe']) {
      Transport.processCrossDomainIframe(this.getAmpDoc().win.document,
        this.config_['transport']);
    }

    const promises = [];
    // Trigger callback can be synchronous. Do the registration at the end.
    for (const k in this.config_['triggers']) {
      if (hasOwn(this.config_['triggers'], k)) {
        const trigger = this.config_['triggers'][k];
        const expansionOptions = this.expansionOptions_(
            {}, trigger, undefined, true);
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
        // Check for not supported trigger for sandboxed analytics
        if (this.isSandbox_) {
          const eventType = trigger['on'];
          if (isEnumValue(AnalyticsEventType, eventType) &&
              !WHITELIST_EVENT_IN_SANDBOX.includes(eventType)) {
            user().error(TAG, eventType + 'is not supported for amp-analytics' +
            ' in scope');
            continue;
          }
        }

        this.processExtraUrlParams_(trigger['extraUrlParams'],
            this.config_['extraUrlParamsReplaceMap']);
        promises.push(this.isSampledIn_(trigger).then(result => {
          if (!result) {
            return;
          }
          // replace selector and selectionMethod
          if (this.isSandbox_) {
            // Only support selection of parent element for analytics in scope
            trigger['selector'] = this.element.parentElement.tagName;
            trigger['selectionMethod'] = 'closest';
            this.addTriggerNoInline_(trigger);
          } else if (trigger['selector']) {
            // Expand the selector using variable expansion.
            return this.variableService_.expandTemplate(
                trigger['selector'], expansionOptions)
              .then(selector => {
                trigger['selector'] = selector;
                this.addTriggerNoInline_(trigger);
              });
          } else {
            this.addTriggerNoInline_(trigger);
          }
        }));
      }
    }
    return Promise.all(promises);
  }

  /**
   * Calls `AnalyticsGroup.addTrigger` and reports any errors. "NoInline" is
   * to avoid inlining this method so that `try/catch` does it veto
   * optimizations.
   * @param {!JSONType} config
   * @private
   */
  addTriggerNoInline_(config) {
    try {
      this.analyticsGroup_.addTrigger(
          config, this.handleEvent_.bind(this, config));
    } catch (e) {
      const TAG = this.getName_();
      const eventType = config['on'];
      rethrowAsync(TAG, 'Failed to process trigger "' + eventType + '"', e);
    }
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
    if (!remoteConfigUrl || this.isSandbox_) {
      return Promise.resolve();
    }
    assertHttpsUrl(remoteConfigUrl, this.element);
    const TAG = this.getName_();
    dev().fine(TAG, 'Fetching remote config', remoteConfigUrl);
    const fetchConfig = {};
    if (this.element.hasAttribute('data-credentials')) {
      fetchConfig.credentials = this.element.getAttribute('data-credentials');
    }
    const ampdoc = this.getAmpDoc();
    return urlReplacementsForDoc(this.element).expandAsync(remoteConfigUrl)
        .then(expandedUrl => {
          remoteConfigUrl = expandedUrl;
          return xhrFor(ampdoc.win).fetchJson(remoteConfigUrl, fetchConfig);
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

    const type = this.element.getAttribute('type');
    if (type == 'googleanalytics-alpha') {
      const TAG = this.getName_();
      user().warn(TAG, '"googleanalytics-alpha" configuration is not ' +
          'planned to be supported long-term. Avoid use of this value for ' +
          'amp-analytics config attribute unless you plan to migrate before ' +
          'deprecation');
    }
    const typeConfig = this.predefinedConfig_[type] || {};

    this.mergeObjects_(defaultConfig, config);
    this.mergeObjects_(typeConfig, config, /* predefined */ true);
    this.mergeObjects_(inlineConfig, config);
    this.mergeObjects_(this.remoteConfig_, config);
    return config;
  }

  /**
   * @private
   * @return {!JSONType}
   */
  getInlineConfigNoInline() {
    if (this.element.CONFIG) {
      // If the analytics element is created by runtime, return cached config.
      return this.element.CONFIG;
    }
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
    return /** @type {!JSONType} */ (inlineConfig);
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
    // The actual property being called is controlled by vendor configs only
    // that are approved in code reviews. User customization of the `optout`
    // property is not allowed.
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
      if (hasOwn(this.config_['requests'], k)) {
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
    if (!this.element.ownerDocument.defaultView) {
      const TAG = this.getName_();
      dev().warn(TAG, 'request against destroyed embed: ', trigger['on']);
      return Promise.resolve();
    }

    if (!request) {
      const TAG = this.getName_();
      user().error(TAG, 'Ignoring event. Request string ' +
          'not found: ', trigger['request']);
      return Promise.resolve();
    }

    return this.checkTriggerEnabled_(trigger, event)
        .then(enabled => {
          if (!enabled) {
            return;
          }
          return this.expandAndSendRequest_(request, trigger, event);
        });
  }

  /**
   * @param {string} request The request to process.
   * @param {!JSONType} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @return {!Promise<string>} The request that was sent out.
   * @private
   */
  expandAndSendRequest_(request, trigger, event) {
    return this.expandExtraUrlParams_(trigger, event)
        .then(params => {
          request = this.addParamsToUrl_(request, params);
          this.config_['vars']['requestCount']++;
          const expansionOptions = this.expansionOptions_(event, trigger);
          return this.variableService_
              .expandTemplate(request, expansionOptions);
        })
        .then(request => {
          const whiteList =
              this.isSandbox_ ? SANDBOX_AVAILABLE_VARS : undefined;
          // For consistency with amp-pixel we also expand any url
          // replacements.
          return urlReplacementsForDoc(this.element).expandAsync(
              request, undefined, whiteList);
        })
        .then(request => {
          this.sendRequest_(request, trigger);
          return request;
        });
  }
/* TODO REMOVE THIS BEFORE CHECKING IN!
    return Promise.all(requestPromises)
      .then(() => {
        request = this.addParamsToUrl_(request, params);
        this.config_['vars']['requestCount']++;
        const expansionOptions = this.expansionOptions_(event, trigger);
        return this.variableService_.expandTemplate(request, expansionOptions);
      })
      .then(request => {
        const whiteList = this.isSandbox_ ? SANDBOX_AVAILABLE_VARS : undefined;
        // For consistency with amp-pixel we also expand any url replacements.
        return urlReplacementsForDoc(this.element).expandAsync(
            request, undefined, whiteList);
      })
      .then(request => {
        this.sendRequest_(request, trigger);
        return request;
      });
*/

  /**
   * @param {!JSONType} trigger JSON config block that resulted in this event.
   * @param {!Object} event Object with details about the event.
   * @return {!Promise<T>} Map of the resolved parameters.
   * @template T
   * @private
   */
  expandExtraUrlParams_(trigger, event) {
    const requestPromises = [];
    const params = map();
    // Add any given extraUrlParams as query string param
    if (this.config_['extraUrlParams'] || trigger['extraUrlParams']) {
      const expansionOptions = this.expansionOptions_(event, trigger);
      Object.assign(params, this.config_['extraUrlParams'],
          trigger['extraUrlParams']);
      for (const k in params) {
        if (typeof params[k] == 'string') {
          requestPromises.push(
              this.variableService_.expandTemplate(params[k], expansionOptions)
                .then(value => { params[k] = value; }));
        }
      }
    }
    return Promise.all(requestPromises).then(() => params);
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
    const sampleOn = spec['sampleOn'];
    if (!sampleOn) {
      user().error(TAG, 'Invalid sampleOn value.');
      return resolve;
    }
    const threshold = parseFloat(spec['threshold']); // Threshold can be NaN.
    if (threshold >= 0 && threshold <= 100) {
      const expansionOptions = this.expansionOptions_({}, trigger);
      return this.expandTemplateWithUrlParams_(sampleOn, expansionOptions)
          .then(key => this.cryptoService_.uniform(key))
          .then(digest => digest * 100 < threshold);
    }
    user()./*OK*/error(TAG, 'Invalid threshold for sampling.');
    return resolve;
  }

  /**
   * Checks if request for a trigger is enabled.
   * @param {!JSONType} trigger The config to use to determine if trigger is
   * enabled.
   * @param {!Object} event Object with details about the event.
   * @return {!Promise<boolean>} Whether trigger must be called.
   * @private
   */
  checkTriggerEnabled_(trigger, event) {
    const expansionOptions = this.expansionOptions_(event, trigger);
    const enabledOnTagLevel =
        this.checkSpecEnabled_(this.config_['enabled'], expansionOptions);
    const enabledOnTriggerLevel =
        this.checkSpecEnabled_(trigger['enabled'], expansionOptions);

    return Promise.all([enabledOnTagLevel, enabledOnTriggerLevel])
        .then(enabled => {
          dev().assert(enabled.length === 2);
          return enabled[0] && enabled[1];
        });
  }

  /**
   * Checks result of 'enabled' spec evaluation. Returns false if spec is provided and value
   * resolves to a falsey value (empty string, 0, false, null, NaN or undefined).
   * @param {string} spec Expression that will be evaluated.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<boolean>} False only if spec is provided and value is falsey.
   * @private
   */
  checkSpecEnabled_(spec, expansionOptions) {
    // Spec absence always resolves to true.
    if (spec === undefined) {
      return Promise.resolve(true);
    }

    return this.expandTemplateWithUrlParams_(spec, expansionOptions)
        .then(val => {
          return val !== '' && val !== '0' && val !== 'false' &&
              val !== 'null' && val !== 'NaN' && val !== 'undefined';
        });
  }

  /**
   * Expands spec using provided expansion options and applies url replacement if necessary.
   * @param {string} spec Expression that needs to be expanded.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<string>} expanded spec.
   * @private
   */
  expandTemplateWithUrlParams_(spec, expansionOptions) {
    return this.variableService_.expandTemplate(spec, expansionOptions)
        .then(key => urlReplacementsForDoc(this.element).expandUrlAsync(key));
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
        const sv = this.variableService_.encodeVars(v, k);
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

    // Assert that optouts are allowed only in predefined configs.
    // The last expression adds an exception of known, safe optout function
    // that is already being used in the wild.
    user().assert(opt_predefinedConfig || !from || !from['optout'] ||
        from['optout'] == '_gaUserPrefs.ioo',
        'optout property is only available to vendor config.');

    for (const property in from) {
      user().assert(opt_predefinedConfig || property != 'iframePing',
          'iframePing config is only available to vendor config.');
      // Only deal with own properties.
      if (hasOwn(from, property)) {
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

  /**
   * @param {!Object<string, Object<string, string|Array<string>>>} source1
   * @param {!Object<string, Object<string, string|Array<string>>>} source2
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   * @return {!ExpansionOptions}
   */
  expansionOptions_(source1, source2, opt_iterations, opt_noEncode) {
    const vars = map();
    this.mergeObjects_(this.config_['vars'], vars);
    this.mergeObjects_(source2['vars'], vars);
    this.mergeObjects_(source1['vars'], vars);
    return new ExpansionOptions(vars, opt_iterations, opt_noEncode);
  }
}

AMP.registerElement('amp-analytics', AmpAnalytics);
