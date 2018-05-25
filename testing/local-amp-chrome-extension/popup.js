/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

<<<<<<< HEAD
const background = chrome.extension.getBackgroundPage(); // eslint-disable-line no-undef

function toggleProxy(unusedE) {
=======
var background = chrome.extension.getBackgroundPage();

function toggleProxy(e) {
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  background.disabled = !background.disabled;
  background.updateBadge();
}

<<<<<<< HEAD
document.addEventListener('DOMContentLoaded', function() {
  const switchButton = document.querySelector('input[type="checkbox"]');
  switchButton.addEventListener('change', toggleProxy);
  if (!background.disabled) {
    switchButton.checked = true;
=======
document.addEventListener('DOMContentLoaded', function () {
  var switch_button = document.querySelector('input[type="checkbox"]');
  switch_button.addEventListener('change', toggleProxy);
  if (!background.disabled) {
    switch_button.checked = true;
>>>>>>> ee7394982049dcbe4684c54c263b44407e1efc0d
  }
});
