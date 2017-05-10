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

import {AccessClientAdapter} from './amp-access-client';
import {AccessOtherAdapter} from './amp-access-other';
import {AccessServerAdapter} from './amp-access-server';
import {AccessServerJwtAdapter} from './amp-access-server-jwt';
import {AccessVendorAdapter} from './amp-access-vendor';
import {CSS} from '../../../build/amp-access-0.1.css';
import {SignInProtocol} from './signin';
import {actionServiceForDoc} from '../../../src/services';
import {triggerAnalyticsEvent} from '../../../src/analytics';
import {assertHttpsUrl, getSourceOrigin} from '../../../src/url';
import {cancellation} from '../../../src/error';
import {cidForDoc} from '../../../src/services';
import {evaluateAccessExpr} from './access-expr';
import {getValueForExpr, tryParseJson} from '../../../src/json';
import {installStyles} from '../../../src/style-installer';
import {installStylesForShadowRoot} from '../../../src/shadow-embed';
import {isExperimentOn} from '../../../src/experiments';
import {isObject} from '../../../src/types';
import {listenOnce} from '../../../src/event-helper';
import {dev, user} from '../../../src/log';
import {openLoginDialog} from './login-dialog';
import {parseQueryString} from '../../../src/url';
import {performanceForOrNull} from '../../../src/services';
import {resourcesForDoc} from '../../../src/services';
import {templatesFor} from '../../../src/services';
import {timerFor} from '../../../src/services';
import {urlReplacementsForDoc} from '../../../src/services';
import {viewerForDoc} from '../../../src/services';
import {viewportForDoc} from '../../../src/services';
import {vsyncFor} from '../../../src/services';
import {startsWith} from '../../../src/string';


/** @const */
const TAG = 'amp-access';

/**
 * The type of access flow.
 * @enum {string}
 */
const AccessType = {
  CLIENT: 'client',
  SERVER: 'server',
  VENDOR: 'vendor',
  OTHER: 'other',
};

/** @const {number} */
const VIEW_TIMEOUT = 2000;

/** @const {string} */
const TEMPLATE_PROP = '__AMP_ACCESS__TEMPLATE';


/**
 * AccessService implements the complete lifecycle of the AMP Access system.
 */
