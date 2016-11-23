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

import {setStyle} from './style';

/**
 * Creates an off-screen button that is invisible visually but accessible via
 * screen-readers.
 * @param {!Element} parent to add the button to. Normally the AMP element.
 * @param {string} label text for the button/
 * @param {function()} onClick click handler.
 * @return {!Element} Reference to the added button element.
 */
export function addScreenReaderButton(parent, label, onClick) {
  const doc = parent.ownerDocument;
  const screenReaderButton = doc.createElement('button');
  screenReaderButton.textContent = label;
  screenReaderButton.classList.add('-amp-screen-reader');
  // This is for screen-readers only, should not get a tab stop.
  screenReaderButton.tabIndex = -1;
  // We can not stack them on top of each other otherwise some screen-readers
  // (TalkBack and VoiceOver) will activate the wrong button.
  const count = doc.querySelectorAll('.-amp-screen-reader').length;
  // Separate each by 2px.
  setStyle(screenReaderButton, 'left', count * 2 + 'px');
  if (parent.id) {
    screenReaderButton.setAttribute('aria-controls', parent.id);
  }
  screenReaderButton.addEventListener('click', onClick);
  parent.appendChild(screenReaderButton);
  return screenReaderButton;
};
