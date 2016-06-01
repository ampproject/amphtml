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


// necessary to increase entropy for the same client (and other clients in case when
// window.crytpo is supported)
function random() {
  try {
    // get cryptographically strong entropy when available (CryptoAPI)
    // NOTE: Cannot rely on return value of `crypto.getRandomValues`,
    // some implementations may not return anything
    const ab = new Uint32Array(1);
    crypto.getRandomValues(ab);
    return ab[0];
  } catch (err) { // could throw QuotaExceededError if too much entropy is drained
    // fallback to old way
    return Math.floor(Math.random() * 1e9);
  }
}

function getNavigationTime() {
  const performance = window.performance;
  const timing = performance && performance.timing;

  // this method is expected to return a big number, so do this in any case
  if (!timing) {
    return 1e5;
  }

  const dns = timing.domainLookupEnd - timing.domainLookupStart;
  const connection = timing.connectEnd - timing.connectStart;
  const navigation = timing.responseStart - timing.navigationStart;

  return dns * 11 + connection * 13 + navigation * 17;
}

// NOTE: This GUID function does *NOT* generate RFC4122 v4 compatible GUIDs
export function generateGUID() {
  // remove 3 most significant digits as they don't change often
  const time = Number(new Date().getTime().toString().substring(3));

  const offset = new Date().getTimezoneOffset();
  const screen = window.screen;

  let screenArea;
  if (screen && screen.availWidth) {
    screenArea = screen.availWidth * screen.availHeight + screen.colorDepth;
  } else if (screen && screen.width) {  // screen.availWidth is not supported on mobile
    screenArea = screen.width * screen.height;
  } else {
    screenArea = 1;
  }

  const doc = window.document.documentElement;
  const docArea = doc.clientWidth * doc.clientHeight;

  return Math.abs(
    time + getNavigationTime() - offset * 17 - screenArea * 25 + docArea
  ).toString(32) + random().toString(32);
}
