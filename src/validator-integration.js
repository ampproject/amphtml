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
import {urls} from './config';
import {startsWith} from './string';

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
  const filename = win.location.href;
  if (startsWith(filename, 'about:')) {  // Should only happen in tests.
    return;
  }

  /** @const {!Element} */
  const s = win.document.createElement('script');
  // TODO(@cramforce): Introduce a switch to locally built version for local
  // development.
  s.src = `${urls.cdn}/v0/validator.js`;
  s.onload = () => {
    win.document.head.removeChild(s);
    /* global amp: false */
    amp.validator.validateUrlAndLog(filename, win.document, getMode().filter);
  };
  win.document.head.appendChild(s);
}
