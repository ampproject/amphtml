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

/**
 * @fileoverview Registers all known ad network factories and then executes
 * one of them.
 *
 * This files gets minified and published to
 * https://3p.ampproject.net/$version/f.js
 */

import './polyfills';
import {a9} from '../ads/a9';
import {adreactor} from '../ads/adreactor';
import {adsense} from '../ads/adsense';
import {adtech} from '../ads/adtech';
import {doubleclick} from '../ads/doubleclick';
import {twitter} from './twitter';
import {register, run} from '../src/3p';
import {parseUrl} from '../src/url';
import {assert} from '../src/asserts';

register('a9', a9);
register('adreactor', adreactor);
register('adsense', adsense);
register('adtech', adtech);
register('doubleclick', doubleclick);
register('_ping_', function(win, data) {
  win.document.getElementById('c').textContent = data.ping;
});
register('twitter', twitter);

/**
 * Visible for testing.
 * Draws an ad to the window. Expects the data to include the ad type.
 * @param {!Window} win
 * @param {!Object} data
 */
export function draw3p(win, data) {
  const type = data.type;
  assert(window.context.location.originValidated != null,
      'Origin should have been validated');
  run(type, win, data);
};

/**
 * Returns the "master frame" for all widgets of a given type.
 * This frame should be used to e.g. fetch scripts that can
 * be reused across frames.
 * @param {string} type
 * @return {!Window}
 */
function masterSelection(type) {
  // The master has a special name.
  const masterName = 'frame_' + type + '_master';
  let master;
  try {
    // Try to get the master from the parent. If it does not
    // exist yet we get a security exception that we catch
    // and ignore.
    master = window.parent.frames[masterName];
  } catch (expected) {
    /* ignore */
  }
  if (!master) {
    // No master yet, rename ourselves to be master. Yaihh.
    window.name = masterName;
    master = window;
  }
  return master;
}

/**
 * Draws an embed, optionally synchronously, to the DOM.
 */
window.draw3p = function() {
  const data = parseFragment(location.hash);
  window.context = data._context;
  window.context.location = parseUrl(data._context.location.href);
  validateParentOrigin(window, window.context.location);
  window.context.master = masterSelection(data.type);
  window.context.isMaster = window.context.master == window;
  window.context.data = data;
  window.context.noContentAvailable = triggerNoContentAvailable;
  if (data.type == 'twitter') {
    // Only make this available to Twitter for now while
    // https://github.com/ampproject/amphtml/issues/728
    // is being implemented.
    window.context.updateDimensions = triggerDimensions;
  }
  // This only actually works for ads.
  window.context.observeIntersection = observeIntersection;
  delete data._context;
  draw3p(window, data);
};

function triggerNoContentAvailable() {
  nonSensitiveDataPostMessage('no-content');
}

function triggerDimensions(width, height) {
  nonSensitiveDataPostMessage('embed-size', {
    width: width,
    height: height,
  });
}

function nonSensitiveDataPostMessage(type, opt_object) {
  if (window.parent == window) {
    return;  // Nothing to do.
  }
  const object = opt_object || {};
  object.type = type;
  object.sentinel = 'amp-3p';
  window.parent./*OK*/postMessage(object,
      window.context.location.origin);
}

/**
 * Registers a callback for intersections of this iframe with the current
 * viewport.
 * The passed in array has entries that aim to be compatible with
 * the IntersectionObserver spec callback.
 * http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#callbackdef-intersectionobservercallback
 * @param {function(!Array<IntersectionObserverEntry>)} observerCallback
 */
function observeIntersection(observerCallback) {
  // Send request to received records.
  nonSensitiveDataPostMessage('send-intersections');
  window.addEventListener('message', function(event) {
    if (event.source != window.parent ||
        event.origin != window.context.location.origin ||
        !event.data ||
        event.data.sentinel != 'amp-3p' ||
        event.data.type != 'intersection') {
      return;
    }
    observerCallback(event.data.changes);
  });
}

/**
 * Throws if the current frame's parent origin is not equal to
 * the claimed origin.
 * For browsers that don't support ancestorOrigins it adds
 * `originValidated = false` to the location object.
 * @param {!Window} window
 * @param {!Location} parentLocation
 * @visibleForTesting
 */
export function validateParentOrigin(window, parentLocation) {
  const ancestors = window.location.ancestorOrigins;
  // Currently only webkit and blink based browsers support
  // ancestorOrigins. In that case we proceed but mark the origin
  // as non-validated.
  if (!ancestors || !ancestors.length) {
    parentLocation.originValidated = false;
    return;
  }
  assert(ancestors[0] == parentLocation.origin,
      'Parent origin mismatch: %s, %s, %s',
      ancestors[0], parentLocation.origin);
  parentLocation.originValidated = true;
}

/**
 * Expects the fragment to contain JSON.
 * @param {string} fragment Value of location.fragment
 * @return {!JSONObject}
 * @visibleForTesting
 */
export function parseFragment(fragment) {
  let json = fragment.substr(1);
  // Some browser, notably Firefox produce an encoded version of the fragment
  // while most don't. Since we know how the string should start, this is easy
  // to detect.
  if (json.indexOf('{%22') == 0) {
    json = decodeURIComponent(json);
  }
  return json ? JSON.parse(json) : {};
}
