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

import {user} from '../src/log';
import {assertHttpsUrl} from '../src/url';


/**
 * @param {!Window} window
 */
export function installGlobalSubmitListener(window) {
  new SubmitHandler(window)
}


/**
 * Intercept any submit on the current document and polyfill validation
 * check for the requested form.
 */
export class SubmitHandler {
  /**
   * @param {!Window} window
   */
  constructor(window) {
    /** @private @const {!Window} */
    this.win = window;

    /** @private @const {!function(!Event)|undefined} */
    this.boundHandle_ = this.handle_.bind(this);
    this.win.document.documentElement.addEventListener(
        'submit', this.boundHandle_, true);
  }

  /**
   * Removes all event listeners.
   */
  cleanup() {
    if (this.boundHandle_) {
      this.win.document.documentElement.removeEventListener(
          'submit', this.boundHandle_, true);
    }
  }

  /**
   * Intercept any submit on the current document and polyfill validation check.
   * @param {!Event} e
   */
  handle_(e) {
    onDocumentFormSubmit_(e);
  }
}


/**
 * Intercept any submit on the current document and prevent invalid submits from
 * going through.
 *
 * @param {!Event} e
 */
export function onDocumentFormSubmit_(e) {
  if (e.defaultPrevented) {
    return;
  }

  const form = e.target;
  if (!form || form.tagName != 'FORM') {
    return;
  }

  const action = form.getAttribute('action');
  user.assert(action, 'form action attribute is required: %s', form);
  assertHttpsUrl(action, form, 'action');
  user.assert(!action.startsWith('https://cdn.ampproject.org'),
      'form action should not be on cdn.ampproject.org: %s', form);

  const target = form.getAttribute('target');
  user.assert(target, 'form target attribute is required: %s', form);
  user.assert(target == '_blank' || target == '_top',
      'form target=%s is invalid can only be _blank or _top: %s', target, form);

  // Safari does not trigger validation check on submission, hence we
  // trigger it manually. In other browsers this would never execute since
  // the submit event wouldn't be fired if the form is invalid.
  // TODO: This doesn't display the validation error messages. Safari makes them
  // available per input.validity object. We need to figure out a way of
  // displaying these.
  if (form.checkValidity && !form.checkValidity()) {
    e.preventDefault();
    return;
  }
}
