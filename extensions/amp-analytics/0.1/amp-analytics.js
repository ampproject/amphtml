import {Deferred} from '#core/data-structures/promise';
import {isIframed} from '#core/dom';
import {LayoutPriority_Enum} from '#core/dom/layout';
import {rethrowAsync} from '#core/error';
import {isArray, isEnumValue} from '#core/types';
import {hasOwn} from '#core/types/object';
import {expandTemplate} from '#core/types/string';

import {Services} from '#service';

import {dev, devAssert, user} from '#utils/log';

import {Activity} from './activity-impl';
import {AnalyticsConfig, mergeObjects} from './config';
import {CookieWriter} from './cookie-writer';
import {AnalyticsEventType} from './events';
import {
  InstrumentationService,
  instrumentationServicePromiseForDoc,
} from './instrumentation';
import {LinkerManager} from './linker-manager';
import {installLinkerReaderService} from './linker-reader';
import {RequestHandler, expandPostMessage} from './requests';
import {SessionManager, sessionServicePromiseForDoc} from './session-manager';
import {Transport} from './transport';
import {
  ExpansionOptions,
  VariableService,
  stringToBool,
  variableServicePromiseForDoc,
} from './variables';

import {ChunkPriority_Enum, chunk} from '../../../src/chunk';
import {isInFie} from '../../../src/iframe-helper';
import {getMode} from '../../../src/mode';

const TAG = 'amp-analytics';

const MAX_REPLACES = 16; // The maximum number of entries in a extraUrlParamsReplaceMap

