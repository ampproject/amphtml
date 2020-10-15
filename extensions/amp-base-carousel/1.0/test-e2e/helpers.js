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

const TAG_NAME = 'amp-base-carousel';
const SLIDE_CLASS = 'slideElement';
const SCROLLER_CLASS = 'hideScrollbar';
const PREV_ARROW_CLASS = 'arrowPrev';
const NEXT_ARROW_CLASS = 'arrowNext';
const PREV_ARROW_SLOT_SELECTOR = 'slot[name="prev-arrow"]';
const NEXT_ARROW_SLOT_SELECTOR = 'slot[name="next-arrow"]';

export function getCarousel(controller) {
  return controller.findElement(TAG_NAME);
}

export function getSlides(styles, controller) {
  return controller.findElements(`.${styles[SLIDE_CLASS]}`);
}

export async function getSlide(styles, controller, n) {
  const slides = await getSlides(styles, controller);
  return slides[n];
}

export async function getScrollingElement(styles, controller) {
  return controller.findElement(`.${styles[SCROLLER_CLASS]}`);
}

export function getPrevArrowSlot(controller) {
  return controller.findElement(PREV_ARROW_SLOT_SELECTOR);
}

export function getNextArrowSlot(controller) {
  return controller.findElement(NEXT_ARROW_SLOT_SELECTOR);
}

export function getPrevArrow(styles, controller) {
  return controller.findElement(`.${styles[PREV_ARROW_CLASS]}`);
}

export function getNextArrow(styles, controller) {
  return controller.findElement(`.${styles[NEXT_ARROW_CLASS]}`);
}