export class AccessService {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   */
  constructor(ampdoc) {
    /** @const */
    this.ampdoc = ampdoc;

    // Install styles.
    if (ampdoc.isSingleDoc()) {
      const root = /** @type {!Document} */ (ampdoc.getRootNode());
      installStyles(root, CSS, () => {}, false, TAG);
    } else {
      const root = /** @type {!ShadowRoot} */ (ampdoc.getRootNode());
      installStylesForShadowRoot(root, CSS, false, TAG);
    }

    const accessElement = ampdoc.getElementById('amp-access');

    /** @const @private {boolean} */
    this.enabled_ = !!accessElement;
    if (!this.enabled_) {
      return;
    }

    /** @const @private {boolean} */
    this.isServerEnabled_ = isExperimentOn(ampdoc.win, 'amp-access-server');

    /** @const @private {boolean} */
    this.isJwtEnabled_ = isExperimentOn(ampdoc.win, 'amp-access-jwt');

    /** @const @private {!Element} */
    this.accessElement_ = accessElement;

    const configJson = tryParseJson(this.accessElement_.textContent, e => {
      throw user().createError('Failed to parse "amp-access" JSON: ' + e);
    });

    /** @const @private {!AccessType} */
    this.type_ = this.buildConfigType_(configJson);

    /** @const @private {!Object<string, string>} */
    this.loginConfig_ = this.buildConfigLoginMap_(configJson);

    /** @const @private {!JSONType} */
    this.authorizationFallbackResponse_ =
        configJson['authorizationFallbackResponse'];

    /** @const @private {!AccessTypeAdapterDef} */
    this.adapter_ = this.createAdapter_(configJson);

    /** @const @private {string} */
    this.pubOrigin_ = getSourceOrigin(ampdoc.win.location);

    /** @const @private {!Timer} */
    this.timer_ = timerFor(ampdoc.win);

    /** @const @private {!Vsync} */
    this.vsync_ = vsyncFor(ampdoc.win);

    /** @const @private {!UrlReplacements} */
    this.urlReplacements_ = urlReplacementsForDoc(ampdoc);

    // TODO(dvoytenko, #3742): This will refer to the ampdoc once AccessService
    // is migrated to ampdoc as well.
    /** @private @const {!Cid} */
    this.cid_ = cidForDoc(ampdoc);

    /** @private @const {!Viewer} */
    this.viewer_ = viewerForDoc(ampdoc);

    /** @private @const {!Viewport} */
    this.viewport_ = viewportForDoc(ampdoc);

    /** @private @const {!Templates} */
    this.templates_ = templatesFor(ampdoc.win);

    /** @private @const {!Resources} */
    this.resources_ = resourcesForDoc(ampdoc);

    /** @private @const {?Performance} */
    this.performance_ = performanceForOrNull(ampdoc.win);

    /** @private @const {function(string):Promise<string>} */
    this.openLoginDialog_ = openLoginDialog.bind(null, ampdoc);

    /** @private {?Promise<string>} */
    this.readerIdPromise_ = null;

    /** @private {?JSONType} */
    this.authResponse_ = null;

    /** @const @private {!SignInProtocol} */
    this.signIn_ = new SignInProtocol(ampdoc, this.viewer_, this.pubOrigin_,
        configJson);

    /** @const @private {!Promise} */
    this.firstAuthorizationPromise_ = new Promise(resolve => {
      /** @private {!Promise} */
      this.firstAuthorizationResolver_ = resolve;
    });

    /** @private {!Promise} */
    this.lastAuthorizationPromise_ = this.firstAuthorizationPromise_;

    /** @private {?Promise} */
    this.reportViewPromise_ = null;

    /** @private {!Object<string, string>} */
    this.loginUrlMap_ = {};

    /** @private {?Promise} */
    this.loginPromise_ = null;

    /** @private {time} */
    this.loginStartTime_ = 0;

    this.firstAuthorizationPromise_.then(() => {
      this.analyticsEvent_('access-authorization-received');
      if (this.performance_) {
        this.performance_.tick('aaa');
        this.performance_.tickSinceVisible('aaav');
        this.performance_.flush();
      }
    });
  }

  /**
   * @param {string} name
   * @param {./access-vendor.AccessVendor} vendor
   */
  registerVendor(name, vendor) {
    user().assert(this.type_ == AccessType.VENDOR,
        'Acccess vendor "%s" can only be used for "type=vendor"', name);
    const vendorAdapter = /** @type {!AccessVendorAdapter} */ (this.adapter_);
    vendorAdapter.registerVendor(name, vendor);
  }

  /**
   * @param {!JSONType} configJson
   * @return {!AccessTypeAdapterDef}
   * @private
   */
  createAdapter_(configJson) {
    const context = /** @type {!AccessTypeAdapterContextDef} */ ({
      buildUrl: this.buildUrl.bind(this),
      collectUrlVars: this.collectUrlVars_.bind(this),
    });
    const isJwt = (this.isJwtEnabled_ && configJson['jwt'] === true);
    switch (this.type_) {
      case AccessType.CLIENT:
        if (isJwt) {
          return new AccessServerJwtAdapter(this.ampdoc, configJson, context);
        }
        return new AccessClientAdapter(this.ampdoc, configJson, context);
      case AccessType.SERVER:
        if (isJwt) {
          return new AccessServerJwtAdapter(this.ampdoc, configJson, context);
        }
        return new AccessServerAdapter(this.ampdoc, configJson, context);
      case AccessType.VENDOR:
        return new AccessVendorAdapter(this.ampdoc, configJson, context);
      case AccessType.OTHER:
        return new AccessOtherAdapter(this.ampdoc, configJson, context);
    }
    throw dev().createError('Unsupported access type: ', this.type_);
  }

