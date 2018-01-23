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
import {dict} from './../../../src/utils/object';
import {renderAsElement} from './simple-template';


/** @const {string} */
const SPINNER_ACTIVE_ATTRIBUTE = 'active';


/** @private @const {!./simple-template.ElementDef} */
const SPINNER =  {
  tag: 'div',
  attrs: dict({
    'class': 'i-amphtml-story-spinner',
    'aria-hidden': 'true',
    'aria-label': 'Loading video',
  }),
  children: [
    {
      tag: 'div',
      attrs: dict({
        'class': 'i-amphtml-story-spinner-container',
      }),
      children: [
        {
          tag: 'div',
          attrs: dict({
            'class': 'i-amphtml-story-spinner-layer',
          }),
          children: [
            {
              tag: 'div',
              attrs: dict({
                'class': 'i-amphtml-story-spinner-circle-clipper left',
              }),
            },
            {
              tag: 'div',
              attrs: dict({
                'class': 'i-amphtml-story-spinner-circle-clipper right',
              }),
            },
          ],
        },
      ],
    },
  ],
};

export class LoadingSpinner {
  /**
   * @param {!Document} doc
   */
  constructor(doc) {
    /** @public @const {!Element} */
    this.element_ = renderAsElement(doc, SPINNER);

    /** @private {boolean} */
    this.isActive_ = false;
  }

  /** @param {!Element} element */
  attach(element) {
    element.appendChild(this.element_);
  }

  /** @param {boolean} state */
  toggle(isActive) {
    if (isActive === this.isActive_) {
      return;
    }
    if (isActive) {
      this.element_.setAttribute(SPINNER_ACTIVE_ATTRIBUTE, '');
      this.element_.setAttribute('aria-hidden', 'false');
    } else {
      this.element_.removeAttribute(SPINNER_ACTIVE_ATTRIBUTE);
      this.element_.setAttribute('aria-hidden', 'true');
    }
    this.isActive_ = isActive;
  }
}
