import {Services} from '../../../../../src/services';
import {getSourceOrigin} from '../../../../../src/url';

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
   * @param {!Document} unusedDoc
   * @return {!Element}
   */
  buildElement(unusedComponentJson, unusedDoc) {}
}

/**
 * Gets the origin url for components that display a url in the bookend. It
 * trims the protocol prefix and returns only the hostname of the origin.
 * @param {!Element} element
 * @param {string} url
 * @return {string}
 */
export function getSourceOriginForBookendComponent(element, url) {
  let domainName;
  try {
    domainName = getSourceOrigin(Services.urlForDoc(element).parse(url));
    // Remove protocol prefix.
    domainName = Services.urlForDoc(element).parse(domainName).hostname;
  } catch (e) {
    // Unknown path prefix in url.
    domainName = Services.urlForDoc(element).parse(url).hostname;
  }
  return domainName;
}
