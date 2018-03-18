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

import {assertAbsoluteHttpOrHttpsUrl, parseQueryString} from '../../../src/url';
import {listen} from '../../../src/event-helper';


/**
 * @private Visible for testing.
 */
export class LoginDoneDialog {
  /**
   * @param {!Window} win
   */
  constructor(win) {
    /** @const {!Window} */
    this.win = win;
  }

  /**
   * Runs all the steps in processing. First, the dialog tries to postback
   * results to the opener window via messaging. If opener is not available
   * or if it timeouts, the dialog switches to error mode where the "close"
   * button will be available.
   */
  start() {
    this.setStyles_();
    this.postbackOrRedirect_();
  }

  /**
   * Tries to postback the response message or redirect URL.
   * @return {!Promise}
   * @private
   */
  postbackOrRedirect_() {
    const query = parseQueryString(this.win.location.search);
    if (this.win.opener && this.win.opener != this.win) {
      // This is a dialog postback. Try to communicate with the opener window.
      return this.postback_().then(
          this.postbackSuccess_.bind(this),
          this.postbackError_.bind(this));
    }

    if (query['url']) {
      // Source URL is specified. Try to redirect back.
      this.win.location.replace(assertAbsoluteHttpOrHttpsUrl(query['url']));
      return Promise.resolve();
    }

    const error = new Error('No opener or return location available');
    this.postbackError_(error);
    return Promise.reject(error);
  }

  /**
   * Sets necessary CSS styles to select the language. See `buildStyles_` for
   * more details.
   * @private
   */
  setStyles_() {
    const doc = this.win.document;
    const style = doc.createElement('style');
    style./*OK*/textContent = this.buildStyles_();
    doc.head.appendChild(style);
  }

  /**
   * The language is selected based on the `hl` query parameter or
   * `navigate.language`.
   *
   * See `buildStyles` module function for details.
   *
   * @return {string}
   * @private
   */
  buildStyles_() {
    const query = parseQueryString(this.win.location.search);
    const doc = this.win.document;
    const nav = this.win.navigator;
    const langSet = [query['hl'], nav.language, nav.userLanguage, 'en-US'];
    for (let i = 0; i < langSet.length; i++) {
      const lang = langSet[i];
      if (!lang) {
        continue;
      }
      const selector = buildLangSelector(lang);
      if (!selector) {
        continue;
      }
      if (!doc.querySelector(selector)) {
        continue;
      }
      return selector + ' {display: block}';
    }
    return '';
  }

  /**
   * Posts the response to the opening window via messaging. The message has the
   * follow form:
   * ```
   * {
   *    sentinel: 'amp',
   *    type: 'result',
   *    result: <location hash>
   * }
   * ```
   * Then the postback waits for ack signal from the opening window in the
   * following form:
   * ```
   * {
   *    sentinel: 'amp',
   *    type: 'result-ack'
   * }
   * ```
   *
   * The promise is resolved when the ack signal is received. If the signal is
   * not received within 5 seconds the postback times out and the promise is
   * rejected.
   *
   * If the opening window is not available the promise is likewise rejected.
   *
   * @return {!Promise}
   * @private
   */
  postback_() {
    const response = this.win.location.hash;
    let unlisten = () => {};
    return new Promise((resolve, reject) => {
      const opener = this.win.opener;
      if (!opener) {
        reject(new Error('Opener not available'));
        return;
      }

      // There's no senstive information coming in the response and thus the
      // target can be '*'.
      const target = '*';

      unlisten = listen(this.win, 'message', e => {
        if (!e.data || e.data.sentinel != 'amp') {
          return;
        }
        if (e.data.type == 'result-ack') {
          resolve();
        }
      });

      opener./*OK*/postMessage({
        sentinel: 'amp',
        type: 'result',
        result: response,
      }, target);

      this.win.setTimeout(() => {
        reject(new Error('Timed out'));
      }, 5000);
    }).then(() => {
      unlisten();
    }, error => {
      unlisten();
      throw error;
    });
  }

  /**
   * Tries to close window and if window is not closed within 3 seconds the
   * document is switched to error mode where the close button is shown.
   * @private
   */
  postbackSuccess_() {
    try {
      this.win.close();
    } catch (e) {
      // Ignore.
    }

    // Give the opener a chance to close the dialog, if not, show the
    // close button.
    this.win.setTimeout(() => {
      this.postbackError_(new Error('Failed to close the dialog'));
    }, 3000);
  }

  /**
   * Switches to the error mode. Close button will be shown.
   * @param {*} error
   * @private
   */
  postbackError_(error) {
    if (this.win.console && this.win.console.log) {
      (this.win.console./*OK*/error || this.win.console.log).call(
          this.win.console, 'Postback failed: ', error);
    }

    const doc = this.win.document;
    doc.documentElement.classList.toggle('amp-error', true);
    doc.documentElement.setAttribute('data-error', 'postback');
    doc.getElementById('closeButton').onclick = () => {
      try {
        this.win.close();
      } catch (e) {
        // Ignore.
      }
      // Give a little time to actually close. If it didn't work, set the flag
      // for closing failure.
      this.win.setTimeout(() => {
        if (!this.win.closed) {
          doc.documentElement.setAttribute('data-error', 'close');
        }
      }, 1000);
    };
  }
}


/**
 * The language is selected based on the `hl` query parameter or
 * `navigate.language` by setting CSS of the following form:
 * ```
 * [lang="fr"], [lang="fr-FR"] {display: block}
 * ```
 * @param {string} lang
 * @return {?string}
 * @private Visible for testing.
 */
export function buildLangSelector(lang) {
  if (!lang) {
    return null;
  }
  const parts = lang.split('-');
  let langExpr = '';
  let langPrefix = '';
  for (let i = 0; i < parts.length; i++) {
    if (i > 0) {
      langExpr += ', ';
      langPrefix += '-';
    }
    langPrefix += i == 0 ? parts[i].toLowerCase() : parts[i].toUpperCase();
    langPrefix = langPrefix.replace(/[^a-zA-Z\-]/g, '');
    langExpr += `[lang="${langPrefix}"]`;
  }
  return langExpr;
}
