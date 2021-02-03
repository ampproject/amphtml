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

import ctrlHelpers from '../../test-e2e/helpers';

const ampHelper = (controller) => ctrlHelpers({controller, version: '0.1'});
function helpFn(fnName) {
  return (ctrl, ...args) => ampHelper(ctrl)[fnName](...args);
}

module.exports = {
  waitForCarouselImg: helpFn('waitForCarouselImg'),
  getSlides: helpFn('getSlides'),
  getSlide: helpFn('getSlide'),
  getSpacers: helpFn('getSpacers'),
  getSpacersForSlide: helpFn('getSpacersForSlide'),
  getScrollingElement: helpFn('getScrollingElement'),
  getPrevArrowSlot: helpFn('getPrevArrowSlot'),
  getNextArrowSlot: helpFn('getNextArrowSlot'),
  getPrevArrow: helpFn('getPrevArrow'),
  getNextArrow: helpFn('getNextArrow'),
  sleep: async (ms) => new Promise((res) => setTimeout(res, ms)),
};
