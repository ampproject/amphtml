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

import {useStyles} from '../base-carousel.jss';

const TAG_NAME = 'amp-base-carousel';
const SLIDE_CLASS = 'slideElement';
const SCROLLER_CLASS = 'hideScrollbar';
const PREV_ARROW_CLASS = 'arrowPrev';
const NEXT_ARROW_CLASS = 'arrowNext';
const PREV_ARROW_SLOT_SELECTOR = '[slot="prev-arrow"]';
const NEXT_ARROW_SLOT_SELECTOR = '[slot="next-arrow"]';

/** Increase element wait timeout for Selenium controller */
const ELEMENT_WAIT_TIMEOUT = 10000;

export default (controller) => {
  const styles = useStyles();
  const getCarousel = async () => controller.findElement(TAG_NAME);

  const switchToShadow = async () =>
    controller.switchToShadowRoot(await getCarousel());
  const switchToLight = () => controller.switchToLight();

  return {
    switchToShadow,
    switchToLight,

    getSlides: async () => controller.findElements(`.${styles[SLIDE_CLASS]}`),

    getSlide: async (n) =>
      controller.findElement(`.${styles[SLIDE_CLASS]}[data-slide="${n}"]`),

    getSlideImg: async (n) => {
      await switchToLight();
      const el = await controller.findElement(
        `${TAG_NAME} [slot=i-amphtml-children-${n + 1}] img`
      );
      await switchToShadow();
      return el;
    },

    getScrollingElement: async () =>
      controller.findElement(
        `.${styles[SCROLLER_CLASS]}`,
        ELEMENT_WAIT_TIMEOUT
      ),

    getPrevArrowSlot: async () =>
      controller.findElement(PREV_ARROW_SLOT_SELECTOR),

    getNextArrowSlot: async () =>
      controller.findElement(NEXT_ARROW_SLOT_SELECTOR),

    getPrevArrow: async () =>
      controller.findElement(
        `.${styles[PREV_ARROW_CLASS]}`,
        ELEMENT_WAIT_TIMEOUT
      ),

    getNextArrow: async () =>
      controller.findElement(
        `.${styles[NEXT_ARROW_CLASS]}`,
        ELEMENT_WAIT_TIMEOUT
      ),
  };
};
