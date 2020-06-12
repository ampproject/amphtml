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

/** @enum {string} */
export const BOOKEND_COMPONENT_TYPES = {
  SMALL: 'small',
  CTA_LINK: 'cta-link',
  HEADING: 'heading',
  LANDSCAPE: 'landscape',
  PORTRAIT: 'portrait',
  TEXTBOX: 'textbox',
};

/**
 *
 * @const {string}
 */
export const AMP_STORY_BOOKEND_COMPONENT_DATA =
  '__AMP_STORY_BOOKEND_COMPONENT_DATA__';

/**
 * Interface implemented by the bookend components.
 * @interface
 */
export class BookendComponentInterface {
  /**
   * Asserts whether the comopnent is valid.
   * @param {../bookend-component.BookendComponentDef} unusedComponentJson
   * @param {!Element} unusedElement
   */
  assertValidity(unusedComponentJson, unusedElement) {}

  /**
   * Builds the component.
   * @param {../bookend-component.BookendComponentDef} unusedComponentJson
   * @param {!Element} unusedElement
   * @return {../bookend-component.BookendComponentDef}
   */
  build(unusedComponentJson, unusedElement) {}

  /**
   * Builds the DOM element for the component.
   * @param {../bookend-component.BookendComponentDef} unusedComponentJson
   * @param {!Window} unusedWin
   * @param {!Object} unusedData
   * @return {!Element}
   */
  buildElement(unusedComponentJson, unusedWin, unusedData) {}
}
