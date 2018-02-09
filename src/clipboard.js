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
import {removeElement} from './dom';
import {setStyles} from './style';


/**
 * @param {!Window} win
 * @param {string} text
 * @return {boolean}
 */
export function copyTextToClipboard(win, text) {
  let copySuccessful = false;
  const doc = win.document;

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
  textarea.readOnly = true;
  textarea.contentEditable = true;

  doc.body.appendChild(textarea);
  const range = doc.createRange();
  range.selectNode(textarea);
  win.getSelection().removeAllRanges();
  win.getSelection().addRange(range);
  textarea.setSelectionRange(0, text.length);

  try {
    copySuccessful = doc.execCommand('copy');
  } catch (e) {
    // 🤷
  }

  removeElement(textarea);

  return copySuccessful;
}


/**
 * @param {!Document} doc
 * @return {boolean}
 */
export function isCopyingToClipboardSupported(doc) {
  return doc.queryCommandSupported('copy');
}
