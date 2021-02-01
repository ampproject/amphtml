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
if (!window.context) {
  // window.context doesn't exist yet, must perform steps to create it
  // before using it
  console.log('window.context NOT READY');

  // load ampcontext-lib.js which will create window.context
  ampContextScript = document.createElement('script');
  ampContextScript.src =
    'https://localhost:8000/dist.3p/current/ampcontext-lib.js';
  document.head.appendChild(ampContextScript);
}

function intersectionCallback(changes) {
  // Code below is simply an example.
  var latestChange = changes[changes.length - 1];

  var {
    // Amp-ad width and height.
    width: w,
    height: h,

    // Position in the viewport.
    x: vx,
    y: vy,
  } = latestChange.boundingClientRect;

  var {
    // Visible width and height.
    width: vw,
    height: vh,
  } = latestChange.intersectionRect;

  // Viewable percentage.
  var viewablePerc = ((vw * vh) / (w * h)) * 100;

  console.log(viewablePerc, w, h, vw, vh, vx, vy);
}

function dummyCallback(changes) {
  console.log(changes);
}

var shouldStopVis = false;
var stopVisFunc;
var shouldStopInt = false;
var stopIntFunc;

function toggleObserveIntersection() {
  if (shouldStopInt) {
    stopIntFunc();
  } else {
    stopIntFunc = window.context.observeIntersection(intersectionCallback);
  }
  shouldStopInt = !shouldStopInt;
}

function toggleObserveVisibility() {
  if (shouldStopVis) {
    stopVisFunc();
  } else {
    stopVisFunc = window.context.observePageVisibility(dummyCallback);
  }
  shouldStopVis = !shouldStopVis;
}

function resizeAd() {
  window.context
    .requestResize(500, 600)
    .then(function () {
      console.log('Success!');
      this.innerWidth = 500;
      this.innerHeight = 600;
    })
    .catch(function () {
      console.log('DENIED');
    });
}
