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
import {adform} from '../ads/adform';
import {adreactor} from '../ads/adreactor';
import {adsense} from '../ads/adsense';
import {adtech} from '../ads/adtech';
import {plista} from '../ads/plista';
import {doubleclick} from '../ads/doubleclick';
import {dotandads} from '../ads/dotandads';
import {facebook} from './facebook';
import {manageWin} from './environment';
import {nonSensitiveDataPostMessage, listenParent} from './messaging';
import {twitter} from './twitter';
import {yieldmo} from '../ads/yieldmo';
import {register, run} from '../src/3p';
import {parseUrl} from '../src/url';
import {assert} from '../src/asserts';
import {taboola} from '../ads/taboola';
import {smartadserver} from '../ads/smartadserver';

/**
 * Whether the embed type may be used with amp-embed tag.
 * @const {!Object<string: boolean>}
 */
const AMP_EMBED_ALLOWED = {
  taboola: true
};

register('a9', a9);
register('adform', adform);
register('adreactor', adreactor);
register('adsense', adsense);
register('adtech', adtech);
register('plista', plista);
register('doubleclick', doubleclick);
register('taboola', taboola);
register('dotandads', dotandads);
register('yieldmo', yieldmo);
register('_ping_', function(win, data) {
  win.document.getElementById('c').textContent = data.ping;
});
register('twitter', twitter);
register('facebook', facebook);
register('smartadserver', smartadserver);

/**
 * Visible for testing.
 * Draws a 3p embed to the window. Expects the data to include the 3p type.
 * @param {!Window} win
 * @param {!Object} data
 * @param {function(!Object, function(!Object))|undefined} configCallback
 *     Optional callback that allows user code to manipulate the incoming
 *     configuration. See
 *     https://github.com/ampproject/amphtml/issues/1210 for some context
 *     on this.
 */
export function draw3p(win, data, configCallback) {
  const type = data.type;
  assert(win.context.location.originValidated != null,
      'Origin should have been validated');

  assert(isTagNameAllowed(data.type, win.context.tagName),
      'Embed type %s not allowed with tag %s', data.type, win.context.tagName);
  if (configCallback) {
    configCallback(data, data => {
      assert(data, 'Expected configuration to be passed as first argument');
      run(type, win, data);
    });
  } else {
    run(type, win, data);
  }
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
 * @param {function(!Object, function(!Object))} opt_configCallback If provided
 *     will be invoked with two arguments:
 *     1. The configuration parameters supplied to this embed.
 *     2. A callback that MUST be called for rendering to proceed. It takes
 *        no arguments. Configuration is expected to be modified in-place.
 */
window.draw3p = function(opt_configCallback) {
  const data = parseFragment(location.hash);
  window.context = data._context;
  window.context.location = parseUrl(data._context.location.href);
  validateParentOrigin(window, window.context.location);
  window.context.master = masterSelection(data.type);
  window.context.isMaster = window.context.master == window;
  window.context.data = data;
  window.context.noContentAvailable = triggerNoContentAvailable;
  window.context.requestResize = triggerResizeRequest;

  if (data.type === 'facebook' || data.type === 'twitter') {
    // Only make this available to selected embeds until the generic solution is
    // available.
    window.context.updateDimensions = triggerDimensions;
  }

  // This only actually works for ads.
  window.context.observeIntersection = observeIntersection;
  window.context.onResizeSuccess = onResizeSuccess;
  window.context.onResizeDenied = onResizeDenied;
  window.context.reportRenderedEntityIdentifier =
      reportRenderedEntityIdentifier;
  delete data._context;
  manageWin(window);
  draw3p(window, data, opt_configCallback);
  updateVisibilityState(window);
  nonSensitiveDataPostMessage('render-start');
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

function triggerResizeRequest(width, height) {
  nonSensitiveDataPostMessage('embed-size', {
    width: width,
    height: height
  });
}

/**
 * Registers a callback for intersections of this iframe with the current
 * viewport.
 * The passed in array has entries that aim to be compatible with
 * the IntersectionObserver spec callback.
 * http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#callbackdef-intersectionobservercallback
 * @param {function(!Array<IntersectionObserverEntry>)} observerCallback
 * @returns {!function} A function which removes the event listener that
 *    observes for intersection messages.
 */
function observeIntersection(observerCallback) {
  // Send request to received records.
  nonSensitiveDataPostMessage('send-intersections');
  return listenParent(window, 'intersection', data => {
    observerCallback(data.changes);
  });
}

/**
 * Listens for events via postMessage and updates `context.hidden` based on
 * it and forwards the event to a custom event called `amp:visibilitychange`.
 * @param {!Window} global
 */
function updateVisibilityState(global) {
  listenParent(window, 'embed-state', function(data) {
    global.context.hidden = data.pageHidden;
    const event = global.document.createEvent('Event');
    event.data = {
      hidden: data.pageHidden,
    };
    event.initEvent('amp:visibilitychange', true, true);
    global.dispatchEvent(event);
  });
}

/**
 * Registers a callback for communicating when a resize request succeeds.
 * @param {function(number)} observerCallback
 * @returns {!function} A function which removes the event listener that
 *    observes for resize status messages.
 */
function onResizeSuccess(observerCallback) {
  return listenParent(window, 'embed-resize-changed', data => {
    observerCallback(data.requestedHeight);
  });
}

/**
 * Registers a callback for communicating when a resize request is denied.
 * @param {function(number)} observerCallback
 * @returns {!function} A function which removes the event listener that
 *    observes for resize status messages.
 */
function onResizeDenied(observerCallback) {
  return listenParent(window, 'embed-resize-denied', data => {
    observerCallback(data.requestedHeight);
  });
}

/**
 * Reports the "entity" that was rendered to this frame to the parent for
 * reporting purposes.
 * The entityId MUST NOT contain user data or personal identifiable
 * information. One example for an acceptable data item would be the
 * creative id of an ad, while the user's location would not be
 * acceptable.
 * @param {string} entityId See comment above for content.
 */
function reportRenderedEntityIdentifier(entityId) {
  assert(typeof entityId == 'string',
      'entityId should be a string %s', entityId);
  nonSensitiveDataPostMessage('entity-id', {
    id: entityId
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
      'Parent origin mismatch: %s, %s',
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

/**
 * Not all types of embeds are allowed to be used with all tag names on the
 * AMP side. This function checks whether the current usage is permissible.
 * @param {string} type
 * @param {string|undefined} tagName The tagName that was used to embed this
 *     3p-frame.
 * @return {boolean}
 */
export function isTagNameAllowed(type, tagName) {
  if (tagName == 'AMP-EMBED') {
    return !!AMP_EMBED_ALLOWED[type];
  }
  return true;
}
