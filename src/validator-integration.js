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

import {getMode} from './mode';


/** @const {string} */
const TAG_ = '[Validator]';


/**
 * Triggers validation for the current document if there is a script in the
 * page that has a "development" attribute.
 *
 * @param {!Window} win Destination window for the new element.
 */
export function maybeValidate(win) {
  if (!getMode().development) {
    return;
  }
  var filename = win.location.href;
  if (filename.startsWith('about:')) {  // Should only happen in tests.
    return;
  }
  var s = document.createElement('script');
  // TODO(@cramforce): Switch to locally build version when we integrated
  // the validator and switch to production URL.
  s.src = 'https://www.gstatic.com/amphtml/v0/validator.js';
  s.onload = () => {
    win.document.head.removeChild(s);
    amp.validator.validateUrlAndLog(filename, win.document);
  };
  win.document.head.appendChild(s);

  win.setTimeout(() => {
    validateLocal(win);
  }, 3000);
}


function report(element, message) {
  console/*OK*/.warn(TAG_, message, element);
}


/**
 * These validations are done locally only in dev mode as warnings. They are
 * subject to be promoted to our main validator that runs front and back-end.
 * @param {!Window} win
 */
function validateLocal(win) {
  validateTapActionsA11y(win);
}


/**
 * All tappable actions should have right a11y configuration.
 * @param {!Window} win
 */
function validateTapActionsA11y(win) {
  let elements = win.document.querySelectorAll('[on*="tap:"]');
  for (let i = 0; i < elements.length; i++) {
    let element = elements[i];
    if (element.tagName == 'A' || element.tagName == 'BUTTON') {
      continue;
    }
    if (!element.hasAttribute('role')) {
      report(element,
          'A11Y: Must have "role" attribute due to "tap" action,' +
          ' e.g. role="button".');
    }
    if (!element.hasAttribute('tabindex')) {
      report(element,
          'A11Y: Must have "tabindex" attribute due to "tap" action.');
    }
  }
}
