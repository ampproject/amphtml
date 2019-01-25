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

import {AmpDigidip} from '../amp-digidip';

const helpersMaker = env => {

  return {
    createAmpDigidip(extAttrs) {
      const element = this.getAmpDigidipElement(extAttrs);
      element.getAmpDoc = () => env.ampdoc;

      return new AmpDigidip(element);
    },

    getAmpDigidipElement(extAttrs) {
      const element = document.createElement('amp-digidip');
      for (const i in extAttrs) {
        element.setAttribute(i, extAttrs[i]);
      }

      return element;
    },
  };
};

export default helpersMaker;
