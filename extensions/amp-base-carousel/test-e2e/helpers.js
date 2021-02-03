/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import ampHelpers from './helpers-amp';
import bentoHelpers from './helpers-bento';

const testHelpers = {
  '0.1': ampHelpers,
  '1.0': bentoHelpers,
};

export default ({version, controller}) => {
  const {
    switchToShadow: maybeSwitchToShadow = () => {},
    switchToLight: maybeSwitchToLight = () => {},
    ...helpers
  } = testHelpers[version](controller);

  return Object.setPrototypeOf(
    {
      // Shorthand helpers
      rect: controller.getElementRect,
      css: controller.getElementCssValue,
      prop: controller.getElementProperty,
      setWin: (width, height) => controller.setWindowRect({width, height}),

      // Shared helpers
      sleep: async (ms) => new Promise((res) => setTimeout(res, ms)),
      expectSlideImgLoaded: async (n) => {
        const el = await helpers.getSlideImg(n);
        await expect(
          controller.getElementProperty(el, 'naturalWidth')
        ).to.be.greaterThan(0);
      },

      // AMP/Bento bridge
      maybeSwitchToShadow,
      maybeSwitchToLight,

      // Standard set of Carousel helpers
      ...helpers,
    },
    controller
  );
};
