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
import {Services} from '../../../src/services';
import {dev, devAssert} from '../../../src/log';
import {dict} from '../../../src/utils/object';
import {escapeCssSelectorIdent} from '../../../src/css';
import {fetchDocument} from '../../../src/document-fetcher';
import {isExperimentOn} from '../../../src/experiments';
import {isProxyOrigin, removeFragment} from '../../../src/url';
import {parseJson} from '../../../src/json';

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
 * @implements {./amp-access-source.AccessTypeAdapterDef}
 */
export class AccessServerAdapter {
  /**
   * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
   * @param {!JsonObject} configJson
   * @param {!./amp-access-source.AccessTypeAdapterContextDef} context
   */
  constructor(ampdoc, configJson, context) {
    /** @const */
    this.ampdoc = ampdoc;

    /** @const @private {!./amp-access-source.AccessTypeAdapterContextDef} */
    this.context_ = context;

    /** @private @const */
    this.clientAdapter_ = new AccessClientAdapter(ampdoc, configJson, context);

    /** @private @const {!../../../src/service/viewer-impl.Viewer} */
    this.viewer_ = Services.viewerForDoc(ampdoc);

    /** @const @private {!../../../src/service/xhr-impl.Xhr} */
    this.xhr_ = Services.xhrFor(ampdoc.win);

    /** @const @private {!../../../src/service/timer-impl.Timer} */
    this.timer_ = Services.timerFor(ampdoc.win);

    /** @const @private {!../../../src/service/vsync-impl.Vsync} */
    this.vsync_ = Services.vsyncFor(ampdoc.win);

    const stateElement = ampdoc
      .getRootNode()
      .querySelector('meta[name="i-amphtml-access-state"]');

    /** @private @const {?string} */
    this.serverState_ = stateElement
      ? stateElement.getAttribute('content')
      : null;

    const isInExperiment = isExperimentOn(ampdoc.win, 'amp-access-server');

    /** @private @const {boolean} */
    this.isProxyOrigin_ = isProxyOrigin(ampdoc.win.location) || isInExperiment;

    const serviceUrlOverride = isInExperiment
      ? this.viewer_.getParam('serverAccessService')
      : null;

    /** @private @const {string} */
    this.serviceUrl_ =
      serviceUrlOverride || removeFragment(ampdoc.win.location.href);
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
    dev().fine(
      TAG,
      'Start authorization with ',
      this.isProxyOrigin_ ? 'proxy' : 'non-proxy',
      this.serverState_,
      this.clientAdapter_.getAuthorizationUrl()
    );
    if (!this.isProxyOrigin_ || !this.serverState_) {
      dev().fine(TAG, 'Proceed via client protocol');
      return this.clientAdapter_.authorize();
    }

    dev().fine(TAG, 'Proceed via server protocol');

    const varsPromise = this.context_.collectUrlVars(
      this.clientAdapter_.getAuthorizationUrl(),
      /* useAuthData */ false
    );
    return varsPromise
      .then(vars => {
        const requestVars = {};
        for (const k in vars) {
          if (vars[k] != null) {
            requestVars[k] = String(vars[k]);
          }
        }
        const request = dict({
          'url': removeFragment(this.ampdoc.win.location.href),
          'state': this.serverState_,
          'vars': requestVars,
        });
        dev().fine(TAG, 'Authorization request: ', this.serviceUrl_, request);
        // Note that `application/x-www-form-urlencoded` is used to avoid
        // CORS preflight request.
        return this.timer_.timeoutPromise(
          this.clientAdapter_.getAuthorizationTimeout(),
          fetchDocument(this.ampdoc.win, this.serviceUrl_, {
            method: 'POST',
            body: 'request=' + encodeURIComponent(JSON.stringify(request)),
            headers: dict({
              'Content-Type': 'application/x-www-form-urlencoded',
            }),
            requireAmpResponseSourceOrigin: false,
          })
        );
      })
      .then(responseDoc => {
        dev().fine(TAG, 'Authorization response: ', responseDoc);
        const accessDataString = devAssert(
          responseDoc.querySelector('script[id="amp-access-data"]'),
          'No authorization data available'
        ).textContent;
        const accessData = parseJson(accessDataString);
        dev().fine(TAG, '- access data: ', accessData);

        return this.replaceSections_(responseDoc).then(() => {
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

  /** @override */
  postAction() {
    // Nothing to do.
  }

  /**
   * @param {!Document} doc
   * @return {!Promise}
   */
  replaceSections_(doc) {
    const sections = doc.querySelectorAll('[i-amphtml-access-id]');
    dev().fine(TAG, '- access sections: ', sections);
    return this.vsync_.mutatePromise(() => {
      for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        const sectionId = section.getAttribute('i-amphtml-access-id');
        const target = this.ampdoc
          .getRootNode()
          .querySelector(
            `[i-amphtml-access-id="${escapeCssSelectorIdent(sectionId)}"]`
          );
        if (!target) {
          dev().warn(TAG, 'Section not found: ', sectionId);
          continue;
        }
        target.parentElement.replaceChild(
          this.ampdoc.win.document.importNode(section, /* deep */ true),
          target
        );
      }
    });
  }
}
