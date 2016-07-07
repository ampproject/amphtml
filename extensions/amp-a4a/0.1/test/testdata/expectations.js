/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

export const data = {
  minimumDocBodyFormatted: `<amp-ad-body>
Hello, world.


</amp-ad-body>`,

  regexpDocBodyFormatted: `<amp-ad-body>

  <amp-audio src="https://example.com/audio" layout="fixed" autoplay="">
  <amp-audio src="https://example.com/audio" layout="fixed" autoplay="desktop">




</amp-audio></amp-audio></amp-ad-body>`,

  validCssDocCssBlockFormatted: `<style amp-custom>
    @supports (animation-name) {
    }

    @-webkit-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @-moz-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @-o-keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    amp-user-notification.amp-active {
      opacity: 0;
      -webkit-animation: fadeIn ease-in 1s 1 forwards;
      -moz-animation: fadeIn ease-in 1s 1 forwards;
      -ms-animation: fadeIn ease-in 1s 1 forwards;
      -o-animation: fadeIn ease-in 1s 1 forwards;
      animation: fadeIn ease-in 1s 1 forwards;
    }
  </style>`,
};