  /**
   * @return {!JSONType}
   */
  getAdapterConfig() {
    return this.adapter_.getConfig();
  }

  /**
   * @param {!JSONType} configJson
   * @return {!AccessType}
   */
  buildConfigType_(configJson) {
    let type = configJson['type'] ?
        user().assertEnumValue(AccessType, configJson['type'], 'access type') :
        null;
    if (!type) {
      if (configJson['vendor']) {
        type = AccessType.VENDOR;
      } else {
        type = AccessType.CLIENT;
      }
    }
    if (type == AccessType.SERVER && !this.isServerEnabled_) {
      user().warn(TAG, 'Experiment "amp-access-server" is not enabled.');
      type = AccessType.CLIENT;
    }
    if (type == AccessType.CLIENT && this.isServerEnabled_) {
      user().info(TAG, 'Forcing access type: SERVER');
      type = AccessType.SERVER;
    }
    return type;
  }

  /**
   * @param {!JSONType} configJson
   * @return {?Object<string, string>}
   * @private
   */
  buildConfigLoginMap_(configJson) {
    const loginConfig = configJson['login'];
    const loginMap = {};
    if (!loginConfig) {
      // Ignore: in some cases login config is not necessary.
    } else if (typeof loginConfig == 'string') {
      loginMap[''] = loginConfig;
    } else if (isObject(loginConfig)) {
      for (const k in loginConfig) {
        loginMap[k] = loginConfig[k];
      }
    } else {
      user().assert(false,
          '"login" must be either a single URL or a map of URLs');
    }

    // Check that all URLs are valid.
    for (const k in loginMap) {
      assertHttpsUrl(loginMap[k]);
    }
    return loginMap;
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.enabled_;
  }

  /**
   * @return {!Element}
   * @private
   */
  getRootElement_() {
    const root = this.ampdoc.getRootNode();
    return dev().assertElement(root.documentElement || root.body || root);
  }

  /**
   * @param {string} eventType
   * @private
   */
  analyticsEvent_(eventType) {
    triggerAnalyticsEvent(this.ampdoc, eventType);
  }

  /**
   * @return {!AccessService}
   * @private
   */
  start_() {
    if (!this.enabled_) {
      user().info(TAG, 'Access is disabled - no "id=amp-access" element');
      return this;
    }
    this.startInternal_();
    return this;
  }

  /** @private */
  startInternal_() {
    dev().fine(TAG, 'config:', this.type_, this.loginConfig_,
        this.adapter_.getConfig());

    // TODO(dvoytenko, #3742): This will refer to the ampdoc once AccessService
    // is migrated to ampdoc as well.
    actionServiceForDoc(this.ampdoc).installActionHandler(
        this.accessElement_, this.handleAction_.bind(this));

    // Calculate login URLs right away.
    this.buildLoginUrls_();

    // Start sign-in.
    this.signIn_.start();

    // Start authorization XHR immediately.
    this.runAuthorization_();

    // Wait for the "view" signal.
    this.scheduleView_(VIEW_TIMEOUT);

    // Listen to amp-access broadcasts from other pages.
    this.listenToBroadcasts_();
  }

  /** @private */
  listenToBroadcasts_() {
    this.viewer_.onBroadcast(message => {
      if (message['type'] == 'amp-access-reauthorize' &&
              message['origin'] == this.pubOrigin_) {
        this.runAuthorization_();
      }
    });
  }

  /** @private */
  broadcastReauthorize_() {
    this.viewer_.broadcast({
      'type': 'amp-access-reauthorize',
      'origin': this.pubOrigin_,
    });
  }

  /**
   * @return {!Promise<string>}
   * @private
   */
  getReaderId_() {
    if (!this.readerIdPromise_) {
      // No consent - an essential part of the access system.
      const consent = Promise.resolve();
      this.readerIdPromise_ = this.cid_.then(cid => {
        return cid.get({scope: 'amp-access', createCookieIfNotPresent: true},
            consent);
      });
    }
    return this.readerIdPromise_;
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<string>}
   */
  buildUrl(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then(vars => {
      return this.urlReplacements_.expandAsync(url, vars);
    });
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!Object<string, *>>}
   * @private
   */
  collectUrlVars_(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then(vars => {
      return this.urlReplacements_.collectVars(url, vars);
    });
  }

