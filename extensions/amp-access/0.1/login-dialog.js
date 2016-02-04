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

import {getMode} from '../../../src/mode';
import {listen} from '../../../src/event-helper';
import {log} from '../../../src/log';
import {parseUrl, removeFragment} from '../../../src/url';

/** @const */
const TAG = 'AmpAccessLogin';

/** @const {!Function} */
const assert = AMP.assert;

/** @const {!RegExp} */
const RETURN_URL_REGEX = new RegExp('RETURN_URL');


/**
 * Opens the login dialog for the specified URL. If the login dialog succeeds,
 * the returned promised is resolved with the dialog's response. Otherwise, the
 * returned promise is rejected.
 * @param {!Window} win
 * @param {string|!Promise<string>} urlOrPromise
 * @return {!Promise<string>}
 */
export function openLoginDialog(win, urlOrPromise) {
  return new LoginDialog(win, urlOrPromise).open();
}


class LoginDialog {
  /**
   * @param {!Window} win
   * @param {string|!Promise<string>} urlOrPromise
   */
  constructor(win, urlOrPromise) {
    /** @const {!Window} */
    this.win = win;

    /** @const {string} */
    this.urlOrPromise = urlOrPromise;

    /** @private {?function(string)} */
    this.resolve_ = null;

    /** @private {?function(*)} */
    this.reject_ = null;

    /** @private {?Window} */
    this.dialog_ = null;

    /** @private {?number} */
    this.heartbeatInterval_ = null;

    /** @private {?Unlisten} */
    this.messageUnlisten_ = null;
  }

  /**
   * Opens the dialog. Returns the promise that will yield with the dialog's
   * result or will be rejected if dialog fails.
   * @return {!Promise<string>}
   */
  open() {
    assert(!this.resolve_, 'Dialog already opened');
    return new Promise((resolve, reject) => {
      this.resolve_ = resolve;
      this.reject_ = reject;
      // Must always be called synchronously.
      this.openInternal_();
    }).then(result => {
      this.cleanup_();
      return result;
    }, error => {
      this.cleanup_();
      throw error;
    });
  }

  /** @private */
  cleanup_() {
    this.resolve_ = null;
    this.reject_ = null;

    if (this.dialog_) {
      try {
        this.dialog_.close();
      } catch (e) {
        // Ignore.
      }
      this.dialog_ = null;
    }

    if (this.heartbeatInterval_) {
      this.win.clearInterval(this.heartbeatInterval_);
      this.heartbeatInterval_ = null;
    }

    if (this.messageUnlisten_) {
      this.messageUnlisten_();
      this.messageUnlisten_ = null;
    }
  }

  /** @private */
  openInternal_() {
    const screen = this.win.screen;
    const w = Math.floor(Math.min(700, screen.width * 0.9));
    const h = Math.floor(Math.min(450, screen.height * 0.9));
    const x = Math.floor((screen.width - w) / 2);
    const y = Math.floor((screen.height - h) / 2);
    const options = `height=${h},width=${w},left=${x},top=${y}`;
    const returnUrl = this.getReturnUrl_();

    let dialogReadyPromise = null;
    if (typeof this.urlOrPromise == 'string') {
      const loginUrl = this.buildLoginUrl_(this.urlOrPromise, returnUrl);
      log.fine(TAG, 'Open dialog: ', loginUrl, returnUrl, w, h, x, y);
      this.dialog_ = this.win.open(loginUrl, '_blank', options);
      if (this.dialog_) {
        dialogReadyPromise = Promise.resolve();
      }
    } else {
      log.fine(TAG, 'Open dialog: ', 'about:blank', returnUrl, w, h, x, y);
      this.dialog_ = this.win.open('', '_blank', options);
      if (this.dialog_) {
        dialogReadyPromise = this.urlOrPromise.then(url => {
          const loginUrl = this.buildLoginUrl_(url, returnUrl);
          log.fine(TAG, 'Set dialog url: ', loginUrl);
          this.dialog_.location.replace(loginUrl);
        }, error => {
          throw new Error('failed to resolve url: ' + error);
        });
      }
    }

    if (dialogReadyPromise) {
      dialogReadyPromise.then(() => {
        this.setupDialog_(returnUrl);
      }, error => {
        this.loginDone_(/* result */ null, error);
      });
    } else {
      this.loginDone_(/* result */ null, new Error('failed to open dialog'));
    }
  }

  /**
   * @param {string} returnUrl
   * @private
   */
  setupDialog_(returnUrl) {
    const returnOrigin = parseUrl(returnUrl).origin;

    this.heartbeatInterval_ = this.win.setInterval(() => {
      if (this.dialog_.closed) {
        this.win.clearInterval(this.heartbeatInterval_);
        this.heartbeatInterval_ = null;
        // Give a chance for the result to arrive, but otherwise consider the
        // responce to be empty.
        this.win.setTimeout(() => {
          this.loginDone_('');
        }, 3000);
      }
    }, 500);

    this.messageUnlisten_ = listen(this.win, 'message', e => {
      log.fine(TAG, 'MESSAGE:', e);
      if (e.origin != returnOrigin) {
        return;
      }
      if (!e.data || e.data.sentinel != 'amp') {
        return;
      }
      log.fine(TAG, 'Received message from dialog: ', e.data);
      if (e.data.type == 'result') {
        if (this.dialog_) {
          this.dialog_./*OK*/postMessage({
            sentinel: 'amp',
            type: 'result-ack'
          }, returnOrigin);
        }
        this.loginDone_(e.data.result);
      }
    });
  }

  /**
   * @param {?string} result
   * @param {*=} opt_error
   * @private
   */
  loginDone_(result, opt_error) {
    if (!this.resolve_) {
      return;
    }
    log.fine(TAG, 'Login done: ', result, opt_error);
    if (opt_error) {
      this.reject_(opt_error);
    } else {
      this.resolve_(result);
    }
    this.cleanup_();
  }

  /**
   * @param {string} url
   * @param {string} returnUrl
   * @return {string}
   * @private
   */
  buildLoginUrl_(url, returnUrl) {
    // RETURN_URL has to arrive here unreplaced by UrlReplacements for two
    // reasons: (1) sync replacement and (2) if we need to propagate this
    // replacement to the viewer.
    if (RETURN_URL_REGEX.test(url)) {
      return url.replace(RETURN_URL_REGEX, encodeURIComponent(returnUrl));
    }
    return url +
        (url.indexOf('?') == -1 ? '?' : '&') +
        'return=' + encodeURIComponent(returnUrl);
  }

  /**
   * @return {string}
   * @private
   */
  getReturnUrl_() {
    const currentUrl = removeFragment(this.win.location.href);
    let returnUrl;
    if (getMode().localDev) {
      const loc = this.win.location;
      returnUrl = loc.protocol + '//' + loc.host +
          '/extensions/amp-access/0.1/amp-login-done.html';
    } else {
      returnUrl = 'https://cdn.ampproject.org/v0/amp-login-done-0.1.html';
    }
    return returnUrl + '?url=' + encodeURIComponent(currentUrl);
  }
}
