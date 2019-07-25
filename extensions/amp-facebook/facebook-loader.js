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

import {svgFor} from '../../src/static-template';

/**
 * Common function to create the facebook loader logo for all amp-facebook-*
 * components.
 * @param {!AmpElement} element
 * @return {!Element}
 */
export function createLoaderLogo(element) {
  const svg = svgFor(element);
  return svg`
      <g fill="#4267B2" class="i-amphtml-new-loader-white-on-shim">
        <path
          fill="#4267B2" class="i-amphtml-new-loader-white-on-shim"
          d="M68.9,50H51.1c-0.6,0-1.1,0.5-1.1,1.1v17.8c0,0.6,0.5,1.1,1.1,1.1c0,0,0,0,0,0h9.6v-7.7h-2.6v-3h2.6V57
                  c0-2.6,1.6-4,3.9-4c0.8,0,1.6,0,2.3,0.1v2.7h-1.6c-1.3,0-1.5,0.6-1.5,1.5v1.9h3l-0.4,3h-2.6V70h5.1c0.6,0,1.1-0.5,1.1-1.1l0,0V51.1
                  C70,50.5,69.5,50,68.9,50C68.9,50,68.9,50,68.9,50z"
        ></path>
        <path
          fill="#ffffff" class="i-amphtml-new-loader-transparent-on-shim"
          d="M63.8,70v-7.7h2.6l0.4-3h-3v-1.9c0-0.9,0.2-1.5,1.5-1.5h1.6v-2.7c-0.8-0.1-1.6-0.1-2.3-0.1
                  c-2.3,0-3.9,1.4-3.9,4v2.2h-2.6v3h2.6V70H63.8z"
        ></path>
      </g>
    `;
}
