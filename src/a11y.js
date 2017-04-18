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

import {setStyle} from './style';

/**
 * Create an accessible button that is visible only to screen readers.
 * @param {!Element} parent to add the button to. Normally the AMP element.
 * @param {string} label text for the button.
 * @param {function()} onInteraction click and keyboard handler.
 * @return {!Element} Reference to the added button element.
 */
export function addScreenReaderButton(parent, label, onInteraction) {
  const doc = parent.ownerDocument;
  const screenReaderButton = doc.createElement('button');
  screenReaderButton.setAttribute('aria-label', label);
  screenReaderButton.setAttribute('aria-role', 'button');
  // This is for screen-readers only, should not get a tab stop.
  screenReaderButton.tabIndex = -1;
  if (parent.id) {
    screenReaderButton.setAttribute('aria-controls', parent.id);
  }
  screenReaderButton.addEventListener('click', onInteraction);
  screenReaderButton.addEventListener('keydown', event => {
    if (event.keyCode === 32 || event.keyCode === 13) {
      onInteraction();
      event.preventDefault(); // prevent scroll on space
    }
  });
  initializeScreenReaderButton(parent, screenReaderButton);
  parent.appendChild(screenReaderButton);
  return screenReaderButton;
};

/**
 * Take an existing accessible button and move it offscreen.
 * @param {!Element} parent The parent element of the screen reader button.
 * @param {!Element} accessibleButton An accessible button.
 * @return {!Element} Reference to the accessible button element.
 */
export function initializeScreenReaderButton(parent, accessibleButton) {
  // We can not stack them on top of each other otherwise some screen-readers
  // (TalkBack and VoiceOver) will activate the wrong button.
  const count = parent.querySelectorAll('.i-amphtml-screen-reader').length;
  accessibleButton.classList.add('i-amphtml-screen-reader');

  // Separate each by 2px.
  setStyle(accessibleButton, 'margin-left', `${count * 2}`, 'px',
      /* opt_bypassCache */ undefined, /* opt_important */ true);

  return accessibleButton;
}