  /**
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!Object<string, *>>}
   * @private
   */
  prepareUrlVars_(useAuthData) {
    return this.getReaderId_().then(readerId => {
      const vars = {
        'READER_ID': readerId,
        'ACCESS_READER_ID': readerId,  // A synonym.
        'ACCESS_TOKEN': () => this.signIn_.getAccessTokenPassive(),
      };
      if (useAuthData) {
        vars['AUTHDATA'] = field => {
          if (this.authResponse_) {
            return getValueForExpr(this.authResponse_, field);
          }
          return undefined;
        };
      }
      return vars;
    });
  }

  /**
   * Returns the promise that resolves when all authorization work has
   * completed, including authorization endpoint call and UI update.
   * Note that this promise never fails.
   * @param {boolean=} opt_disableFallback
   * @return {!Promise}
   * @private
   */
  runAuthorization_(opt_disableFallback) {
    if (!this.adapter_.isAuthorizationEnabled()) {
      dev().fine(TAG, 'Ignore authorization for type=', this.type_);
      this.firstAuthorizationResolver_();
      return Promise.resolve();
    }

    this.toggleTopClass_('amp-access-loading', true);
    const startPromise = this.viewer_.whenFirstVisible();
    const responsePromise = startPromise.then(() => {
      return this.adapter_.authorize();
    }).catch(error => {
      this.analyticsEvent_('access-authorization-failed');
      if (this.authorizationFallbackResponse_ && !opt_disableFallback) {
        // Use fallback.
        user().error(TAG, 'Authorization failed: ', error);
        return this.authorizationFallbackResponse_;
      } else {
        // Rethrow the error, it will be processed in the bottom `catch`.
        throw error;
      }
    });
    const promise = responsePromise.then(response => {
      dev().fine(TAG, 'Authorization response: ', response);
      this.setAuthResponse_(response);
      this.toggleTopClass_('amp-access-loading', false);
      this.toggleTopClass_('amp-access-error', false);
      this.buildLoginUrls_();
      return this.ampdoc.whenReady().then(
          () => this.applyAuthorization_(response));
    }).catch(error => {
      user().error(TAG, 'Authorization failed: ', error);
      this.toggleTopClass_('amp-access-loading', false);
      this.toggleTopClass_('amp-access-error', true);
    });
    // The "first" promise must always succeed first.
    this.lastAuthorizationPromise_ = Promise.all(
        [this.firstAuthorizationPromise_, promise]);
    return promise;
  }

  /**
   * @param {!JSONType} authResponse
   * @private
   */
  setAuthResponse_(authResponse) {
    this.authResponse_ = authResponse;
    this.firstAuthorizationResolver_();
  }

  /**
   * Returns the promise that will yield the access READER_ID.
   *
   * This is a restricted API.
   *
   * @return {?Promise<string>}
   */
  getAccessReaderId() {
    if (!this.enabled_) {
      return null;
    }
    return this.getReaderId_();
  }

  /**
   * Returns the promise that will yield the value of the specified field from
   * the authorization response. This method will wait for the most recent
   * authorization request to complete.
   *
   * This is a restricted API.
   *
   * @param {string} field
   * @return {?Promise<*|null>}
   */
  getAuthdataField(field) {
    if (!this.enabled_) {
      return null;
    }
    return this.lastAuthorizationPromise_.then(() => {
      if (!this.authResponse_) {
        return null;
      }
      const v = getValueForExpr(this.authResponse_, field);
      return v !== undefined ? v : null;
    });
  }

  /**
   * @return {!Promise} Returns a promise for the initial authorization.
   */
  whenFirstAuthorized() {
    return this.firstAuthorizationPromise_;
  }

