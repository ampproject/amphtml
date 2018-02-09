/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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
import {Services} from './services';
import {removeElement} from './dom';
import {setStyles} from './style';


/**
 * @param {!Document} doc
 * @param {string} text
 * @return {boolean}
 */
export function copyTextToClipboard(doc, text) {
  let copySuccessful = false;

  const textarea = doc.createElement('textarea');

  setStyles(textarea, {
    'position': 'fixed',
    'top': 0,
    'left': 0,
    'width': '50px',
    'height': '50px',
    'padding': 0,
    'border': 'none',
    'outline': 'none',
    'background': 'transparent',
  });

  textarea.value = text;

  doc.body.appendChild(textarea);
  const range = doc.createRange();
  range.selectNode(textarea);
  window.getSelection().addRange(range);

  try {
    copySuccessful = doc.execCommand('copy');
  } catch (e) {
    // 🤷
  }

  removeElement(textarea);
  window.getSelection().removeAllRanges();

  return copySuccessful;
}


/**
 * @param {!Window} win
 * @return {boolean}
 */
export function isCopyingToClipboardSupported(win) {
  // Current implementation does not work on iOS even though the test for
  // support below returns true. See #13136.
  console.log("TEST--!!!");
  if (Services.platformFor(win).isIos()) {
    return false;
  }
  return win.document.queryCommandSupported('copy');
}
