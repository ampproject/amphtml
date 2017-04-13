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
import {dev, user} from '../../../src/log';
import {openWindowDialog} from '../../../src/dom';
import {parseUrl} from '../../../src/url';
import {viewerForDoc} from '../../../src/services';
import {urls} from '../../../src/config';

/** @const */
const TAG = 'amp-access-login';

/** @const {!RegExp} */
const RETURN_URL_REGEX = new RegExp('RETURN_URL');


/**
 * Opens the login dialog for the specified URL. If the login dialog succeeds,
 * the returned promised is resolved with the dialog's response. Otherwise, the
 * returned promise is rejected.
 * @param {!../../../src/service/ampdoc-impl.AmpDoc} ampdoc
 * @param {string|!Promise<string>} urlOrPromise
 * @return {!Promise<string>}
 */
export function openLoginDialog(ampdoc, urlOrPromise) {
  const viewer = viewerForDoc(ampdoc);
  const overrideDialog = parseInt(viewer.getParam('dialog'), 10);
  if (overrideDialog) {
    return new ViewerLoginDialog(viewer, urlOrPromise).open();
  }
  return new WebLoginDialog(ampdoc.win, viewer, urlOrPromise).open();
}


/**
 * The implementation of the Login Dialog delegated via Viewer.
 */
class ViewerLoginDialog {
  /**
   * @param {!Viewer} viewer
   * @param {string|!Promise<string>} urlOrPromise
   */
  constructor(viewer, urlOrPromise) {
    /** @const {!Viewer} */
    this.viewer = viewer;

    /** @const {string|!Promise<string>} */
    this.urlOrPromise = urlOrPromise;
  }

  /**
   * Opens the dialog. Returns the promise that will yield with the dialog's
   * result or will be rejected if dialog fails. The dialog's result is
   * typically a hash string from the return URL.
   * @return {!Promise<string>}
   */
  open() {
    let urlPromise;
    if (typeof this.urlOrPromise == 'string') {
      urlPromise = Promise.resolve(this.urlOrPromise);
    } else {
      urlPromise = this.urlOrPromise;
    }
    return urlPromise.then(url => {
      const loginUrl = buildLoginUrl(url, 'RETURN_URL');
      dev().fine(TAG, 'Open viewer dialog: ', loginUrl);
      return this.viewer.sendMessageAwaitResponse('openDialog', {
        'url': loginUrl,
      });
    });
  }
}


/**
 * Web-based implementation of the Login Dialog.
 * @visibleForTesting
 */
export class WebLoginDialog {
  /**
   * @param {!Window} win
   * @param {!Viewer} viewer
   * @param {string|!Promise<string>} urlOrPromise
   */
  constructor(win, viewer, urlOrPromise) {
    /** @const {!Window} */
    this.win = win;

    /** @const {!Viewer} */
    this.viewer = viewer;

    /** @const {string|!Promise<string>} */
    this.urlOrPromise = urlOrPromise;

    /** @private {?function(string)} */
    this.resolve_ = null;

    /** @private {?function(*)} */
    this.reject_ = null;

    /** @private {?Window} */
    this.dialog_ = null;

    /** @private {?Promise} */
    this.dialogReadyPromise_ = null;

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
    user().assert(!this.resolve_, 'Dialog already opened');
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
    const sizing = `height=${h},width=${w},left=${x},top=${y}`;
    const options = `${sizing},resizable=yes,scrollbars=yes`;
    const returnUrl = this.getReturnUrl_();

    this.dialogReadyPromise_ = null;
    if (typeof this.urlOrPromise == 'string') {
      const loginUrl = buildLoginUrl(this.urlOrPromise, returnUrl);
      dev().fine(TAG, 'Open dialog: ', loginUrl, returnUrl, w, h, x, y);
      this.dialog_ = openWindowDialog(this.win, loginUrl, '_blank', options);
      if (this.dialog_) {
        this.dialogReadyPromise_ = Promise.resolve();
      }
    } else {
      dev().fine(TAG, 'Open dialog: ', 'about:blank', returnUrl, w, h, x, y);
      this.dialog_ = openWindowDialog(this.win, '', '_blank', options);
      if (this.dialog_) {
        this.dialogReadyPromise_ = this.urlOrPromise.then(url => {
          const loginUrl = buildLoginUrl(url, returnUrl);
          dev().fine(TAG, 'Set dialog url: ', loginUrl);
          this.dialog_.location.replace(loginUrl);
        }, error => {
          throw new Error('failed to resolve url: ' + error);
        });
      }
    }

    if (this.dialogReadyPromise_) {
      this.dialogReadyPromise_.then(() => {
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
      dev().fine(TAG, 'MESSAGE:', e);
      if (e.origin != returnOrigin) {
        return;
      }
      if (!e.data || e.data.sentinel != 'amp') {
        return;
      }
      dev().fine(TAG, 'Received message from dialog: ', e.data);
      if (e.data.type == 'result') {
        if (this.dialog_) {
          this.dialog_./*OK*/postMessage({
            sentinel: 'amp',
            type: 'result-ack',
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
    dev().fine(TAG, 'Login done: ', result, opt_error);
    if (opt_error) {
      this.reject_(opt_error);
    } else {
      this.resolve_(result);
    }
    this.cleanup_();
  }

  /**
   * @return {string}
   * @private
   */
  getReturnUrl_() {
    const currentUrl = this.viewer.getResolvedViewerUrl();
    let returnUrl;
    if (getMode().localDev) {
      const loc = this.win.location;
      returnUrl = loc.protocol + '//' + loc.host +
          '/extensions/amp-access/0.1/amp-login-done.html';
    } else {
      returnUrl = `${urls.cdn}/v0/amp-login-done-0.1.html`;
    }
    return returnUrl + '?url=' + encodeURIComponent(currentUrl);
  }
}


/**
 * @param {string} url
 * @param {string} returnUrl
 * @return {string}
 * @private
 */
function buildLoginUrl(url, returnUrl) {
  // RETURN_URL has to arrive here unreplaced by UrlReplacements for two
  // reasons: (1) sync replacement and (2) if we need to propagate this
  // replacement to the viewer.
  if (RETURN_URL_REGEX.test(url)) {
    return url.replace(RETURN_URL_REGEX, encodeURIComponent(returnUrl));
  }
  return url +
      (url.includes('?') === false ? '?' : '&') +
      'return=' + encodeURIComponent(returnUrl);
}
