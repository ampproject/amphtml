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
import {JwtHelper} from './jwt';
import {assertHttpsUrl} from '../../../src/url';
import {getMode} from '../../../src/mode';
import {isArray} from '../../../src/types';
import {isExperimentOn} from '../../../src/experiments';
import {
  isProxyOrigin,
  removeFragment,
  serializeQueryString,
} from '../../../src/url';
import {dev, user} from '../../../src/log';
import {timerFor} from '../../../src/timer';
import {viewerForDoc} from '../../../src/viewer';
import {vsyncFor} from '../../../src/vsync';
import {xhrFor} from '../../../src/xhr';

/** @const {string} */
const TAG = 'amp-access-server-jwt';

/** @const {number} */
const AUTHORIZATION_TIMEOUT = 3000;

/** @const {string} */
const AMP_AUD = 'ampproject.org';


/**
 * This class implements server-side authorization protocol with JWT. In this
 * approach only immediately visible sections are downloaded. For authorization,
 * the client calls the authorization endpoint, which returns a signed JWT
 * token with `amp_authdata` field. The client calls CDN with this JWT token,
 * and CDN returns back the authorized content fragments.
 *
 * The approximate diagram looks like this:
 *
 *        Initial GET
 *            ||
 *            ||   [Limited document: fragments requiring
 *            ||      authorization are exlcuded]
 *            ||
 *            \/
 *    Authorize request to Publisher
 *            ||
 *            ||   [Authorization response as JWT]
 *            ||
 *            \/
 *    Authorize request to CDN w/JWT
 *            ||
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
export class AccessServerJwtAdapter {

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

    /** @const @private {?string} */
    this.key_ = configJson['publicKey'] || null;

    /** @const @private {?string} */
    this.keyUrl_ = configJson['publicKeyUrl'] || null;

    user().assert(this.key_ || this.keyUrl_,
        '"publicKey" or "publicKeyUrl" must be specified');
    if (this.keyUrl_) {
      assertHttpsUrl(this.keyUrl_, '"publicKeyUrl"');
    }
    if (this.key_ && this.keyUrl_) {
      // TODO(dvoytenko): Remove "publicKey" option eventually.
      user().warn(TAG,
          'Both "publicKey" and "publicKeyUrl" specified. ' +
          'The "publicKeyUrl" will be ignored.');
    }

    /** @private @const {!JwtHelper} */
    this.jwtHelper_ = new JwtHelper(win);
  }

  /** @override */
  getConfig() {
    return {
      'client': this.clientAdapter_.getConfig(),
      'proxy': this.isProxyOrigin_,
      'serverState': this.serverState_,
      'publicKey': this.key_,
      'publicKeyUrl': this.keyUrl_,
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
      return this.authorizeOnClient_();
    }
    return this.authorizeOnServer_();
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
   * @return {!Promise<{encoded:string, jwt:!JSONObject}>}
   * @private
   */
  fetchJwt_() {
    const urlPromise = this.context_.buildUrl(
        this.clientAdapter_.getAuthorizationUrl(),
        /* useAuthData */ false);
    let jwtPromise = urlPromise.then(url => {
      dev().fine(TAG, 'Authorization URL: ', url);
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchText(url, {
            credentials: 'include',
            requireAmpResponseSourceOrigin: true,
          }));
    }).then(encoded => {
      const jwt = this.jwtHelper_.decode(encoded);
      user().assert(jwt['amp_authdata'],
          '"amp_authdata" must be present in JWT');
      return {encoded, jwt};
    });
    if (this.shouldBeValidated_()) {
      // Validate JWT in the development mode.
      if (this.jwtHelper_.isVerificationSupported()) {
        jwtPromise = jwtPromise.then(resp => {
          return this.jwtHelper_
              .decodeAndVerify(resp.encoded, this.loadKeyPem_())
              .then(() => resp);
        });
      } else {
        user().warn(TAG, 'Cannot verify signature on this browser since' +
            ' it doesn\'t support WebCrypto APIs');
      }
      jwtPromise = jwtPromise.then(resp => {
        this.validateJwt_(resp.jwt);
        return resp;
      });
    }
    return jwtPromise.catch(reason => {
      throw user().createError('JWT fetch or validation failed: ', reason);
    });
  }

  /**
   * @return {!Promise<string>}
   * @private
   */
  loadKeyPem_() {
    if (this.key_) {
      return Promise.resolve(this.key_);
    }
    return this.xhr_.fetchText(this.keyUrl_);
  }

  /**
   * @return {boolean}
   * @private
   */
  shouldBeValidated_() {
    return getMode().development;
  }

  /**
   * @param {!JSONObject} jwt
   * @private
   */
  validateJwt_(jwt) {
    const now = Date.now();

    // exp: expiration time.
    const exp = jwt['exp'];
    user().assert(exp, '"exp" field must be specified');
    user().assert(parseFloat(exp) * 1000 > now,
        'token has expired: %s', exp);

    // aud: audience.
    const aud = jwt['aud'];
    user().assert(aud, '"aud" field must be specified');
    let audForAmp = false;
    if (isArray(aud)) {
      for (let i = 0; i < aud.length; i++) {
        if (aud[i] == AMP_AUD) {
          audForAmp = true;
          break;
        }
      }
    } else {
      audForAmp = (aud == AMP_AUD);
    }
    user().assert(audForAmp, '"aud" must be "%s": %s', AMP_AUD, aud);
  }

  /**
   * @return {!Promise<!JSONType>}
   * @private
   */
  authorizeOnClient_() {
    dev().fine(TAG, 'Proceed via client protocol via ',
        this.clientAdapter_.getAuthorizationUrl());
    return this.fetchJwt_().then(resp => {
      return resp.jwt['amp_authdata'];
    });
  }

  /**
   * @return {!Promise<!JSONType>}
   * @private
   */
  authorizeOnServer_() {
    dev().fine(TAG, 'Proceed via server protocol');
    return this.fetchJwt_().then(resp => {
      const encoded = resp.encoded;
      const jwt = resp.jwt;
      const accessData = jwt['amp_authdata'];
      const request = serializeQueryString({
        'url': removeFragment(this.win.location.href),
        'state': this.serverState_,
        'jwt': encoded,
      });
      dev().fine(TAG, 'Authorization request: ', this.serviceUrl_, request);
      dev().fine(TAG, '- access data: ', accessData);
      // Note that `application/x-www-form-urlencoded` is used to avoid
      // CORS preflight request.
      return this.timer_.timeoutPromise(
          AUTHORIZATION_TIMEOUT,
          this.xhr_.fetchDocument(this.serviceUrl_, {
            method: 'POST',
            body: request,
            headers: {
              'Content-Type': 'application/x-www-form-urlencoded',
            },
          })).then(response => {
            dev().fine(TAG, 'Authorization response: ', response);
            return this.replaceSections_(response);
          }).then(() => accessData);
    });
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
