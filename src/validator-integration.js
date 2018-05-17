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
import {loadPromise} from './event-helper';
import {startsWith} from './string';
import {urls} from './config';

/**
 * Triggers validation for the current document if there is a script in the
 * page that has a "development" attribute.
 *
 * @param {!Window} win Destination window for the new element.
 */
export function maybeValidate(win) {
  const filename = win.location.href;
  if (startsWith(filename, 'about:')) { // Should only happen in tests.
    return;
  }

  if (getMode().development) {
    loadScript(win.document, `${urls.cdn}/v0/validator.js`).then(() => {
      /* global amp: false */
      amp.validator.validateUrlAndLog(
          filename, win.document, getMode().filter);
    });
  } else if (getMode().examiner) {
    loadScript(win.document, `${urls.cdn}/examiner.js`);
  }
}

function loadScript(doc, url) {
  const script = doc.createElement('script');
  script.src = url;
  const promise = loadPromise(script).then(() => {
    doc.head.removeChild(script);
  }, () => {});
  doc.head.appendChild(script);
  return promise;
}
