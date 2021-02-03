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

import ctrlHelpers from '../../test-e2e/helpers';

const bentoHelper = (controller) => ctrlHelpers({controller, version: '1.0'});

const TAG_NAME = 'amp-base-carousel';

// This is only used for switching to the shadow root
const getCarousel = (ctrl) => ctrl.findElement(TAG_NAME);
const getSlides = (_, ctrl) => bentoHelper(ctrl).getSlides();
const getSlide = async (_, ctrl, n) => bentoHelper(ctrl).getSlide(n);
const getScrollingElement = async (_, ctrl) =>
  bentoHelper(ctrl).getScrollingElement();
const getPrevArrowSlot = async (ctrl) => bentoHelper(ctrl).getPrevArrowSlot();
const getNextArrowSlot = async (ctrl) => bentoHelper(ctrl).getNextArrowSlot();
const getPrevArrow = async (_, ctrl) => bentoHelper(ctrl).getPrevArrow();
const getNextArrow = async (_, ctrl) => bentoHelper(ctrl).getNextArrow();
const sleep = (ms) => new Promise((res) => setTimeout(res, ms));

export {
  getCarousel,
  getSlides,
  getSlide,
  getScrollingElement,
  getPrevArrowSlot,
  getNextArrowSlot,
  getPrevArrow,
  getNextArrow,
  sleep,
};
