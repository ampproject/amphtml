/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Messenger} from './iframe-api/messenger';
import {assertHttpsUrl} from '../../../src/url';
import {isArray} from '../../../src/types';
import {parseJson} from '../../../src/json';
import {parseUrl} from '../../../src/url';
import {toggle} from '../../../src/style';
import {user} from '../../../src/log';


/** @implements {./amp-access-source.AccessTypeAdapterDef} */
export class AccessIframeAdapter {

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

    /** @const @private {!JsonObject} */
    this.configJson_ = configJson;

    /** @const @private {string} */
    this.iframeSrc_ = user().assert(configJson['iframeSrc'],
        '"iframeSrc" URL must be specified');
    assertHttpsUrl(this.iframeSrc_, '"iframeSrc"');

    /** @const @private {?Array} */
    this.iframeVars_ = configJson['iframeVars'] || null;
    if (this.iframeVars_) {
      user().assert(isArray(this.iframeVars_),
          '"iframeVars" must be an array');
    }

    /** @private @const {string} */
    this.targetOrigin_ = parseUrl(this.iframeSrc_).origin;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {?Promise} */
    this.connectedPromise_ = null;

    /** @private @const {!Element} */
    this.iframe_ = ampdoc.win.document.createElement('iframe');
    toggle(this.iframe_, false);

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.ampdoc.win,
        () => this.iframe_.contentWindow,
        this.targetOrigin_);

    /** @private @const {?Promise<!JsonObject>} */
    this.configPromise_ = null;
  }

  /**
   * Disconnect the client.
   */
  disconnect() {
    this.messenger_.disconnect();
    this.ampdoc.getBody().removeChild(this.iframe_);
  }

  /** @override */
  getConfig() {
    return {
      'iframeSrc': this.iframeSrc_,
      'iframeVars': this.iframeVars_,
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp('authorize', {});
    }).then(response => {
      // TODO(dvoytenko): process the `granted` flag.
      return response;
    });
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback() {
    return this.connect().then(() => {
      return this.messenger_.sendCommandRsvp('pingback', {});
    });
  }

  /**
   * @return {!Promise}
   * @package Visible for testing only.
   */
  connect() {
    if (!this.connectedPromise_) {
      this.connectedPromise_ = new Promise(resolve => {
        this.connectedResolver_ = resolve;
      });
      this.configPromise_ = this.resolveConfig_();
      // Connect.
      this.messenger_.connect(this.handleCommand_.bind(this));
      this.ampdoc.getBody().appendChild(this.iframe_);
      this.iframe_.src = this.iframeSrc_;
    }
    return this.connectedPromise_;
  }

  /**
   * @return {!Promise<!JsonObject>}
   * @private
   */
  resolveConfig_() {
    return new Promise(resolve => {
      const configJson = parseJson(JSON.stringify(this.configJson_));
      if (this.iframeVars_) {
        const varsString = this.iframeVars_.join('&');
        const varsPromise = this.context_.collectUrlVars(
            varsString,
            /* useAuthData */ false);
        resolve(varsPromise.then(vars => {
          configJson['iframeVars'] = vars;
          return configJson;
        }));
      } else {
        resolve(configJson);
      }
    });
  }

  /**
   * @param {string} cmd
   * @param {?Object} unusedPayload
   * @return {*}
   * @private
   */
  handleCommand_(cmd, unusedPayload) {
    if (cmd == 'connect') {
      // First ever message. Indicates that the receiver is listening.
      this.configPromise_.then(configJson => {
        this.messenger_.sendCommandRsvp('start', {
          'protocol': 'amp-access',
          'config': configJson,
        }).then(() => {
          // Confirmation that connection has been successful.
          if (this.connectedResolver_) {
            this.connectedResolver_();
            this.connectedResolver_ = null;
          }
        });
      });
      return;
    }
  }
}
