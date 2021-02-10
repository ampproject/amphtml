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
window.onload = function () {
  var iframe = document.querySelector('#creative');

  // Step 1: Once knowing the ad size is 300x250, hide the frame and request to have ad shown
  iframe.style.top = '250px';
  iframe.style.transition = '3s';
  window.context.requestResize(300, 250).then(function () {
    iframe.style.top = '0px';
    iframe.addEventListener('transitionend', function () {
      // Animation ended, now signaling AMP the ad is now interactive
      window.context.signalInteractive();
    });
  });
};
