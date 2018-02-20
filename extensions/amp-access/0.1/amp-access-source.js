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

import {AccessClientAdapter} from './amp-access-client';
import {AccessOtherAdapter} from './amp-access-other';
import {AccessServerAdapter} from './amp-access-server';
import {AccessServerJwtAdapter} from './amp-access-server-jwt';
import {AccessVendorAdapter} from './amp-access-vendor';
import {Services} from '../../../src/services';
import {SignInProtocol} from './signin';
import {assertHttpsUrl, getSourceOrigin} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {getLoginUrl, openLoginDialog} from './login-dialog';
import {getValueForExpr} from '../../../src/json';
import {isExperimentOn} from '../../../src/experiments';
import {isObject} from '../../../src/types';
import {parseQueryString} from '../../../src/url';
import {triggerAnalyticsEvent} from '../../../src/analytics';


/** @const */
const TAG = 'amp-access';

/**
 * The type of access flow.
 * @enum {string}
 */
export const AccessType = {
  CLIENT: 'client',
  SERVER: 'server',
  VENDOR: 'vendor',
  OTHER: 'other',
};


/**
 * AccessSource represents a single source of authentication information for a page.
 * These sources are constructed, unified and attached to the document by AccessService.
 */
export class AccessSource {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {function():!Promise<string>} readerIdFn
   * @param {function(time)} scheduleViewFn
   * @param {function()} broadcastReauthorizeFn
   * @param {!Element} accessElement
   */
  constructor(ampdoc, configJson, readerIdFn, scheduleViewFn,
    broadcastReauthorizeFn, accessElement) {

    /** @const */
    this.ampdoc = ampdoc;

    /** @const */
    this.getReaderId_ = readerIdFn;

    /** @const */
    this.scheduleView_ = scheduleViewFn;

    /** @const */
    this.broadcastReauthorize_ = broadcastReauthorizeFn;

    /** @const */
    this.accessElement_ = accessElement;

    /** @const @private {boolean} */
    this.isServerEnabled_ = isExperimentOn(ampdoc.win, 'amp-access-server');

    /** @const @private {boolean} */
    this.isJwtEnabled_ = isExperimentOn(ampdoc.win, 'amp-access-jwt');

    /** @const {!AccessType} */
    this.type_ = this.buildConfigType_(configJson);

    /** @const {!JsonObject} */
    this.loginConfig_ = this.buildConfigLoginMap_(configJson);

    /** @const {?JsonObject} */
    this.authorizationFallbackResponse_ =
        configJson['authorizationFallbackResponse'];

    /** @const {?string} */
    this.namespace_ = configJson['namespace'] || null;

    /** @const {!AccessTypeAdapterDef} */
    this.adapter_ = this.createAdapter_(configJson);

    /** @const @private {!string} */
    this.pubOrigin_ = getSourceOrigin(ampdoc.win.location);

    /** @const @private {!../../../src/service/url-replacements-impl.UrlReplacements} */
    this.urlReplacements_ = Services.urlReplacementsForDoc(ampdoc);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @private @const {function(string):Promise<string>} */
    this.openLoginDialog_ = openLoginDialog.bind(null, ampdoc);

    /** @private {?JsonObject} */
    this.authResponse_ = null;

    /** @const @private {!SignInProtocol} */
    this.signIn_ = new SignInProtocol(ampdoc, this.viewer_, this.pubOrigin_,
        configJson);

    /** @private {?Function} */
    this.firstAuthorizationResolver_ = null;

    /**
     * This pattern allows AccessService to attach behavior to authorization
     * before runAuthorization() is actually called.
     * @const @private {!Promise}
     */
    this.firstAuthorizationPromise_ = new Promise(resolve => {
      this.firstAuthorizationResolver_ = resolve;
    });

    /** @private {!Object<string, string>} */
    this.loginUrlMap_ = {};

    /** @private {?Promise} */
    this.loginPromise_ = null;

    /** @private {!time} */
    this.loginStartTime_ = 0;
  }

  /**
   * @returns {?string}
   */
  getNamespace() {
    return this.namespace_;
  }

  /** @return {!AccessType} */
  getType() {
    return this.type_;
  }

  /** @return {!AccessTypeAdapterDef} */
  getAdapter() {
    return this.adapter_;
  }

  /** @return {?JsonObject} */
  getAuthResponse() {
    return this.authResponse_;
  }

