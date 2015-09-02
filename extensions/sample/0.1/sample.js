/**
 * Copyright 2015 The AMP HTML Authors. All Rights Reserved.
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

// Simulate a slow network.
setTimeout(function() {
  (window.AMP = window.AMP || []).push(function(AMP) {
    'use strict';

    class ExtendedSample extends AMP.BaseElement {
      /** @override */
      isLayoutSupported(layout) {
        return true;
      }
      /** @override */
      loadContent() {
        var h1 = document.createElement('h1');
        h1.textContent = 'Loads after 2 seconds. Sloowwww';
        this.element.appendChild(h1);
        return Promise.resolve();
      }
    }

    AMP.registerElement('amp-extended-sample', ExtendedSample, $CSS$)
  });
}, 2000);
