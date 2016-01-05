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
import {assertHttpsUrl} from '../../../src/url';
import {cidFor} from '../../../src/cid';
import {documentStateFor} from '../../../src/document-state';
import {evaluateAccessExpr} from './access-expr';
import {getService} from '../../../src/service';
import {installStyles} from '../../../src/styles';
import {isExperimentOn} from '../../../src/experiments';
import {listenOnce} from '../../../src/event-helper';
import {log} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-state';
import {timer} from '../../../src/timer';
import {urlReplacementsFor} from '../../../src/url-replacements';
import {viewerFor} from '../../../src/viewer';
import {viewportFor} from '../../../src/viewport';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';


/**
 * The configuration properties are:
 * - authorization: The URL of the Authorization endpoint.
 * - pingback: The URL of the Pingback endpoint.
 * - login: The URL of the Login Page.
 *
 * @typedef {{
 *   authorization: string,
 *   pingback: string,
 *   login: string
 * }}
 */
let AccessConfigDef;

/** @const {!Function} */
const assert = AMP.assert;

/** @const */
const EXPERIMENT = 'amp-access';

/** @const */
const TAG = 'AmpAccess';

/** @const {number} */
const VIEW_TIMEOUT = 2000;


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
    installStyles(this.win.document, $CSS$, () => {});

    /** @const @private {boolean} */
    this.isExperimentOn_ = isExperimentOn(this.win, EXPERIMENT);

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

    /** @private @const {!DocumentState} */
    this.docState_ = documentStateFor(this.win);

    /** @private @const {!Viewport} */
    this.viewport_ = viewportFor(this.win);

    /** @private {?Promise<string>} */
    this.readerIdPromise_ = null;

    /** @private {?Promise} */
    this.reportViewPromise_ = null;
  }

  /**
   * @return {!AccessConfigDef}
   * @private
   */
  buildConfig_() {
    let config;
    try {
      config = JSON.parse(this.accessElement_.textContent);
    } catch (e) {
      throw new Error('Failed to parse "amp-access" JSON: ' + e);
    }
    return {
      authorization: assertHttpsUrl(assert(config['authorization'],
          '"authorization" URL must be specified')),
      pingback: assertHttpsUrl(assert(config['pingback'],
          '"pingback" URL must be specified')),
      login: assertHttpsUrl(assert(config['login'],
          '"login" URL must be specified')),
    };
  }

  /**
   * @return {boolean}
   */
  isEnabled() {
    return this.enabled_;
  }

  /**
   * @return {!AccessService}
   * @private
   */
  start_() {
    if (!this.isExperimentOn_) {
      log.info(TAG, 'Access experiment is off: ', EXPERIMENT);
      return this;
    }
    if (!this.enabled_) {
      log.info(TAG, 'Access is disabled - no "id=amp-access" element');
      return this;
    }
    this.startInternal_();
    return this;
  }

  /** @private */
  startInternal_() {
    actionServiceFor(this.win).installActionHandler(
        this.accessElement_, this.handleAction_.bind(this));

    // Start authorization XHR immediately.
    this.runAuthorization_();

    // Wait for the "view" signal.
    this.scheduleView_();
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
        return cid.get('amp-access', consent);
      });
    }
    return this.readerIdPromise_;
  }

  /**
   * @param {string} url
   * @return {!Promise<string>}
   * @private
   */
  buildUrl_(url) {
    return this.getReaderId_().then(readerId => {
      return this.urlReplacements_.expand(url, {
        'READER_ID': readerId
      });
    });
  }

  /**
   * @return {!Promise}
   * @private
   */
  runAuthorization_() {
    log.fine(TAG, 'Start authorization via ', this.config_.authorization);
    this.toggleTopClass_('amp-access-loading', true);
    return this.buildUrl_(this.config_.authorization).then(url => {
      log.fine(TAG, 'Authorization URL: ', url);
      return this.xhr_.fetchJson(url, {credentials: 'include'});
    }).then(response => {
      log.fine(TAG, 'Authorization response: ', response);
      this.toggleTopClass_('amp-access-loading', false);
      onDocumentReady(this.win.document, () => {
        this.applyAuthorization_(response);
      });
    }).catch(error => {
      log.error(TAG, 'Authorization failed: ', error);
      this.toggleTopClass_('amp-access-loading', false);
    });
  }

  /**
   * @param {!JSONObjectDef} response
   * @private
   */
  applyAuthorization_(response) {
    const elements = this.win.document.querySelectorAll('[amp-access]');
    for (let i = 0; i < elements.length; i++) {
      this.applyAuthorizationToElement_(elements[i], response);
    }
  }

  /**
   * @param {!Element} element
   * @param {!JSONObjectDef} response
   * @private
   */
  applyAuthorizationToElement_(element, response) {
    const expr = element.getAttribute('amp-access');
    const on = evaluateAccessExpr(expr, response);

    // TODO(dvoytenko): support templates

    this.vsync_.mutate(() => {
      if (on) {
        element.removeAttribute('amp-access-off');
      } else {
        element.setAttribute('amp-access-off', '');
      }
    });
  }

  /**
   * @private
   */
  scheduleView_() {
    this.docState_.onReady(() => {
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
    this.reportViewPromise_ = this.whenViewed_().then(
        this.reportViewToServer_.bind(this),
        reason => {
          // Ignore - view has been canceled.
          log.fine(TAG, 'view cancelled:', reason);
          this.reportViewPromise_ = null;
          throw reason;
        });
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
          reject();
        }
      }));

      // 2. After a few seconds: register a view.
      const timeoutId = timer.delay(resolve, VIEW_TIMEOUT);
      unlistenSet.push(() => timer.cancel(timeoutId));

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
    return this.buildUrl_(this.config_.pingback).then(url => {
      log.fine(TAG, 'Pingback URL: ', url);
      return this.xhr_.sendSignal(url, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: ''
      });
    }).then(() => {
      log.fine(TAG, 'Pingback complete');
    }).catch(error => {
      log.error(TAG, 'Pingback failed: ', error);
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
    log.fine(TAG, 'Invocation: ', invocation);
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