  /**
   * @param {!JsonObject} configJson
   * @return {!AccessTypeAdapterDef}
   * @private
   */
  createAdapter_(configJson) {
    const context = /** @type {!AccessTypeAdapterContextDef} */ ({
      buildUrl: this.buildUrl.bind(this),
      collectUrlVars: this.collectUrlVars.bind(this),
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
        return new AccessVendorAdapter(this.ampdoc, configJson);
      case AccessType.OTHER:
        return new AccessOtherAdapter(this.ampdoc, configJson, context);
    }
    throw dev().createError('Unsupported access type: ', this.type_);
  }

  /**
   * @return {!JsonObject}
   */
  getAdapterConfig() {
    return this.adapter_.getConfig();
  }


  /**
   * @return {!Promise} Returns a promise for the initial authorization.
   */
  whenFirstAuthorized() {
    return this.firstAuthorizationPromise_;
  }

  /**
   * @param {!JsonObject} configJson
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
   * @param {!JsonObject} configJson
   * @return {!JsonObject}
   * @private
   */
  buildConfigLoginMap_(configJson) {
    const loginConfig = configJson['login'];
    const loginMap = dict();
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
      assertHttpsUrl(loginMap[k], this.accessElement_);
    }
    return loginMap;
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
    triggerAnalyticsEvent(this.getRootElement_(), eventType);
  }

  /**
   * Do some initial setup.
   */
  start() {
    dev().fine(TAG, 'config:', this.type_, this.loginConfig_,
        this.adapter_.getConfig());

    // Calculate login URLs right away.
    this.buildLoginUrls_();

    // Start sign-in.
    this.signIn_.start();
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<string>}
   */
  buildUrl(url, useAuthData) {
    return this.prepareUrlVars_(useAuthData).then(vars => {
      return this.urlReplacements_.expandUrlAsync(url, vars);
    });
  }

  /**
   * @param {string} url
   * @param {boolean} useAuthData Allows `AUTH(field)` URL var substitutions.
   * @return {!Promise<!Object<string, *>>}
   */
  collectUrlVars(url, useAuthData) {
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
        'ACCESS_READER_ID': readerId, // A synonym.
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
   * Returns the promise that resolves when authorization call has completed.
   * Note that this promise never fails.
   * @param {boolean=} opt_disableFallback
   * @return {!Promise}
   */
  runAuthorization(opt_disableFallback) {
    if (!this.adapter_.isAuthorizationEnabled()) {
      dev().fine(TAG, 'Ignore authorization for type=', this.type_);
      this.firstAuthorizationResolver_();
      return Promise.resolve();
    }

    const responsePromise =
      this.adapter_.authorize().catch(error => {
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
      this.buildLoginUrls_();
      return response;
    }).catch(error => {
      user().error(TAG, 'Authorization failed: ', error);
      this.firstAuthorizationResolver_();
      throw error;
    });

    return promise;
  }

  /**
   * @param {!JsonObject} authResponse
   * @private
   */
  setAuthResponse_(authResponse) {
    this.authResponse_ = authResponse;
    this.firstAuthorizationResolver_();
  }

  /**
   * @return {!Promise}
   */
  reportViewToServer() {
    return this.adapter_.pingback().then(() => {
      dev().fine(TAG, 'Pingback complete');
      this.analyticsEvent_('access-pingback-sent');
    }).catch(error => {
      this.analyticsEvent_('access-pingback-failed');
      throw user().createError('Pingback failed: ', error);
    });
  }

  /**
   * Expose the getLoginUrl method with the current ampdoc context
   * @param {string|!Promise<string>} urlOrPromise
   * @return {!Promise<string>}
   */
  getLoginUrl(urlOrPromise) {
    return getLoginUrl(this.ampdoc, urlOrPromise);
  }

  /**
   * Runs the login flow using one of the predefined urls in the amp-access config
   *
   * @param {string} type Type of login defined in the config
   * @return {!Promise}
   */
  loginWithType(type) {
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
          return this.runAuthorization(/* disableFallback */ true)
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
   * @return {?Promise<!Array<!{type: string, url: string}>>}
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
export let AccessTypeAdapterContextDef;


/**
 * @interface
 */
export class AccessTypeAdapterDef {

  /**
   * @return {!JsonObject}
   */
  getConfig() {}

  /**
   * @return {boolean}
   */
  isAuthorizationEnabled() {}

  /**
   * @return {!Promise<!JsonObject>}
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