const ALLOWLIST_EVENT_IN_SANDBOX = [
  AnalyticsEventType.VISIBLE,
  AnalyticsEventType.HIDDEN,
  AnalyticsEventType.INI_LOAD,
  AnalyticsEventType.RENDER_START,
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
     * @private {{[key: string]: RequestHandler}} A map of request handler with requests
     */
    this.requests_ = {};

    /**
     * @private {!JsonObject}
     */
    this.config_ = {};

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

    /** @private {string} */
    this.type_ = this.element.getAttribute('type');

    /** @private {boolean} */
    this.isInabox_ = getMode(this.win).runtime == 'inabox';

    /** @private {?./linker-manager.LinkerManager} */
    this.linkerManager_ = null;

    /** @private {?./session-manager.SessionManager} */
    this.sessionManager_ = null;

    /** @private {?boolean} */
    this.isInFie_ = null;
  }

  /** @override */
  getLayoutPriority() {
    // Load immediately if inabox, otherwise after other content.
    return this.isInabox_
      ? LayoutPriority_Enum.CONTENT
      : LayoutPriority_Enum.METADATA;
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
      ).then((service) =>
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
        this.transport_.maybeInitIframeTransport(this.element);
      });
    }
  }

  /** @override */
  unlayoutCallback() {
    if (this.getAmpDoc().isVisible()) {
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

    const ampdoc = this.getAmpDoc();
    this.iniPromise_ = ampdoc
      .whenFirstVisible()
      // Rudimentary "idle" signal.
      .then(() => Services.timerFor(this.win).promise(1))
      .then(() => this.consentPromise_)
      .then(() =>
        Promise.all([
          instrumentationServicePromiseForDoc(ampdoc),
          variableServicePromiseForDoc(ampdoc),
        ])
      )
      .then((services) => {
        this.instrumentation_ = services[0];
        this.variableService_ = services[1];
        const loadConfigDeferred = new Deferred();
        const loadConfigTask = () => {
          const configPromise = new AnalyticsConfig(this.element).loadConfig();
          loadConfigDeferred.resolve(configPromise);
        };
        if (this.isInabox_) {
          // Chunk in inabox ad leads to activeview regression, handle seperately
          loadConfigTask();
        } else {
          chunk(this.element, loadConfigTask, ChunkPriority_Enum.HIGH);
        }
        return loadConfigDeferred.promise;
      })
      .then((config) => {
        this.config_ = /** @type {!JsonObject} */ (config);
        // CookieWriter not enabled on proxy origin, do not chunk
        return new CookieWriter(this.win, this.element, this.config_).write();
      })
      .then(() => {
        this.transport_ = new Transport(
          this.getAmpDoc(),
          this.config_['transport'] || {}
        );
      })
      .then(this.maybeInitializeSessionManager_.bind(this))
      .then(this.registerTriggers_.bind(this))
      .then(this.initializeLinker_.bind(this));
    this.iniPromise_.then(() => {
      this./*OK*/ collapse();
    });
    return this.iniPromise_;
  }

  /**
   * @return {boolean} whether parent post messages are allowed.
   *
   * <p>Parent post messages are only allowed for ads.
   *
   * @private
   */
  allowParentPostMessage_() {
    if (this.isInabox_) {
      return true;
    }
    if (this.isInFie_ == null) {
      this.isInFie_ = isInFie(this.element);
    }
    return this.isInFie_;
  }

  /**
   * Maybe initializes Session Manager.
   * @return {!Promise}
   */
  maybeInitializeSessionManager_() {
    if (!this.config_['triggers']) {
      return Promise.resolve();
    }
    const shouldInitialize = Object.values(this.config_['triggers']).some(
      (trigger) => trigger?.['session']?.['persistEvent']
    );
    if (shouldInitialize && this.type_) {
      const ampdoc = this.getAmpDoc();
      return sessionServicePromiseForDoc(ampdoc).then((manager) => {
        this.sessionManager_ = manager;
      });
    }
    return Promise.resolve();
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
      this.user().warn(
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

    this.transport_.maybeInitIframeTransport(this.element);

    const promises = [];
    // Trigger callback can be synchronous. Do the registration at the end.
    for (const k in this.config_['triggers']) {
      if (hasOwn(this.config_['triggers'], k)) {
        const trigger = this.config_['triggers'][k];
        const expansionOptions = this.expansionOptions_(
          {},
          trigger,
          undefined /* opt_iterations */,
          true /* opt_noEncode */
        );
        const TAG = this.getName_();
        if (!trigger) {
          this.user().error(TAG, 'Trigger should be an object: ', k);
          continue;
        }
        const hasRequestOrPostMessage =
          trigger['request'] ||
          (trigger['parentPostMessage'] && this.allowParentPostMessage_());
        if (!trigger['on'] || !hasRequestOrPostMessage) {
          const errorMsgSeg = this.allowParentPostMessage_()
            ? '/"parentPostMessage"'
            : '';
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
            !ALLOWLIST_EVENT_IN_SANDBOX.includes(eventType)
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
          this.isSampledIn_(trigger).then((result) => {
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
              return this.addTrigger_(trigger);
            } else if (trigger['selector'] && !isArray(trigger['selector'])) {
              // Expand the selector using variable expansion.
              return this.variableService_
                .expandTemplate(
                  trigger['selector'],
                  expansionOptions,
                  this.element
                )
                .then((selector) => {
                  trigger['selector'] = selector;
                  return this.addTrigger_(trigger);
                });
            } else {
              return this.addTrigger_(trigger);
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
    Services.preconnectFor(this.win).preload(
      this.getAmpDoc(),
      url,
      opt_preloadAs
    );
  }

  /**
   * Calls `AnalyticsGroup.addTrigger` and reports any errors.
   * @param {!JsonObject} config
   * @private
   * @return {!Promise}
   */
  addTrigger_(config) {
    if (!this.analyticsGroup_) {
      // No need to handle trigger for component that has already been detached
      // from DOM
      return Promise.resolve();
    }
    try {
      return this.analyticsGroup_.addTrigger(
        config,
        this.handleEvent_.bind(this, config)
      );
    } catch (e) {
      const TAG = this.getName_();
      const eventType = config['on'];
      rethrowAsync(TAG, 'Failed to process trigger "' + eventType + '"', e);
      return Promise.resolve();
    }
  }

  /**
   * Replace the names of keys in params object with the values in replace map.
   *
   * @param {!{[key: string]: string}} params The params that need to be renamed.
   * @param {!{[key: string]: string}} replaceMap A map of pattern and replacement
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
      if (!this.allowParentPostMessage_()) {
        const TAG = this.getName_();
        this.user().warn(
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
          (key) => {
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
            Services.preconnectFor(this.win),
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
   * The initialization is asynchronous and non blocking
   * @private
   */
  initializeLinker_() {
    this.linkerManager_ = new LinkerManager(
      this.getAmpDoc(),
      this.config_,
      this.type_,
      this.element
    );
    const linkerTask = () => {
      this.linkerManager_.init();
    };
    if (this.isInabox_) {
      // Chunk in inabox ad leads to activeview regression, handle seperately
      linkerTask();
    } else {
      chunk(this.element, linkerTask, ChunkPriority_Enum.LOW);
    }
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
    const persistEvent = !!trigger.session?.['persistEvent'];
    if (persistEvent) {
      this.sessionManager_?.updateEvent(this.type_);
    }
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
    const hasPostMessage =
      this.allowParentPostMessage_() && trigger['parentPostMessage'];

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
    this.checkTriggerEnabled_(trigger, event).then((enabled) => {
      const isConnected =
        this.element.ownerDocument && this.element.ownerDocument.defaultView;
      if (!enabled || !isConnected) {
        return;
      }
      this.expandAndSendRequest_(request, trigger, event);

      const shouldSendToAmpAd =
        trigger['parentPostMessage'] &&
        this.allowParentPostMessage_() &&
        isIframed(this.win);
      if (shouldSendToAmpAd) {
        this.expandAndPostMessage_(trigger, event);
      }
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
    const expansionOptions = this.expansionOptions_(event, trigger);
    expandPostMessage(
      this.getAmpDoc(),
      msg,
      this.config_['extraUrlParams'],
      trigger,
      expansionOptions,
      this.element
    ).then((message) => {
      this.win.parent./*OK*/ postMessage(message, '*');
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
    const TAG = this.getName_();
    if (!spec) {
      return Promise.resolve(true);
    }
    const sampleOn = spec['sampleOn'];
    if (!sampleOn) {
      this.user().error(TAG, 'Invalid sampleOn value.');
      return Promise.resolve(true);
    }
    const threshold = parseFloat(spec['threshold']);
    if (threshold >= 0 && threshold <= 100) {
      const sampleDeferred = new Deferred();
      const sampleInTask = () => {
        const expansionOptions = this.expansionOptions_({}, trigger);
        const samplePromise = this.expandTemplateWithUrlParams_(
          sampleOn,
          expansionOptions
        )
          .then((key) => this.cryptoService_.uniform(key))
          .then((digest) => digest * 100 < threshold);
        sampleDeferred.resolve(samplePromise);
      };
      if (this.isInabox_) {
        // Chunk in inabox ad leads to activeview regression, handle seperately
        sampleInTask();
      } else {
        chunk(this.element, sampleInTask, ChunkPriority_Enum.LOW);
      }
      return sampleDeferred.promise;
    }
    user()./*OK*/ error(TAG, 'Invalid threshold for sampling.');
    return Promise.resolve(true);
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
      (enabled) => {
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
      (val) => stringToBool(val)
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
      .expandTemplate(spec, expansionOptions, this.element)
      .then((key) =>
        Services.urlReplacementsForDoc(this.element).expandUrlAsync(
          key,
          this.variableService_.getMacros(this.element)
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
    const vars = {};
    mergeObjects(this.config_['vars'], vars);
    mergeObjects(source2['vars'], vars);
    mergeObjects(source1['vars'], vars);
    return new ExpansionOptions(vars, opt_iterations, opt_noEncode);
  }
}

AMP.extension(TAG, '0.1', (AMP) => {
  // Register doc-service factory.
  AMP.registerServiceForDoc(
    'amp-analytics-instrumentation',
    InstrumentationService
  );
  AMP.registerServiceForDoc('activity', Activity);
  installLinkerReaderService(AMP.win);
  AMP.registerServiceForDoc('amp-analytics-session', SessionManager);
  AMP.registerServiceForDoc('amp-analytics-variables', VariableService);
  // Register the element.
  AMP.registerElement(TAG, AmpAnalytics);
});
