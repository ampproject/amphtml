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

import {actionServiceFor} from '../../../src/action';
import {analyticsFor} from '../../../src/analytics';
import {assert, assertEnumValue} from '../../../src/asserts';
import {assertHttpsUrl, getSourceOrigin} from '../../../src/url';
import {cancellation} from '../../../src/error';
import {cidFor} from '../../../src/cid';
import {evaluateAccessExpr} from './access-expr';
import {getService} from '../../../src/service';
import {getValueForExpr} from '../../../src/json';
import {installStyles} from '../../../src/styles';
import {isObject} from '../../../src/types';
import {listenOnce} from '../../../src/event-helper';
import {log} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-ready';
import {openLoginDialog} from './login-dialog';
import {parseQueryString} from '../../../src/url';
import {resourcesFor} from '../../../src/resources';
import {templatesFor} from '../../../src/template';
import {timer} from '../../../src/timer';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {viewerFor} from '../../../src/viewer';
import {viewportFor} from '../../../src/viewport';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';


/**
 * The configuration properties are:
 * - type: The type of access workflow: client, server or other.
 * - authorization: The URL of the Authorization endpoint.
 * - pingback: The URL of the Pingback endpoint.
 * - loginMap: The URL of the Login Page or a map of URLs.
 *
 * @typedef {{
 *   type: !AccessType,
 *   authorization: (string|undefined),
 *   pingback: (string|undefined),
 *   loginMap: !Object<string, string>,
 *   authorizationFallbackResponse: !JSONObject
 * }}
 */
let AccessConfigDef;

/**
 * The type of access flow.
 * @enum {string}
 */
const AccessType = {
  CLIENT: 'client',
  SERVER: 'server',
  OTHER: 'other',
};

/** @const */
const TAG = 'AmpAccess';

/** @const {number} */
const AUTHORIZATION_TIMEOUT = 3000;

/** @const {number} */
const VIEW_TIMEOUT = 2000;

/** @const {string} */
const TEMPLATE_PROP = '__AMP_ACCESS__TEMPLATE';


/**
 * AccessService implements the complete lifecycle of the AMP Access system.
 */
export class AccessService {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
    installStyles(this.win.document, $CSS$, () => {}, false, 'amp-access');

    /** @const @private {boolean} */
    this.isAnalyticsExperimentOn_ = true;

    const accessElement = document.getElementById('amp-access');

    /** @const @private {boolean} */
    this.enabled_ = !!accessElement;
    if (!this.enabled_) {
      return;
    }

    /** @const @private {!Element} */
    this.accessElement_ = accessElement;

    /** @const @private {!AccessConfigDef} */
    this.config_ = this.buildConfig_();

    /** @const @private {string} */
    this.pubOrigin_ = getSourceOrigin(this.win.location);

    /** @const @private {!Timer} */
    this.timer_ = timer;

    /** @const @private {!Vsync} */
    this.vsync_ = vsyncFor(this.win);

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(this.win);

    /** @const @private {!UrlReplacements} */
    this.urlReplacements_ = urlReplacementsFor(this.win);

    /** @private @const {!Cid} */
    this.cid_ = cidFor(this.win);

    /** @private @const {!Viewer} */
    this.viewer_ = viewerFor(this.win);

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private @const {!Templates} */
    this.templates_ = templatesFor(this.win);

    /** @private @const {!Resources} */
    this.resources_ = resourcesFor(this.win);

    /** @private @const {function(string):Promise<string>} */
    this.openLoginDialog_ = openLoginDialog.bind(null, this.win);

    /** @private {?Promise<string>} */
    this.readerIdPromise_ = null;

    /** @private {?JSONObject} */
    this.authResponse_ = null;

    /** @private {!Promise} */
    this.firstAuthorizationPromise_ = new Promise(resolve => {
      /** @private {!Promise} */
      this.firstAuthorizationResolver_ = resolve;
    });

