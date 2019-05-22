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

import {Activity} from './activity-impl';
import {AnalyticsConfig, mergeObjects} from './config';
import {AnalyticsEventType} from './events';
import {CookieWriter} from './cookie-writer';
import {
  ExpansionOptions,
  VariableService,
  variableServicePromiseForDoc,
} from './variables';
import {
  InstrumentationService,
  instrumentationServicePromiseForDoc,
} from './instrumentation';
import {LayoutPriority} from '../../../src/layout';
import {LinkerManager} from './linker-manager';
import {RequestHandler, expandPostMessage} from './requests';
import {Services} from '../../../src/services';
import {Transport} from './transport';
import {dev, devAssert, rethrowAsync, user} from '../../../src/log';
import {dict, hasOwn} from '../../../src/utils/object';
import {expandTemplate} from '../../../src/string';
import {getMode} from '../../../src/mode';
import {installLinkerReaderService} from './linker-reader';
import {isArray, isEnumValue} from '../../../src/types';
import {isIframed} from '../../../src/dom';
import {isInFie} from '../../../src/friendly-iframe-embed';
import {toggle} from '../../../src/style';

const TAG = 'amp-analytics';

const MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

const WHITELIST_EVENT_IN_SANDBOX = [
  AnalyticsEventType.VISIBLE,
  AnalyticsEventType.HIDDEN,
];

