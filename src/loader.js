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

import {htmlFor} from './static-template';
import {isExperimentOn} from './experiments';

/**
 * @param {!Element} element
 * @return {boolean}
 */
function isAd(element) {
  return element.tagName == 'AMP-AD';
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function hasBrandedLoader(element) {
  return false;
}

/**
 * @param {!Element} element
 * @return {boolean}
 */
function hasImagePlaceholder(element) {
  return false;
}

/**
 * Creates a default "loading indicator" element. This element accepts
 * `amp-active` class in which case it may choose to run an animation.
 * @param {!Document} doc
 * @param {!Element} element
 * @return {!Element}
 */
export function createLoaderElement(doc, element) {
  const win = doc.defaultView;

  if (isAd(element)) {
    const useNewAdLoader = isExperimentOn(win, 'new-loaders-ad');
    return useNewAdLoader ? createNewAdLoader(doc) : createOldAdLoader(doc);
  }

  const useNewLoaders = isExperimentOn(win, 'new-loaders');
  return useNewLoaders ? createNewLoader(doc) : createOldLoader(doc);
}

/**
 * @param {!Document} doc
 */
function createOldAdLoader(doc) {
  return htmlFor(doc)`<div class="i-amphtml-loader-line">
    <div class="i-amphtml-loader-moving-line"></div>
  </div>`;
}

/**
 * @param {!Document} doc
 */
function createOldLoader(doc) {
  return htmlFor(doc)`<div class="i-amphtml-loader">
        <div class="i-amphtml-loader-dot"></div>
        <div class="i-amphtml-loader-dot"></div>
        <div class="i-amphtml-loader-dot"></div>
      </div>`;
}

/**
 * @param {!Document} doc
 */
function createNewAdLoader(doc) {
  return createNewLoader(doc);
}

/**
 * @param {!Document} doc
 */
function createNewLoader(doc) {
  return htmlFor(doc)`
  <div class="i-amphtml-new-loader">
  <div><svg xmlns="http://www.w3.org/2000/svg" viewBox="24 24 72 72">
  <circle class="i-amphtml-new-loader-circle" cx="60" cy="60" r="12"></circle>
  <g class="i-amphtml-new-loader-spinner">
    <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60" r="22"></circle>
    <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60" r="22"></circle>
    <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60" r="22"></circle>
    <circle class="i-amphtml-new-loader-spinner-segment" cx="60" cy="60" r="22"></circle>
  </svg></div>
  </div>`;
}
