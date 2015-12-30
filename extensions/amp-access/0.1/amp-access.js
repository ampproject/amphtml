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
import {evaluateAccessExpr} from './access-expr';
import {getService} from '../../../src/service';
import {installStyles} from '../../../src/styles';
import {isExperimentOn} from '../../../src/experiments';
import {log} from '../../../src/log';
import {onDocumentReady} from '../../../src/document-state';
import {urlReplacementsFor} from '../../../src/url-replacements';
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
  }

  /**
   * @return {!Promise}
   * @private
   */
  runAuthorization_() {
    log.fine(TAG, 'Start authorization via ', this.config_.authorization);
    this.toggleTopClass_('amp-access-loading', true);

    // TODO(dvoytenko): produce READER_ID and create the URL substition for it.
    return this.urlReplacements_.expand(this.config_.authorization)
        .then(url => {
          log.fine(TAG, 'Authorization URL: ', url);
          return this.xhr_.fetchJson(url, {credentials: 'include'});
        })
        .then(response => {
          log.fine(TAG, 'Authorization response: ', response);
          this.toggleTopClass_('amp-access-loading', false);
          onDocumentReady(this.win.document, () => {
            this.applyAuthorization_(response);
          });
        })
        .catch(error => {
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
