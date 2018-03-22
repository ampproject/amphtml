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
import {parseUrl} from '../../../src/url';
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

    /** @private @const {string} */
    this.targetOrigin_ = parseUrl(this.iframeSrc_).origin;

    /** @private {?function()} */
    this.connectedResolver_ = null;

    /** @private @const {!Promise} */
    this.connectedPromise_ = new Promise(resolve => {
      this.connectedResolver_ = resolve;
    });

    /** @private @const {!Element} */
    this.iframe_ = ampdoc.win.document.createElement('iframe');
    this.iframe_.style.display = 'none';

    /** @private @const {!Messenger} */
    this.messenger_ = new Messenger(
        this.ampdoc.win,
        () => this.iframe_.contentWindow,
        this.targetOrigin_);

    // Connect.
    this.messenger_.connect(this.handleCommand_.bind(this));
    this.ampdoc.getBody().appendChild(this.iframe_);
    this.iframe_.src = this.iframeSrc_;
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
    };
  }

  /** @override */
  isAuthorizationEnabled() {
    return true;
  }

  /** @override */
  authorize() {
    return this.connectedPromise_.then(() => {
      return this.messenger_.sendCommandRsvp('authorize', {});
    }).then(response => {
      // TODO(dvoytenko): reformat the response.
      return response;
    });
  }

  /** @override */
  isPingbackEnabled() {
    return true;
  }

  /** @override */
  pingback() {
    return this.connectedPromise_.then(() => {
      return this.messenger_.sendCommandRsvp('pingback', {});
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
      this.messenger_.sendCommandRsvp('start', {
        'protocol': 'amp-access',
        'config': this.configJson_,
      }).then(() => {
        // Confirmation that connection has been successful.
        if (this.connectedResolver_) {
          this.connectedResolver_();
          this.connectedResolver_ = null;
        }
      });
      return;
    }
  }
}
