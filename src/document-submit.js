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

import {getService} from './service';

/**
 * @param {!Window} window
 */
export function installGlobalSubmitListener(window) {
  submitHandlerFor(window);
}

/**
 * @param {!Window} window
 */
export function uninstallGlobalSubmitListener(window) {
  submitHandlerFor(window).cleanup();
}

/**
 * @param {!Window} window
 */
function submitHandlerFor(window) {
  return getService(window, 'submithandler', () => {
    return new SubmitHandler(window);
  });
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
  if (!form) {
    return;
  }

  // Safari does not trigger validation check on submission, hence we
  // trigger it manually. In other browsers this would never execute since
  // the submit event wouldn't be fired if the form is invalid.
  // TODO: This doesn't display the validation error messages. Safari makes them
  // available per input.validity object. We need to figure out a way of
  // displaying these.
  if (form.checkValidity && !form.checkValidity()) {
    form.classList.remove('amp-form-valid');
    form.classList.add('amp-form-invalid');
    e.preventDefault();
    return;
  }

  form.classList.add('amp-form-valid');
  form.classList.remove('amp-form-invalid');
};
