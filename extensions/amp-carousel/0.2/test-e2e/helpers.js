/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

const CAROUSEL_SLIDE_CLASS =
  '.i-amphtml-element.i-amphtml-layout-responsive' +
  '.i-amphtml-layout-size-defined.i-amphtml-built' +
  '.amp-carousel-slide.amp-scrollable-carousel-slide' +
  '.i-amphtml-layout';
const PREV_ARROW_SELECTOR = `.amp-carousel-button.amp-carousel-button-prev`;
const NEXT_ARROW_SELECTOR = `.amp-carousel-button.amp-carousel-button-next`;

export function getSlides(controller) {
  return controller.findElements(CAROUSEL_SLIDE_CLASS);
}

export function getPrevArrow(controller) {
  return controller.findElement(PREV_ARROW_SELECTOR);
}

export function getNextArrow(controller) {
  return controller.findElement(NEXT_ARROW_SELECTOR);
}

export function sleep(ms) {
  return new Promise((res) => setTimeout(res, ms));
}
