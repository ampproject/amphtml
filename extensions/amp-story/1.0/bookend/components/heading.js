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
import {htmlFor} from '../../../../../src/static-template';
import {userAssert} from '../../../../../src/log';

/**
 * @typedef {{
 *   type: string,
 *   text: string,
 * }}
 */
export let HeadingComponentDef;

/**
 * Builder class for the heading component that sits on top of a given set of
 * components in the bookend.
 * @implements {BookendComponentInterface}
 */
export class HeadingComponent {
  /**
   * @param {!../bookend-component.BookendComponentDef} headingJson
   * @override
   * */
  assertValidity(headingJson) {
    userAssert(
      'text' in headingJson,
      'Heading component must contain `text` field, skipping invalid.'
    );
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} headingJson
   * @return {!HeadingComponentDef}
   * @override
   * */
  build(headingJson) {
    return {
      type: headingJson['type'],
      text: headingJson['text'],
    };
  }

  /**
   * @param {!../bookend-component.BookendComponentDef} headingData
   * @param {!Document} doc
   * @return {!Element}
   * @override
   * */
  buildElement(headingData, doc) {
    const html = htmlFor(doc);
    const template = html`
      <h3
        class="i-amphtml-story-bookend-component
        i-amphtml-story-bookend-heading"
      ></h3>
    `;

    template.textContent = headingData.text;

    return template;
  }
}