    /** @private {?Promise} */
    this.reportViewPromise_ = null;

    /** @private {!Object<string, string>} */
    this.loginUrlMap_ = {};

    /** @private {?Promise} */
    this.loginPromise_ = null;

    /** @private {time} */
    this.loginStartTime_ = 0;

    /** @private {!Promise<!InstrumentationService>} */
    this.analyticsPromise_ = analyticsFor(this.win);

    this.firstAuthorizationPromise_.then(() => {
      this.analyticsEvent_('access-authorization-received');
    });
  }

  /**
   * @return {!AccessConfigDef}
   * @private
   */
  buildConfig_() {
    let configJson;
    try {
      configJson = JSON.parse(this.accessElement_.textContent);
    } catch (e) {
      throw new Error('Failed to parse "amp-access" JSON: ' + e);
    }

    // Access type.
    const type = configJson['type'] ?
        assertEnumValue(AccessType, configJson['type'], 'access type') :
        AccessType.CLIENT;
    const config = {
      type: type,
      authorization: configJson['authorization'],
      pingback: configJson['pingback'],
      loginMap: this.buildConfigLoginMap_(configJson['login']),
      authorizationFallbackResponse:
          configJson['authorizationFallbackResponse'],
    };

    // Check that all URLs are valid.
    if (config.authorization) {
      assertHttpsUrl(config.authorization);
    }
    if (config.pingback) {
      assertHttpsUrl(config.pingback);
    }
    for (const k in config.loginMap) {
      assertHttpsUrl(config.loginMap[k]);
    }

    // Validate type = client/server.
    if (type == AccessType.CLIENT || type == AccessType.SERVER) {
      assert(config.authorization, '"authorization" URL must be specified');
      assert(config.pingback, '"pingback" URL must be specified');
      assert(Object.keys(config.loginMap).length > 0,
          'At least one "login" URL must be specified');
    }
    return config;
  }

  /**
   * @return {?Object<string, string>}
   * @private
   */
  buildConfigLoginMap_(loginConfig) {
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
      assert(false, '"login" must be either a single URL or a map of URLs');
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
   * @param {string} eventType
   * @private
   */
  analyticsEvent_(eventType) {
    if (this.isAnalyticsExperimentOn_) {
      this.analyticsPromise_.then(analytics => {
        analytics.triggerEvent(eventType);
      });
    }
  }

  /**
   * @return {!AccessService}
   * @private
   */
  start_() {
    if (!this.enabled_) {
      log.info(TAG, 'Access is disabled - no "id=amp-access" element');
      return this;
    }
    this.startInternal_();
    return this;
  }

  /** @private */
  startInternal_() {
    log.fine(TAG, 'config:', this.config_);

    actionServiceFor(this.win).installActionHandler(
        this.accessElement_, this.handleAction_.bind(this));

    // Calculate login URLs right away.
    this.buildLoginUrls_();

    // Start authorization XHR immediately.
    this.runAuthorization_();

    // Wait for the "view" signal.
    this.scheduleView_();

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
   * @private
   */
  buildUrl_(url, useAuthData) {
    return this.getReaderId_().then(readerId => {
      const vars = {
        'READER_ID': readerId,
        'ACCESS_READER_ID': readerId,  // A synonym.
      };
      if (useAuthData) {
        vars['AUTHDATA'] = field => {
          if (this.authResponse_) {
            return getValueForExpr(this.authResponse_, field);
          }
          return undefined;
        };
      }
      return this.urlReplacements_.expand(url, vars);
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  runAuthorization_() {
    if (this.config_.type == AccessType.OTHER) {
      log.fine(TAG, 'Ignore authorization due to type=other');
      this.firstAuthorizationResolver_();
      return Promise.resolve();
    }

    log.fine(TAG, 'Start authorization via ', this.config_.authorization);
    this.toggleTopClass_('amp-access-loading', true);
    const promise = this.buildUrl_(
        this.config_.authorization, /* useAuthData */ false);
    return promise.then(url => {
      log.fine(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchJson(url, {
            credentials: 'include',
            requireAmpResponseSourceOrigin: true,
          }));
    }).catch(error => {
      this.analyticsEvent_('access-authorization-failed');
      if (this.config_.authorizationFallbackResponse) {
        // Use fallback.
        setTimeout(() => {throw error;});
        return this.config_.authorizationFallbackResponse;
      } else {
        // Rethrow the error.
        throw error;
      }
    }).then(response => {
      log.fine(TAG, 'Authorization response: ', response);
      this.setAuthResponse_(response);
      this.toggleTopClass_('amp-access-loading', false);
      this.toggleTopClass_('amp-access-error', false);
      this.buildLoginUrls_();
      return new Promise((resolve, reject) => {
        onDocumentReady(this.win.document, () => {
          this.applyAuthorization_(response).then(resolve, reject);
        });
      });
    }).catch(error => {
      log.error(TAG, 'Authorization failed: ', error);
      this.toggleTopClass_('amp-access-loading', false);
      this.toggleTopClass_('amp-access-error', true);
    });
  }

  /**
   * @param {!JSONObject} authResponse
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
    if (!this.isAnalyticsExperimentOn_) {
      return null;
    }
    if (!this.enabled_) {
      return null;
    }
    return this.getReaderId_();
  }

  /**
   * Returns the field from the authorization response. If the authorization
   * response have not been received yet, the result will be `null`.
   *
   * This is a restricted API.
   *
   * @param {string} field
   * @return {*|null}
   */
  getAuthdataField(field) {
    if (!this.isAnalyticsExperimentOn_) {
      return null;
    }
    if (!this.enabled_ || !this.authResponse_) {
      return null;
    }
    return getValueForExpr(this.authResponse_, field) || null;
  }


  /**
   * @return {!Promise} Returns a promise for the initial authorization.
   */
  whenFirstAuthorized() {
    return this.firstAuthorizationPromise_;
  }

  /**
   * @param {!JSONObjectDef} response
   * @return {!Promise}
   * @private
   */
  applyAuthorization_(response) {
    const elements = this.win.document.querySelectorAll('[amp-access]');
    const promises = [];
    for (let i = 0; i < elements.length; i++) {
      promises.push(this.applyAuthorizationToElement_(elements[i], response));
    }
    return Promise.all(promises);
  }

  /**
   * @param {!Element} element
   * @param {!JSONObjectDef} response
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
   * @param {!JSONObjectDef} response
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
              log.error(TAG, 'Template failed: ', error,
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
   * @param {!JSONObjectDef} response
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
   * @private
   */
  scheduleView_() {
    onDocumentReady(this.win.document, () => {
      if (this.viewer_.isVisible()) {
        this.reportWhenViewed_();
      }
      this.viewer_.onVisibilityChanged(() => {
        if (this.viewer_.isVisible()) {
          this.reportWhenViewed_();
        }
      });
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  reportWhenViewed_() {
    if (this.reportViewPromise_) {
      return this.reportViewPromise_;
    }
    log.fine(TAG, 'start view monitoring');
    this.reportViewPromise_ = this.whenViewed_()
        .then(() => {
          this.analyticsEvent_('access-viewed');
          // Wait for the first authorization flow to complete.
          return this.firstAuthorizationPromise_;
        })
        .then(
            this.reportViewToServer_.bind(this),
            reason => {
              // Ignore - view has been canceled.
              log.fine(TAG, 'view cancelled:', reason);
              this.reportViewPromise_ = null;
              throw reason;
            });
    this.reportViewPromise_.then(this.broadcastReauthorize_.bind(this));
    return this.reportViewPromise_;
  }

  /**
   * The promise will be resolved when a view of this document has occurred. It
   * will be rejected if the current impression should not be counted as a view.
   * @return {!Promise}
   * @private
   */
  whenViewed_() {
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
      const timeoutId = this.timer_.delay(resolve, VIEW_TIMEOUT);
      unlistenSet.push(() => this.timer_.cancel(timeoutId));

      // 3. If scrolled: register a view.
      unlistenSet.push(this.viewport_.onScroll(resolve));

      // 4. Tap: register a view.
      unlistenSet.push(listenOnce(this.win.document.documentElement,
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
    if (!this.config_.pingback) {
      log.fine(TAG, 'Ignore pingback');
      return Promise.resolve();
    }
    const promise = this.buildUrl_(
        this.config_.pingback, /* useAuthData */ true);
    return promise.then(url => {
      log.fine(TAG, 'Pingback URL: ', url);
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        requireAmpResponseSourceOrigin: true,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: '',
      });
    }).then(() => {
      log.fine(TAG, 'Pingback complete');
      this.analyticsEvent_('access-pingback-sent');
    }).catch(error => {
      log.error(TAG, 'Pingback failed: ', error);
      this.analyticsEvent_('access-pingback-failed');
      throw error;
    });
  }

  /**
   * @param {string} className
   * @param {boolean} on
   * @private
   */
  toggleTopClass_(className, on) {
    this.vsync_.mutate(() => {
      this.win.document.documentElement.classList.toggle(className, on);
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
      this.login('');
    } else if (invocation.method.indexOf('login-') == 0) {
      if (invocation.event) {
        invocation.event.preventDefault();
      }
      this.login(invocation.method.substring('login-'.length));
    }
  }

  /**
   * Runs the Login flow. Returns a promise that is resolved if login succeeds
   * or is rejected if login fails. Login flow is performed as an external
   * 1st party Web dialog. It's goal is to authenticate the reader.
   *
   * Type can be either an empty string for a default login or a name of the
   * login URL.
   *
   * @param {string} type
   * @return {!Promise}
   */
  login(type) {
    const now = this.timer_.now();

    // If login is pending, block a new one from starting for 1 second. After
    // 1 second, however, the new login request will be allowed to proceed,
    // given that we cannot always determine fully if the previous attempt is
    // "stuck".
    if (this.loginPromise_ && (now - this.loginStartTime_ < 1000)) {
      return this.loginPromise_;
    }

    log.fine(TAG, 'Start login: ', type);
    assert(this.config_.loginMap[type],
        'Login URL is not configured: %s', type);
    // Login URL should always be available at this time.
    const loginUrl = assert(this.loginUrlMap_[type],
        'Login URL is not ready: %s', type);

    this.loginAnalyticsEvent_(type, 'started');
    const loginPromise = this.openLoginDialog_(loginUrl).then(result => {
      log.fine(TAG, 'Login dialog completed: ', type, result);
      this.loginPromise_ = null;
      const query = parseQueryString(result);
      const s = query['success'];
      const success = (s == 'true' || s == 'yes' || s == '1');
      if (success) {
        this.loginAnalyticsEvent_(type, 'success');
        this.broadcastReauthorize_();
        // Repeat the authorization flow.
        return this.runAuthorization_();
      } else {
        this.loginAnalyticsEvent_(type, 'rejected');
      }
    }).catch(reason => {
      log.fine(TAG, 'Login dialog failed: ', type, reason);
      this.loginAnalyticsEvent_(type, 'failed');
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
    const loginMap = this.config_.loginMap;
    if (Object.keys(loginMap).length == 0) {
      return null;
    }
    const promises = [];
    for (const k in loginMap) {
      promises.push(
          this.buildUrl_(loginMap[k], /* useAuthData */ true).then(url => {
            this.loginUrlMap_[k] = url;
            return {type: k, url: url};
          }));
    }
    return Promise.all(promises);
  }
}


/**
 * @param {!Window} win
 * @return {!AccessService}
 */
export function installAccessService(win) {
  return getService(win, 'access', () => {
    return new AccessService(win).start_();
  });
};

installAccessService(AMP.win);