  /**
   * @param {!JSONTypeDef} response
   * @return {!Promise}
   * @private
   */
  applyAuthorization_(response) {
    const elements = this.ampdoc.getRootNode().querySelectorAll('[amp-access]');
    const promises = [];
    for (let i = 0; i < elements.length; i++) {
      promises.push(this.applyAuthorizationToElement_(elements[i], response));
    }
    return Promise.all(promises);
  }

  /**
   * @param {!Element} element
   * @param {!JSONTypeDef} response
   * @return {!Promise}
   * @private
   */
  applyAuthorizationToElement_(element, response) {
    const expr = element.getAttribute('amp-access');
    const on = evaluateAccessExpr(expr, response);
    let renderPromise = null;
    if (on) {
      renderPromise = this.renderTemplates_(element, response);
    }
    if (renderPromise) {
      return renderPromise.then(() =>
          this.applyAuthorizationAttrs_(element, on));
    }
    return this.applyAuthorizationAttrs_(element, on);
  }

  /**
   * @param {!Element} element
   * @param {boolean} on
   * @return {!Promise}
   * @private
   */
  applyAuthorizationAttrs_(element, on) {
    const wasOn = !element.hasAttribute('amp-access-hide');
    if (on == wasOn) {
      return Promise.resolve();
    }
    return this.resources_.mutateElement(element, () => {
      if (on) {
        element.removeAttribute('amp-access-hide');
      } else {
        element.setAttribute('amp-access-hide', '');
      }
    });
  }

  /**
   * Discovers and renders templates.
   * @param {!Element} element
   * @param {!JSONTypeDef} response
   * @return {!Promise}
   * @private
   */
  renderTemplates_(element, response) {
    const promises = [];
    const templateElements = element.querySelectorAll('[amp-access-template]');
    if (templateElements.length > 0) {
      for (let i = 0; i < templateElements.length; i++) {
        const p = this.renderTemplate_(element, templateElements[i], response)
            .catch(error => {
              // Ignore the error.
              dev().error(TAG, 'Template failed: ', error,
                  templateElements[i], element);
            });
        promises.push(p);
      }
    }
    return promises.length > 0 ? Promise.all(promises) : null;
  }

  /**
   * @param {!Element} element
   * @param {!Element} templateOrPrev
   * @param {!JSONTypeDef} response
   * @return {!Promise}
   * @private
   */
  renderTemplate_(element, templateOrPrev, response) {
    let template = templateOrPrev;
    let prev = null;
    if (template.tagName != 'TEMPLATE') {
      prev = template;
      template = prev[TEMPLATE_PROP];
    }
    if (!template) {
      return Promise.reject(new Error('template not found'));
    }

    const rendered = this.templates_.renderTemplate(template, response);
    return rendered.then(element => {
      return this.vsync_.mutatePromise(() => {
        element.setAttribute('amp-access-template', '');
        element[TEMPLATE_PROP] = template;
        if (template.parentElement) {
          template.parentElement.replaceChild(element, template);
        } else if (prev && prev.parentElement) {
          prev.parentElement.replaceChild(element, prev);
        }
      });
    });
  }

  /**
   * @param {time} timeToView
   * @private
   */
  scheduleView_(timeToView) {
    if (!this.adapter_.isPingbackEnabled()) {
      return;
    }
    this.reportViewPromise_ = null;
    this.ampdoc.whenReady().then(() => {
      if (this.viewer_.isVisible()) {
        this.reportWhenViewed_(timeToView);
      }
      this.viewer_.onVisibilityChanged(() => {
        if (this.viewer_.isVisible()) {
          this.reportWhenViewed_(timeToView);
        }
      });
    });
  }

