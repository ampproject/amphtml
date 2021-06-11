/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

/**
 * @fileoverview This file is executed via Puppeteer's page.evaluate on a
 * document to copy the values of forms into their attributes, so that they will
 * be passed in the snapshots to Percy.
 */

for (const form of Array.from(document.forms)) {
  for (const element of Array.from(form.elements)) {
    switch (element.tagName) {
      case 'INPUT':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLInputElement
        const formElement = /** @type {!HTMLInputElement} */ (element);
        switch (formElement.type) {
          case 'file':
          case 'hidden':
          case 'image':
            break;

          case 'checkbox':
          case 'radio':
            if (formElement.checked) {
              formElement.setAttribute('checked', '');
            } else {
              formElement.removeAttribute('checked');
            }
            break;

          default:
            formElement.setAttribute('value', formElement.value);
        }
        break;

      case 'SELECT':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLOptionElement
        const selectElement = /** @type {!HTMLSelectElement} */ (element);
        for (const optionElement of Array.from(selectElement.options)) {
          if (optionElement.selected) {
            optionElement.setAttribute('selected', '');
          } else {
            optionElement.removeAttribute('selected');
          }
        }
        break;

      case 'TEXTAREA':
        // Reference: https://developer.mozilla.org/en-US/docs/Web/API/HTMLTextAreaElement
        const textElement = /** @type {!HTMLTextAreaElement} */ (element);
        textElement.textContent = textElement.value;
        break;
    }
  }
}
