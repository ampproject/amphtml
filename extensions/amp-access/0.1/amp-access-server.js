/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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
import {isExperimentOn} from '../../../src/experiments';
import {isProxyOrigin, removeFragment} from '../../../src/url';
import {dev} from '../../../src/log';
import {timerFor} from '../../../src/timer';
import {viewerForDoc} from '../../../src/viewer';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';

/** @const {string} */
const TAG = 'amp-access-server';


/**
 * This class implements server-side authorization protocol. In this approach
 * only immediately visible sections are downloaded. For authorization, the
 * CDN calls the authorization endpoint directly and returns back to the
 * authorization response and the authorized content fragments, which are
 * merged into the document.
 *
 * The approximate diagram looks like this:
 *
 *        Initial GET
 *            ||
 *            ||   [Limited document: fragments requiring
 *            ||      authorization are exlcuded]
 *            ||
 *            \/
 *    Authorize request to CDN
 *            ||
 *            ||   [Authorization response]
 *            ||   [Authorized fragments]
 *            ||
 *            \/
 *    Merge authorized fragments
 *            ||
 *            ||
 *            \/
 *    Apply authorization response
 *
 * @implements {AccessTypeAdapterDef}
 */
export class AccessServerAdapter {

  /**
   * @param {!Window} win
   * @param {!JSONType} configJson
   * @param {!AccessTypeAdapterContextDef} context
   */
  constructor(win, configJson, context) {
    /** @const {!Window} */
    this.win = win;

    /** @const @private {!AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @private @const */
    this.clientAdapter_ = new AccessClientAdapter(win, configJson, context);

    /** @private @const {!Viewer} */
    this.viewer_ = viewerForDoc(win.document);

    /** @const @private {!Xhr} */
    this.xhr_ = xhrFor(win);

    /** @const @private {!Timer} */
    this.timer_ = timerFor(win);

    /** @const @private {!Vsync} */
    this.vsync_ = vsyncFor(win);

    const stateElement = this.win.document.querySelector(
        'meta[name="i-amp-access-state"]');

    /** @private @const {?string} */
    this.serverState_ = stateElement ?
        stateElement.getAttribute('content') : null;

    const isInExperiment = isExperimentOn(win, TAG);

    /** @private @const {boolean} */
    this.isProxyOrigin_ = isProxyOrigin(win.location) || isInExperiment;

    const serviceUrlOverride = isInExperiment ?
        this.viewer_.getParam('serverAccessService') : null;

    /** @private @const {string} */
    this.serviceUrl_ = serviceUrlOverride || removeFragment(win.location.href);
  }

  /** @override */
  getConfig() {
    return {
      'client': this.clientAdapter_.getConfig(),
      'proxy': this.isProxyOrigin_,
      'serverState': this.serverState_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    dev().fine(TAG, 'Start authorization with ',
        this.isProxyOrigin_ ? 'proxy' : 'non-proxy',
        this.serverState_,
        this.clientAdapter_.getAuthorizationUrl());
    if (!this.isProxyOrigin_ || !this.serverState_) {
      dev().fine(TAG, 'Proceed via client protocol');
      return this.clientAdapter_.authorize();
    }

    dev().fine(TAG, 'Proceed via server protocol');

    const varsPromise = this.context_.collectUrlVars(
        this.clientAdapter_.getAuthorizationUrl(),
        /* useAuthData */ false);
    return varsPromise.then(vars => {
      const requestVars = {};
      for (const k in vars) {
        if (vars[k] != null) {
          requestVars[k] = String(vars[k]);
        }
      }
      const request = {
        'url': removeFragment(this.win.location.href),
        'state': this.serverState_,
        'vars': requestVars,
      };
      dev().fine(TAG, 'Authorization request: ', this.serviceUrl_, request);
      // Note that `application/x-www-form-urlencoded` is used to avoid
      // CORS preflight request.
      return this.timer_.timeoutPromise(
          this.clientAdapter_.getAuthorizationTimeout(),
          this.xhr_.fetchDocument(this.serviceUrl_, {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
            requireAmpResponseSourceOrigin: false,
          }));
    }).then(response => {
      dev().fine(TAG, 'Authorization response: ', response);
      const accessDataString = dev().assert(
          response.querySelector('script[id="amp-access-data"]'),
          'No authorization data available').textContent;
      const accessData = JSON.parse(accessDataString);
      dev().fine(TAG, '- access data: ', accessData);

      return this.replaceSections_(response).then(() => {
        return accessData;
      });
    });
  }

  /** @override */
  isPingbackEnabled() {
    return this.clientAdapter_.isPingbackEnabled();
  }

  /** @override */
  pingback() {
    return this.clientAdapter_.pingback();
  }

  /**
   * @param {!Document} doc
   * @return {!Promise}
   */
  replaceSections_(doc) {
    const sections = doc.querySelectorAll('[i-amp-access-id]');
    dev().fine(TAG, '- access sections: ', sections);
    return this.vsync_.mutatePromise(() => {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionId = section.getAttribute('i-amp-access-id');
        const target = this.win.document.querySelector(
            '[i-amp-access-id="' + sectionId + '"]');
        if (!target) {
          dev().warn(TAG, 'Section not found: ', sectionId);
          continue;
        }
        target.parentElement.replaceChild(
            this.win.document.importNode(section, /* deep */ true),
            target);
      }
    });
  }
}
