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

import {startsWith} from './string';
import {user} from './log';
import {assertHttpsUrl, getCorsUrl} from './url';
import {urls} from './config';


/** @const {string} */
const PROP = '__AMP_SUBMIT';


/**
 * @param {!Window} window
 */
export function installGlobalSubmitListener(window) {
  if (!window[PROP]) {
    window[PROP] = true;
    window.document.documentElement.addEventListener(
        'submit', onDocumentFormSubmit_, true);
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

  const win = form.ownerDocument.defaultView;
  const action = form.getAttribute('action');
  user().assert(action, 'form action attribute is required: %s', form);
  assertHttpsUrl(action, form, 'action');
  user().assert(!startsWith(action, urls.cdn),
      'form action should not be on AMP CDN: %s', form);

  form.__AMP_INIT_ACTION__ = form.__AMP_INIT_ACTION__ || action;
  // Update the form non-xhr action to add `__amp_source_origin` parameter.
  // This allows publishers to understand where the request is coming from.
  form.setAttribute('action', getCorsUrl(win, form.__AMP_INIT_ACTION__));

  const target = form.getAttribute('target');
  user().assert(target, 'form target attribute is required: %s', form);
  user().assert(target == '_blank' || target == '_top',
      'form target=%s is invalid can only be _blank or _top: %s', target, form);

  // amp-form extension will add novalidate to all forms to manually trigger
  // validation. In that case `novalidate` doesn't have the same meaning.
  const isAmpFormMarked = form.classList.contains('-amp-form');
  let shouldValidate;
  if (isAmpFormMarked) {
    shouldValidate = !form.hasAttribute('amp-novalidate');
  } else {
    shouldValidate = !form.hasAttribute('novalidate');
  }

  // Safari does not trigger validation check on submission, hence we
  // trigger it manually. In other browsers this would never execute since
  // the submit event wouldn't be fired if the form is invalid.
  // TODO: This doesn't display the validation error messages. Safari makes them
  // available per input.validity object. We need to figure out a way of
  // displaying these.
  if (shouldValidate && form.checkValidity && !form.checkValidity()) {
    e.preventDefault();
    return;
  }
}