export class AmpAnalytics extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {!Promise} */
    this.consentPromise_ = Promise.resolve();

    /**
     * The html id of the `amp-user-notification` element.
     * @private {?string}
     */
    this.consentNotificationId_ = null;

    /** @private {boolean} */
    this.isSandbox_ = false;

    /**
     * @private {Object<string, RequestHandler>} A map of request handler with requests
     */
    this.requests_ = {};

    /**
     * @private {!JsonObject}
     */
    this.config_ = dict();

    /** @private {?./instrumentation.InstrumentationService} */
    this.instrumentation_ = null;

    /** @private {?./analytics-group.AnalyticsGroup} */
    this.analyticsGroup_ = null;

    /** @private {?./variables.VariableService} */
    this.variableService_ = null;

    /** @private {!../../../src/service/crypto-impl.Crypto} */
    this.cryptoService_ = Services.cryptoFor(this.win);

    /** @private {?Promise} */
    this.iniPromise_ = null;

    /** @private {./transport.Transport} */
    this.transport_ = null;

    /** @private {boolean} */
    this.isInabox_ = getMode(this.win).runtime == 'inabox';

    /** @private {?./linker-manager.LinkerManager} */
    this.linkerManager_ = null;
  }

  /** @override */
  getLayoutPriority() {
    // Load immediately if inabox, otherwise after other content.
    return this.isInabox_ ? LayoutPriority.CONTENT : LayoutPriority.METADATA;
  }

  /** @override */
  isAlwaysFixed() {
    return !isInFie(this.element);
  }

  /** @override */
  isLayoutSupported(unusedLayout) {
    return true;
  }

  /** @override */
  buildCallback() {
    this.isSandbox_ = this.element.hasAttribute('sandbox');

    this.element.setAttribute('aria-hidden', 'true');

    this.consentNotificationId_ = this.element.getAttribute(
      'data-consent-notification-id'
    );

    if (this.consentNotificationId_ != null) {
      this.consentPromise_ = Services.userNotificationManagerForDoc(
        this.element
      ).then(service =>
        service.get(dev().assertString(this.consentNotificationId_))
      );
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

    if (this.linkerManager_) {
      this.linkerManager_.dispose();
      this.linkerManager_ = null;
    }

    for (const request in this.requests_) {
      this.requests_[request].dispose();
      delete this.requests_[request];
    }
  }

  /** @override */
  resumeCallback() {
    if (this.iniPromise_) {
      this.iniPromise_.then(() => {
        this.transport_.maybeInitIframeTransport(
          this.getAmpDoc().win,
          this.element
        );
      });
    }
  }

  /** @override */
  unlayoutCallback() {
    if (Services.viewerForDoc(this.getAmpDoc()).isVisible()) {
      // amp-analytics tag was just set to display:none. Page is still loaded.
      return false;
    }

    if (this.iniPromise_) {
      this.iniPromise_.then(() => {
        // Page was unloaded - free up owned resources.
        this.transport_.deleteIframeTransport();
      });
    }

    return super.unlayoutCallback();
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

    this.iniPromise_ = Services.viewerForDoc(this.getAmpDoc())
      .whenFirstVisible()
      // Rudimentary "idle" signal.
      .then(() => Services.timerFor(this.win).promise(1))
      .then(() => this.consentPromise_)
      .then(() => Services.ampdocServiceFor(this.win))
      .then(ampDocService => {
        return ampDocService.getAmpDoc(this.element, {
          closestAmpDoc: true,
        });
      })
      .then(ampdoc =>
        Promise.all([
          instrumentationServicePromiseForDoc(ampdoc),
          variableServicePromiseForDoc(ampdoc),
        ])
      )
      .then(services => {
        this.instrumentation_ = services[0];
        this.variableService_ = services[1];
        return new AnalyticsConfig(this.element).loadConfig();
      })
      .then(config => {
        this.config_ = /** @type {!JsonObject} */ (config);
        return new CookieWriter(this.win, this.element, this.config_).write();
      })
      .then(() => {
        this.transport_ = new Transport(
          this.win,
          this.config_['transport'] || {}
        );
      })
      .then(this.registerTriggers_.bind(this))
      .then(this.initializeLinker_.bind(this));
    return this.iniPromise_;
  }

  /**
   * Registers triggers.
   * @return {!Promise|undefined}
   * @private
   */
  registerTriggers_() {
    if (this.hasOptedOut_()) {
      // Nothing to do when the user has opted out.
      const TAG = this.getName_();
      user().fine(TAG, 'User has opted out. No hits will be sent.');
      return Promise.resolve();
    }

    this.generateRequests_();

    if (!this.config_['triggers']) {
      const TAG = this.getName_();
      this.user().error(
        TAG,
        'No triggers were found in the ' +
          'config. No analytics data will be sent.'
      );
      return Promise.resolve();
    }

    this.processExtraUrlParams_(
      this.config_['extraUrlParams'],
      this.config_['extraUrlParamsReplaceMap']
    );

    this.analyticsGroup_ = this.instrumentation_.createAnalyticsGroup(
      this.element
    );

    this.transport_.maybeInitIframeTransport(
      this.getAmpDoc().win,
      this.element,
      this.preconnect
    );

    const promises = [];
    // Trigger callback can be synchronous. Do the registration at the end.
    for (const k in this.config_['triggers']) {
      if (hasOwn(this.config_['triggers'], k)) {
        const trigger = this.config_['triggers'][k];
        const expansionOptions = this.expansionOptions_(
          dict({}),
          trigger,
          undefined,
          true
        );
        const TAG = this.getName_();
        if (!trigger) {
          this.user().error(TAG, 'Trigger should be an object: ', k);
          continue;
        }
        const hasRequestOrPostMessage =
          trigger['request'] ||
          (trigger['parentPostMessage'] && this.isInabox_);
        if (!trigger['on'] || !hasRequestOrPostMessage) {
          const errorMsgSeg = this.isInabox_ ? '/"parentPostMessage"' : '';
          this.user().error(
            TAG,
            '"on" and "request"' +
              errorMsgSeg +
              ' attributes are required for data to be collected.'
          );
          continue;
        }
        // Check for not supported trigger for sandboxed analytics
        if (this.isSandbox_) {
          const eventType = trigger['on'];
          if (
            isEnumValue(AnalyticsEventType, eventType) &&
            !WHITELIST_EVENT_IN_SANDBOX.includes(eventType)
          ) {
            this.user().error(
              TAG,
              eventType + ' is not supported for amp-analytics in scope'
            );
            continue;
          }
        }

        this.processExtraUrlParams_(
          trigger['extraUrlParams'],
          this.config_['extraUrlParamsReplaceMap']
        );
        promises.push(
          this.isSampledIn_(trigger).then(result => {
            if (!result) {
              return;
            }
            // replace selector and selectionMethod
            if (this.isSandbox_) {
              // Only support selection of parent element for analytics in scope
              if (!this.element.parentElement) {
                // In case parent element has been removed from DOM, do nothing
                return;
              }
              trigger['selector'] = this.element.parentElement.tagName;
              trigger['selectionMethod'] = 'closest';
              this.addTriggerNoInline_(trigger);
            } else if (trigger['selector']) {
              // Expand the selector using variable expansion.
              return this.variableService_
                .expandTemplate(trigger['selector'], expansionOptions)
                .then(selector => {
                  trigger['selector'] = selector;
                  this.addTriggerNoInline_(trigger);
                });
            } else {
              this.addTriggerNoInline_(trigger);
            }
          })
        );
      }
    }
    return Promise.all(promises);
  }

  /**
   * Asks the browser to preload a URL. Always also does a preconnect
   * because browser support for that is better.
   *
   * @param {string} url
   * @param {string=} opt_preloadAs
   * @visibleForTesting
   */
  preload(url, opt_preloadAs) {
    this.preconnect.preload(url, opt_preloadAs);
  }

  /**
   * Calls `AnalyticsGroup.addTrigger` and reports any errors. "NoInline" is
   * to avoid inlining this method so that `try/catch` does it veto
   * optimizations.
   * @param {!JsonObject} config
   * @private
   */
  addTriggerNoInline_(config) {
    if (!this.analyticsGroup_) {
      // No need to handle trigger for component that has already been detached
      // from DOM
      return;
    }
    try {
      this.analyticsGroup_.addTrigger(
        config,
        this.handleEvent_.bind(this, config)
      );
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
          this.user().error(
            TAG,
            'More than ' +
              MAX_REPLACES +
              ' extraUrlParamsReplaceMap rules ' +
              "aren't allowed; Skipping the rest"
          );
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
   * @return {boolean} true if the user has opted out.
   */
  hasOptedOut_() {
    const elementId = this.config_['optoutElementId'];
    if (elementId && this.win.document.getElementById(elementId)) {
      return true;
    }

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
    if (!this.config_['requests']) {
      if (!this.isInabox_) {
        const TAG = this.getName_();
        this.user().error(
          TAG,
          'No request strings defined. Analytics ' +
            'data will not be sent from this page.'
        );
      }
      return;
    }

    if (this.config_['requests']) {
      for (const k in this.config_['requests']) {
        if (hasOwn(this.config_['requests'], k)) {
          const request = this.config_['requests'][k];
          if (!request['baseUrl']) {
            this.user().error(TAG, 'request must have a baseUrl');
            delete this.config_['requests'][k];
          }
        }
      }

      // Expand any placeholders. For requests, we expand each string up to 5
      // times to support nested requests. Leave any unresolved placeholders.
      // Expand any requests placeholder.
      for (const k in this.config_['requests']) {
        this.config_['requests'][k]['baseUrl'] = expandTemplate(
          this.config_['requests'][k]['baseUrl'],
          key => {
            const request = this.config_['requests'][key];
            return (request && request['baseUrl']) || '${' + key + '}';
          },
          5
        );
      }

      const requests = {};
      for (const k in this.config_['requests']) {
        if (hasOwn(this.config_['requests'], k)) {
          const request = this.config_['requests'][k];
          requests[k] = new RequestHandler(
            this.element,
            request,
            this.preconnect,
            this.transport_,
            this.isSandbox_
          );
        }
      }
      this.requests_ = requests;
    }
  }

  /**
   * Create the linker-manager that will append linker params as necessary.
   * @private
   */
  initializeLinker_() {
    const type = this.element.getAttribute('type');
    this.linkerManager_ = new LinkerManager(
      this.getAmpDoc(),
      this.config_,
      type,
      this.element
    );
    this.linkerManager_.init();
  }

  /**
   * Callback for events that are registered by the config's triggers. This
   * method generates requests and sends them out.
   *
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  handleEvent_(trigger, event) {
    const requests = isArray(trigger['request'])
      ? trigger['request']
      : [trigger['request']];
    for (let r = 0; r < requests.length; r++) {
      const requestName = requests[r];
      this.handleRequestForEvent_(requestName, trigger, event);
    }
  }

  /**
   * Processes a request for an event callback and sends it out.
   *
   * @param {string} requestName The requestName to process.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  handleRequestForEvent_(requestName, trigger, event) {
    if (!this.element.ownerDocument.defaultView) {
      const TAG = this.getName_();
      dev().warn(TAG, 'request against destroyed embed: ', trigger['on']);
    }

    const request = this.requests_[requestName];
    const hasPostMessage = this.isInabox_ && trigger['parentPostMessage'];

    if (requestName != undefined && !request) {
      const TAG = this.getName_();
      this.user().error(
        TAG,
        'Ignoring request for event. Request string not found: ',
        trigger['request']
      );
      if (!hasPostMessage) {
        return;
      }
    }
    this.checkTriggerEnabled_(trigger, event).then(enabled => {
      if (!enabled) {
        return;
      }
      this.expandAndSendRequest_(request, trigger, event);
      this.expandAndPostMessage_(trigger, event);
    });
  }

  /**
   * @param {RequestHandler} request The request to process.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  expandAndSendRequest_(request, trigger, event) {
    if (!request) {
      return;
    }
    this.config_['vars']['requestCount']++;
    const expansionOptions = this.expansionOptions_(event, trigger);
    request.send(this.config_['extraUrlParams'], trigger, expansionOptions);
  }

  /**
   * Expand and post message to parent window if applicable.
   * @param {!JsonObject} trigger JSON config block that resulted in this event.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @private
   */
  expandAndPostMessage_(trigger, event) {
    const msg = trigger['parentPostMessage'];
    if (!msg || !this.isInabox_) {
      // Only send message in inabox runtime with parentPostMessage specified.
      return;
    }
    const expansionOptions = this.expansionOptions_(event, trigger);
    expandPostMessage(
      this.getAmpDoc(),
      msg,
      this.config_['extraUrlParams'],
      trigger,
      expansionOptions,
      this.element
    ).then(message => {
      if (isIframed(this.win)) {
        // Only post message with explict `parentPostMessage` to inabox host
        this.win.parent./*OK*/ postMessage(message, '*');
      }
    });
  }

  /**
   * @param {!JsonObject} trigger The config to use to determine sampling.
   * @return {!Promise<boolean>} Whether the request should be sampled in or
   * not based on sampleSpec.
   * @private
   */
  isSampledIn_(trigger) {
    /** @const {!JsonObject} */
    const spec = trigger['sampleSpec'];
    const resolve = Promise.resolve(true);
    const TAG = this.getName_();
    if (!spec) {
      return resolve;
    }
    const sampleOn = spec['sampleOn'];
    if (!sampleOn) {
      this.user().error(TAG, 'Invalid sampleOn value.');
      return resolve;
    }
    const threshold = parseFloat(spec['threshold']); // Threshold can be NaN.
    if (threshold >= 0 && threshold <= 100) {
      const expansionOptions = this.expansionOptions_(dict({}), trigger);
      return this.expandTemplateWithUrlParams_(sampleOn, expansionOptions)
        .then(key => this.cryptoService_.uniform(key))
        .then(digest => digest * 100 < threshold);
    }
    user()./*OK*/ error(TAG, 'Invalid threshold for sampling.');
    return resolve;
  }

  /**
   * Checks if request for a trigger is enabled.
   * @param {!JsonObject} trigger The config to use to determine if trigger is
   * enabled.
   * @param {!JsonObject|!./events.AnalyticsEvent} event Object with details about the event.
   * @return {!Promise<boolean>} Whether trigger must be called.
   * @private
   */
  checkTriggerEnabled_(trigger, event) {
    const expansionOptions = this.expansionOptions_(event, trigger);
    const enabledOnTagLevel = this.checkSpecEnabled_(
      this.config_['enabled'],
      expansionOptions
    );
    const enabledOnTriggerLevel = this.checkSpecEnabled_(
      trigger['enabled'],
      expansionOptions
    );

    return Promise.all([enabledOnTagLevel, enabledOnTriggerLevel]).then(
      enabled => {
        devAssert(enabled.length === 2);
        return enabled[0] && enabled[1];
      }
    );
  }

  /**
   * Checks result of 'enabled' spec evaluation. Returns false if spec is
   * provided and value resolves to a falsey value (empty string, 0, false,
   * null, NaN or undefined).
   * @param {string|boolean} spec Expression that will be evaluated.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<boolean>} False only if spec is provided and value is
   * falsey.
   * @private
   */
  checkSpecEnabled_(spec, expansionOptions) {
    // Spec absence always resolves to true.
    if (spec === undefined) {
      return Promise.resolve(true);
    }

    if (typeof spec === 'boolean') {
      return Promise.resolve(spec);
    }

    return this.expandTemplateWithUrlParams_(spec, expansionOptions).then(
      val => {
        return (
          val !== '' &&
          val !== '0' &&
          val !== 'false' &&
          val !== 'null' &&
          val !== 'NaN' &&
          val !== 'undefined'
        );
      }
    );
  }

  /**
   * Expands spec using provided expansion options and applies url replacement
   * if necessary.
   * @param {string} spec Expression that needs to be expanded.
   * @param {!ExpansionOptions} expansionOptions Expansion options.
   * @return {!Promise<string>} expanded spec.
   * @private
   */
  expandTemplateWithUrlParams_(spec, expansionOptions) {
    return this.variableService_
      .expandTemplate(spec, expansionOptions)
      .then(key =>
        Services.urlReplacementsForDoc(this.element).expandUrlAsync(
          key,
          this.variableService_.getMacros()
        )
      );
  }

  /**
   * @return {string} Returns a string to identify this tag. May not be unique
   * if the element id is not unique.
   * @private
   */
  getName_() {
    return (
      'AmpAnalytics ' + (this.element.getAttribute('id') || '<unknown id>')
    );
  }

  /**
   * @param {!JsonObject|!./events.AnalyticsEvent} source1
   * @param {!JsonObject} source2
   * @param {number=} opt_iterations
   * @param {boolean=} opt_noEncode
   * @return {!ExpansionOptions}
   */
  expansionOptions_(source1, source2, opt_iterations, opt_noEncode) {
    const vars = dict();
    mergeObjects(this.config_['vars'], vars);
    mergeObjects(source2['vars'], vars);
    mergeObjects(source1['vars'], vars);
    return new ExpansionOptions(vars, opt_iterations, opt_noEncode);
  }
}

AMP.extension(TAG, '0.1', AMP => {
  // Register doc-service factory.
  AMP.registerServiceForDoc(
    'amp-analytics-instrumentation',
    InstrumentationService
  );
  AMP.registerServiceForDoc('activity', Activity);
  installLinkerReaderService(AMP.win);
  AMP.registerServiceForDoc('amp-analytics-variables', VariableService);
  // Register the element.
  AMP.registerElement(TAG, AmpAnalytics);
});
