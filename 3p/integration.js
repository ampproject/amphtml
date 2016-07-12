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
import {installEmbedStateListener} from './environment';
import {a9} from '../ads/a9';
import {adblade, industrybrains} from '../ads/adblade';
import {adition} from '../ads/adition';
import {adform} from '../ads/adform';
import {adman} from '../ads/adman';
import {adreactor} from '../ads/adreactor';
import {adsense} from '../ads/google/adsense';
import {adtech} from '../ads/adtech';
import {aduptech} from '../ads/aduptech';
import {plista} from '../ads/plista';
import {criteo} from '../ads/criteo';
import {doubleclick} from '../ads/google/doubleclick';
import {dotandads} from '../ads/dotandads';
import {endsWith} from '../src/string';
import {facebook} from './facebook';
import {flite} from '../ads/flite';
import {nativo} from '../ads/nativo';
import {mantisDisplay, mantisRecommend} from '../ads/mantis';
import {improvedigital} from '../ads/improvedigital';
import {manageWin} from './environment';
import {mediaimpact} from '../ads/mediaimpact';
import {nonSensitiveDataPostMessage, listenParent} from './messaging';
import {twitter} from './twitter';
import {yieldmo} from '../ads/yieldmo';
import {computeInMasterFrame, nextTick, register, run} from './3p';
import {parseUrl, getSourceUrl} from '../src/url';
import {appnexus} from '../ads/appnexus';
import {taboola} from '../ads/taboola';
import {smartadserver} from '../ads/smartadserver';
import {widespace} from '../ads/widespace';
import {sovrn} from '../ads/sovrn';
import {sortable} from '../ads/sortable';
import {revcontent} from '../ads/revcontent';
import {openadstream} from '../ads/openadstream';
import {openx} from '../ads/openx';
import {triplelift} from '../ads/triplelift';
import {teads} from '../ads/teads';
import {rubicon} from '../ads/rubicon';
import {imobile} from '../ads/imobile';
import {webediads} from '../ads/webediads';
import {pubmatic} from '../ads/pubmatic';
import {yieldbot} from '../ads/yieldbot';
import {user} from '../src/log';
import {gmossp} from '../ads/gmossp';
import {weboramaDisplay} from '../ads/weborama';
import {adstir} from '../ads/adstir';
import {colombia} from '../ads/colombia';
import {sharethrough} from '../ads/sharethrough';
import {eplanning} from '../ads/eplanning';
import {microad} from '../ads/microad';
import {yahoojp} from '../ads/yahoojp';
import {chargeads} from '../ads/chargeads';
import {nend} from '../ads/nend';
import {adgeneration} from '../ads/adgeneration';
import {genieessp} from '../ads/genieessp';
import {kargo} from '../ads/kargo';
import {pulsepoint} from '../ads/pulsepoint';

/**
 * Whether the embed type may be used with amp-embed tag.
 * @const {!Object<string, boolean>}
 */
const AMP_EMBED_ALLOWED = {
  taboola: true,
  'mantis-recommend': true,
  plista: true,
};

register('a9', a9);
register('adblade', adblade);
register('adition', adition);
register('adform', adform);
register('adman', adman);
register('adreactor', adreactor);
register('adsense', adsense);
register('adtech', adtech);
register('aduptech', aduptech);
register('plista', plista);
register('criteo', criteo);
register('doubleclick', doubleclick);
register('appnexus', appnexus);
register('flite', flite);
register('mantis-display', mantisDisplay);
register('mantis-recommend', mantisRecommend);
register('improvedigital', improvedigital);
register('industrybrains', industrybrains);
register('taboola', taboola);
register('dotandads', dotandads);
register('yieldmo', yieldmo);
register('nativo', nativo);
register('_ping_', function(win, data) {
  win.document.getElementById('c').textContent = data.ping;
});
register('twitter', twitter);
register('facebook', facebook);
register('smartadserver', smartadserver);
register('widespace', widespace);
register('sovrn', sovrn);
register('mediaimpact', mediaimpact);
register('revcontent', revcontent);
register('sortable', sortable);
register('openadstream', openadstream);
register('openx', openx);
register('triplelift', triplelift);
register('teads', teads);
register('rubicon', rubicon);
register('imobile', imobile);
register('webediads', webediads);
register('pubmatic', pubmatic);
register('gmossp', gmossp);
register('weborama-display', weboramaDisplay);
register('yieldbot', yieldbot);
register('adstir', adstir);
register('colombia', colombia);
register('sharethrough', sharethrough);
register('eplanning', eplanning);
register('microad', microad);
register('yahoojp', yahoojp);
register('chargeads', chargeads);
register('nend', nend);
register('adgeneration', adgeneration);
register('genieessp', genieessp);
register('kargo', kargo);
register('pulsepoint', pulsepoint);