  /**
   * @param {time} timeToView
   * @return {!Promise}
   * @private
   */
  reportWhenViewed_(timeToView) {
    if (this.reportViewPromise_) {
      return this.reportViewPromise_;
    }
    dev().fine(TAG, 'start view monitoring');
    this.reportViewPromise_ = this.whenViewed_(timeToView)
        .then(() => {
          // Wait for the most recent authorization flow to complete.
          return this.lastAuthorizationPromise_;
        })
        .then(() => {
          // Report the analytics event.
          this.analyticsEvent_('access-viewed');
          return this.reportViewToServer_();
        })
        .catch(reason => {
          // Ignore - view has been canceled.
          dev().fine(TAG, 'view cancelled:', reason);
          this.reportViewPromise_ = null;
          throw reason;
        });
    this.reportViewPromise_.then(this.broadcastReauthorize_.bind(this));
    return this.reportViewPromise_;
  }

  /**
   * The promise will be resolved when a view of this document has occurred. It
   * will be rejected if the current impression should not be counted as a view.
   * @param {time} timeToView Pass the value of 0 when this method is called
   *   as the result of the user action.
   * @return {!Promise}
   * @private
   */
  whenViewed_(timeToView) {
    if (timeToView == 0) {
      // Immediate view has been registered. This will happen when this method
      // is called as the result of the user action.
      return Promise.resolve();
    }

    // Viewing kick off: document is visible.
    const unlistenSet = [];
    return new Promise((resolve, reject) => {
      // 1. Document becomes invisible again: cancel.
      unlistenSet.push(this.viewer_.onVisibilityChanged(() => {
        if (!this.viewer_.isVisible()) {
          reject(cancellation());
        }
      }));

      // 2. After a few seconds: register a view.
      const timeoutId = this.timer_.delay(resolve, timeToView);
      unlistenSet.push(() => this.timer_.cancel(timeoutId));

      // 3. If scrolled: register a view.
      unlistenSet.push(this.viewport_.onScroll(resolve));

      // 4. Tap: register a view.
      unlistenSet.push(listenOnce(this.ampdoc.getRootNode(),
          'click', resolve));
    }).then(() => {
      unlistenSet.forEach(unlisten => unlisten());
    }, reason => {
      unlistenSet.forEach(unlisten => unlisten());
      throw reason;
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  reportViewToServer_() {
    return this.adapter_.pingback().then(() => {
      dev().fine(TAG, 'Pingback complete');
      this.analyticsEvent_('access-pingback-sent');
    }).catch(error => {
      this.analyticsEvent_('access-pingback-failed');
      throw user().createError('Pingback failed: ', error);
    });
  }

  /**
   * @param {string} className
   * @param {boolean} on
   * @private
   */
  toggleTopClass_(className, on) {
    this.vsync_.mutate(() => {
      this.getRootElement_().classList.toggle(className, on);
    });
  }

  /**
   * @param {!ActionInvocation} invocation
   * @private
   */
  handleAction_(invocation) {
    if (invocation.method == 'login') {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.loginWithType_('');
    } else if (startsWith(invocation.method, 'login-')) {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.loginWithType_(invocation.method.substring('login-'.length));
    }
  }

  /**
   * Runs the login flow using one of the predefined urls in the amp-access config
   *
   * @private
   * @param {string} type Type of login defined in the config
   * @return {!Promise}
   */
  loginWithType_(type) {
    user().assert(this.loginConfig_[type],
        'Login URL is not configured: %s', type);
    // Login URL should always be available at this time.
    const loginUrl = user().assert(this.loginUrlMap_[type],
        'Login URL is not ready: %s', type);
    return this.login_(loginUrl, type);
  }

  /**
   * Runs the login flow opening the given url in the login window.
   *
   * @param {string} url
   * @param {string} eventLabel A label used for the analytics event for this action
   * @return {!Promise}
   */
  loginWithUrl(url, eventLabel = '') {
    return this.login_(url, eventLabel);
  }

  /**
   * Runs the Login flow. Returns a promise that is resolved if login succeeds
   * or is rejected if login fails. Login flow is performed as an external
   * 1st party Web dialog. It's goal is to authenticate the reader.
   *
   * Type can be either an empty string for a default login or a name of the
   * login URL.
   *
   * @private
   * @param {string} loginUrl
   * @param {string} eventLabel A label used for the analytics event for this action
   * @return {!Promise}
   */
  login_(loginUrl, eventLabel) {
    const now = Date.now();

    // If login is pending, block a new one from starting for 1 second. After
    // 1 second, however, the new login request will be allowed to proceed,
    // given that we cannot always determine fully if the previous attempt is
    // "stuck".
    if (this.loginPromise_ && (now - this.loginStartTime_ < 1000)) {
      return this.loginPromise_;
    }

    dev().fine(TAG, 'Start login: ', loginUrl, eventLabel);

    this.loginAnalyticsEvent_(eventLabel, 'started');
    const dialogPromise = this.signIn_.requestSignIn(loginUrl) ||
        this.openLoginDialog_(loginUrl);
    const loginPromise = dialogPromise.then(result => {
      dev().fine(TAG, 'Login dialog completed: ', eventLabel, result);
      this.loginPromise_ = null;
      const query = parseQueryString(result);
      const s = query['success'];
      const success = (s == 'true' || s == 'yes' || s == '1');
      if (success) {
        this.loginAnalyticsEvent_(eventLabel, 'success');
      } else {
        this.loginAnalyticsEvent_(eventLabel, 'rejected');
      }
      const exchangePromise = this.signIn_.postLoginResult(query) ||
          Promise.resolve();
      if (success || !s) {
        // In case of a success, repeat the authorization and pingback flows.
        // Also do this for an empty response to avoid false negatives.
        // Pingback is repeated in this case since this could now be a new
        // "view" with a different access profile.
        return exchangePromise.then(() => {
          this.broadcastReauthorize_();
          return this.runAuthorization_(/* disableFallback */ true)
              .then(() => {
                this.scheduleView_(/* timeToView */ 0);
              });
        });
      }
    }).catch(reason => {
      dev().fine(TAG, 'Login dialog failed: ', eventLabel, reason);
      this.loginAnalyticsEvent_(eventLabel, 'failed');
      if (this.loginPromise_ == loginPromise) {
        this.loginPromise_ = null;
      }
      throw reason;
    });
    this.loginPromise_ = loginPromise;
    this.loginStartTime_ = now;
    return this.loginPromise_;
  }

  /**
   * @param {string} type
   * @param {string} event
   * @private
   */
  loginAnalyticsEvent_(type, event) {
    this.analyticsEvent_(`access-login-${event}`);
    if (type) {
      this.analyticsEvent_(`access-login-${type}-${event}`);
    }
  }

  /**
   * @return {?Promise<!{type: string, url: string}>}
   * @private
   */
  buildLoginUrls_() {
    if (Object.keys(this.loginConfig_).length == 0) {
      return null;
    }
    const promises = [];
    for (const k in this.loginConfig_) {
      promises.push(
          this.buildUrl(this.loginConfig_[k], /* useAuthData */ true)
              .then(url => {
                this.loginUrlMap_[k] = url;
                return {type: k, url};
              }));
    }
    return Promise.all(promises);
  }
}


/**
 * @typedef {{
 *   buildUrl: function(string, boolean):!Promise<string>,
 *   collectUrlVars: function(string, boolean):
 *       !Promise<!Object<string, *>>
 * }}
 */
let AccessTypeAdapterContextDef;


/**
 * @interface
 */
class AccessTypeAdapterDef {

  /**
   * @return {!JSONType}
   */
  getConfig() {}

  /**
   * @return {boolean}
   */
  isAuthorizationEnabled() {}

  /**
   * @return {!Promise<!JSONType>}
   */
  authorize() {}

  /**
   * @return {boolean}
   */
  isPingbackEnabled() {}

  /**
   * @return {!Promise}
   */
  pingback() {}
}


// Register the extension services.
AMP.extension(TAG, '0.1', function(AMP) {
  AMP.registerServiceForDoc(
      'access',
      /* ctor */ undefined,
      ampdoc => {
        return new AccessService(ampdoc).start_();
      });
});
