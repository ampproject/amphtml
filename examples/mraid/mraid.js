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
// Fake mraid.js that lets us pretend to be in a mobile app environment.
window.mraid = {};
console.log('initiate marid object');
window.mraid.getState = function () {
  return Math.random() < 0.5 ? 'ready' : 'loading';
};
const visibleRect = {
  bottom: 5,
  height: 5,
  left: 0,
  right: 5,
  top: 0,
  width: 5,
  x: 0,
  y: 0,
};
window.mraid.addEventListener = function (event, callback) {
  console.log('fake addEventListener API');
  console.log('event is ', event);
  if (event === 'ready') {
    window.setTimeout(callback, 1000);
  } else if (event === 'exposureChange') {
    console.log('the callback is ', callback);
    window.setTimeout(function () {
      console.log('mraid.js about to call exposureChange callback');
      callback(70, visibleRect, null);
      mockVisible(callback, 50.5, 200);
      mockVisible(callback, 79.1, 3000);
    }, 500);
  } else {
    console.log('unknown event ' + event);
  }
};
window.mraid.close = function () {
  console.log('close');
};
window.mraid.open = function (url) {
  console.log('open ' + url);
};
window.mraid.expand = function () {
  console.log('expand');
};

function mockVisible(callback, ratio, time) {
  window.setTimeout(() => {
    console.log('fire new visbility change event after %s ms', time);
    callback(ratio, visibleRect, null);
  }, time);
}