// For backward compat, we always allow these types without the iframe
// opting in.
const defaultAllowedTypesInCustomFrame = [
  // Entries must be reasonably safe and not allow overriding the injected
  // JS URL.
  // Each custom iframe can override this through the second argument to
  // draw3p. See amp-ad docs.
  'facebook',
  'twitter',
  'doubleclick',
  'yieldbot',
  '_ping_',
];

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
  user.assert(win.context.location.originValidated != null,
      'Origin should have been validated');

  user.assert(isTagNameAllowed(data.type, win.context.tagName),
      'Embed type %s not allowed with tag %s', data.type, win.context.tagName);
  if (configCallback) {
    configCallback(data, data => {
      user.assert(data,
          'Expected configuration to be passed as first argument');
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
 * @param {!Array<string>=} opt_allowed3pTypes List of advertising network
 *     types you expect.
 * @param {!Array<string>=} opt_allowedEmbeddingOrigins List of domain suffixes
 *     that are allowed to embed this frame.
 */
window.draw3p = function(opt_configCallback, opt_allowed3pTypes,
    opt_allowedEmbeddingOrigins) {
  try {
    ensureFramed(window);
    const data = parseFragment(location.hash);
    window.context = data._context;
    window.context.location = parseUrl(data._context.location.href);
    validateParentOrigin(window, window.context.location);
    validateAllowedTypes(window, data.type, opt_allowed3pTypes);
    if (opt_allowedEmbeddingOrigins) {
      validateAllowedEmbeddingOrigins(window, opt_allowedEmbeddingOrigins);
    }
    window.context.master = masterSelection(data.type);
    window.context.isMaster = window.context.master == window;
    window.context.data = data;
    window.context.noContentAvailable = triggerNoContentAvailable;
    window.context.requestResize = triggerResizeRequest;

    if (data.type === 'facebook' || data.type === 'twitter') {
      // Only make this available to selected embeds until the
      // generic solution is available.
      window.context.updateDimensions = triggerDimensions;
    }

    // This only actually works for ads.
    const initialIntersection = window.context.initialIntersection;
    window.context.observeIntersection = cb => {
      const unlisten = observeIntersection(cb);
      // Call the callback with the value that was transmitted when the
      // iframe was drawn. Called in nextTick, so that callers don't
      // have to specially handle the sync case.
      nextTick(window, () => cb([initialIntersection]));
      return unlisten;
    };
    window.context.onResizeSuccess = onResizeSuccess;
    window.context.onResizeDenied = onResizeDenied;
    window.context.reportRenderedEntityIdentifier =
        reportRenderedEntityIdentifier;
    window.context.computeInMasterFrame = computeInMasterFrame;
    delete data._context;

    manageWin(window);
    installEmbedStateListener();
    draw3p(window, data, opt_configCallback);
    updateVisibilityState(window);
    nonSensitiveDataPostMessage('render-start');
  } catch (e) {
    if (!window.context.mode.test) {
      lightweightErrorReport(e);
      throw e;
    }
  }
};

function triggerNoContentAvailable() {
  nonSensitiveDataPostMessage('no-content');
}

function triggerDimensions(width, height) {
  nonSensitiveDataPostMessage('embed-size', {width, height});
}

function triggerResizeRequest(width, height) {
  nonSensitiveDataPostMessage('embed-size', {width, height});
}

/**
 * Registers a callback for intersections of this iframe with the current
 * viewport.
 * The passed in array has entries that aim to be compatible with
 * the IntersectionObserver spec callback.
 * http://rawgit.com/slightlyoff/IntersectionObserver/master/index.html#callbackdef-intersectionobservercallback
 * @param {function(!Array<IntersectionObserverEntry>)} observerCallback
 * @returns {!function()} A function which removes the event listener that
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
 * @param {function(number, number)} observerCallback
 * @returns {!function()} A function which removes the event listener that
 *    observes for resize status messages.
 */
function onResizeSuccess(observerCallback) {
  return listenParent(window, 'embed-size-changed', data => {
    observerCallback(data.requestedHeight, data.requestedWidth);
  });
}

/**
 * Registers a callback for communicating when a resize request is denied.
 * @param {function(number, number)} observerCallback
 * @returns {!function()} A function which removes the event listener that
 *    observes for resize status messages.
 */
function onResizeDenied(observerCallback) {
  return listenParent(window, 'embed-size-denied', data => {
    observerCallback(data.requestedHeight, data.requestedWidth);
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
  user.assert(typeof entityId == 'string',
      'entityId should be a string %s', entityId);
  nonSensitiveDataPostMessage('entity-id', {
    id: entityId,
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
  user.assert(ancestors[0] == parentLocation.origin,
      'Parent origin mismatch: %s, %s',
      ancestors[0], parentLocation.origin);
  parentLocation.originValidated = true;
}

/**
 * Check that this iframe intended this particular ad type to run.
 * @param {!Window} window
 * @param {string} type 3p type
 * @param {!Array<string>|undefined} allowedTypes May be undefined.
 * @visiblefortesting
 */
export function validateAllowedTypes(window, type, allowedTypes) {
  // Everything allowed in default iframe.
  if (window.location.hostname == '3p.ampproject.net') {
    return;
  }
  if (/^d-\d+\.ampproject\.net$/.test(window.location.hostname)) {
    return;
  }
  if (window.location.hostname == 'ads.localhost') {
    return;
  }
  if (defaultAllowedTypesInCustomFrame.indexOf(type) != -1) {
    return;
  }
  user.assert(allowedTypes && allowedTypes.indexOf(type) != -1,
      'Non-whitelisted 3p type for custom iframe: ' + type);
}

/**
 * Check that parent host name was whitelisted.
 * @param {!Window} window
 * @param {!Array<string>} allowedHostnames Suffixes of allowed host names.
 * @visiblefortesting
 */
export function validateAllowedEmbeddingOrigins(window, allowedHostnames) {
  if (!window.document.referrer) {
    throw new Error('Referrer expected: ' + window.location.href);
  }
  const ancestors = window.location.ancestorOrigins;
  // We prefer the unforgable ancestorOrigins, but referrer is better than
  // nothing.
  const ancestor = ancestors ? ancestors[0] : window.document.referrer;
  let hostname = parseUrl(ancestor).hostname;
  const onDefault = hostname == 'cdn.ampproject.org';
  if (onDefault) {
    // If we are on the cache domain, parse the source hostname from
    // the referrer. The referrer is used because it should be
    // trustable.
    hostname = parseUrl(getSourceUrl(window.document.referrer)).hostname;
  }
  for (let i = 0; i < allowedHostnames.length; i++) {
    // Either the hostname is exactly as whitelisted…
    if (allowedHostnames[i] == hostname) {
      return;
    }
    // Or it ends in .$hostname (aka is a sub domain of the whitelisted domain.
    if (endsWith(hostname, '.' + allowedHostnames[i])) {
      return;
    }
  }
  throw new Error('Invalid embedding hostname: ' + hostname + ' not in '
      + allowedHostnames);
}

/**
 * Throws if this window is a top level window.
 * @param {!Window} window
 * @visiblefortesting
 */
export function ensureFramed(window) {
  if (window == window.parent) {
    throw new Error('Must be framed: ' + window.location.href);
  }
}

/**
 * Expects the fragment to contain JSON.
 * @param {string} fragment Value of location.fragment
 * @return {!JSONType}
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
  return /** @type {!JSONType} */ (json ? JSON.parse(json) : {});
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

/**
 * Reports an error to the server. Must only be called once per page.
 * Not for use in event handlers.
 *
 * We don't use the default error in error.js handler because it has
 * too many deps for this small JS binary.
 *
 * @param {!Error} e
 */
function lightweightErrorReport(e) {
  new Image().src = 'https://amp-error-reporting.appspot.com/r' +
      '?3p=1&v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&m=' + encodeURIComponent(e.message) +
      '&r=' + encodeURIComponent(document.referrer);
}
