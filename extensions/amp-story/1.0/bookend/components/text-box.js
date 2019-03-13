/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {BookendComponentInterface} from './bookend-component-interface';
import {cachedHtmlFor, htmlFor} from '../../../../../src/static-template';
import {isArray} from '../../../../../src/types';
import {userAssert} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   text: string
 * }}
 */
export let TextBoxComponentDef;


/**
 * @param {string} line
 * @param {!Element} contextEl
 * @return {!Element}
 */
function buildLineElement(line, contextEl) {
  const html = cachedHtmlFor(contextEl);
  const el = html`<h3 class="i-amphtml-story-bookend-text"></h3>`;
  el.textContent = line;
  return el;
}


/**
 * Builder class for the textbox bookend component.
 * @implements {BookendComponentInterface}
 */
export class TextBoxComponent {
  /**
   * @param {!../bookend-component.BookendComponentDef} textboxJson
   * @override
   * */
  assertValidity(textboxJson) {
    userAssert('text' in textboxJson && isArray(textboxJson['text']) &&
      textboxJson['text'].length > 0, 'Textbox component must contain ' +
      '`text` array and at least one element inside it, ' +
      'skipping invalid.');
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} textboxJson
   * @return {!TextBoxComponentDef}
   * @override
   * */
  build({type, text}) {
    return {type, text};
  }

  /** @override */
  buildElement(textboxData, contextEl) {
    const html = htmlFor(contextEl);
    const container = html`<div class="i-amphtml-story-bookend-textbox
      i-amphtml-story-bookend-component"></div>`;

    textboxData['text'].forEach(currentLine => {
      container.appendChild(buildLineElement(currentLine, contextEl));
    });

    return container;
  }
}
