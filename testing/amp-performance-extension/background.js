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
let disabled = false;

function updateBadge() {
  if (disabled) {
    chrome.browserAction.setBadgeText({
      text: 'OFF',
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: '#7e2013',
    });
  } else {
    chrome.browserAction.setBadgeText({
      text: 'ON',
    });
    chrome.browserAction.setBadgeBackgroundColor({
      color: '#15a341',
    });
  }
}

chrome.browserAction.onClicked.addListener(function(tab) {
  disabled = !disabled;
  updateBadge();
});

updateBadge();
