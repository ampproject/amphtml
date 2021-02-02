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

const TAG_NAME = 'amp-base-carousel';
const SLOTTED_CLASS = 'i-amphtml-carousel-slotted';
const SPACER_CLASS = 'i-amphtml-carousel-spacer';
const SCROLLER_SELECTOR = `${TAG_NAME} .i-amphtml-carousel-scroll`;
const PREV_ARROW_SLOT_SELECTOR = '.i-amphtml-base-carousel-arrow-prev-slot';
const NEXT_ARROW_SLOT_SELECTOR = '.i-amphtml-base-carousel-arrow-next-slot';
const PREV_ARROW_SELECTOR = `${PREV_ARROW_SLOT_SELECTOR} :first-child`;
const NEXT_ARROW_SELECTOR = `${NEXT_ARROW_SLOT_SELECTOR} :first-child`;

export default (controller) => {
  const getSpacers = async () =>
    controller.findElements(`${TAG_NAME} .${SPACER_CLASS}`);

  const getSlides = async (opt_carouselId = '') =>
    controller.findElements(`${TAG_NAME}${opt_carouselId} .${SLOTTED_CLASS}`);

  return {
    getSpacers,
    getSpacersForSlide: async (n) => {
      const spacers = await getSpacers();
      const slideCount = spacers.length / 3;

      return [spacers[n], spacers[n + slideCount], spacers[n + 2 * slideCount]];
    },

    getSlides,
    getSlide: async (n) => (await getSlides())[n],
    getSlideImg: async (n) =>
      controller.findElementXPath(
        `//${TAG_NAME}//*[contains(@class, "${SLOTTED_CLASS}")][${n + 1}]//img`
      ),
    getScrollingElement: async () => controller.findElement(SCROLLER_SELECTOR),
    getPrevArrowSlot: async () =>
      controller.findElement(PREV_ARROW_SLOT_SELECTOR),
    getNextArrowSlot: async () =>
      controller.findElement(NEXT_ARROW_SLOT_SELECTOR),
    getPrevArrow: async () => controller.findElement(PREV_ARROW_SELECTOR),
    getNextArrow: async () => controller.findElement(NEXT_ARROW_SELECTOR),
  };
};
