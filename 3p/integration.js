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
import {installEmbedStateListener, manageWin} from './environment';
import {nonSensitiveDataPostMessage, listenParent} from './messaging';
import {computeInMasterFrame, nextTick, register, run} from './3p';
import {urls} from '../src/config';
import {endsWith} from '../src/string';
import {parseUrl, getSourceUrl} from '../src/url';
import {initLogConstructor, user} from '../src/log';
import {getMode} from '../src/mode';

// 3P - please keep in alphabetic order
import {facebook} from './facebook';
import {reddit} from './reddit';
import {twitter} from './twitter';

// 3P Ad Networks - please keep in alphabetic order
import {_ping_} from '../ads/_ping_';
import {a9} from '../ads/a9';
import {accesstrade} from '../ads/accesstrade';
import {adblade, industrybrains} from '../ads/adblade';
import {adform} from '../ads/adform';
import {adgeneration} from '../ads/adgeneration';
import {adition} from '../ads/adition';
import {adman} from '../ads/adman';
import {adreactor} from '../ads/adreactor';
import {adsense} from '../ads/google/adsense';
import {adsnative} from '../ads/adsnative';
import {adspirit} from '../ads/adspirit';
import {adstir} from '../ads/adstir';
import {adtech} from '../ads/adtech';
import {aduptech} from '../ads/aduptech';
import {adverline} from '../ads/adverline';
import {advertserve} from '../ads/advertserve';
import {affiliateb} from '../ads/affiliateb';
import {amoad} from '../ads/amoad';
import {appnexus} from '../ads/appnexus';
import {atomx} from '../ads/atomx';
import {caprofitx} from '../ads/caprofitx';
import {chargeads} from '../ads/chargeads';
import {colombia} from '../ads/colombia';
import {contentad} from '../ads/contentad';
import {criteo} from '../ads/criteo';
import {ezoic} from '../ads/ezoic';
import {dotandads} from '../ads/dotandads';
import {doubleclick} from '../ads/google/doubleclick';
import {eplanning} from '../ads/eplanning';
import {flite} from '../ads/flite';
import {genieessp} from '../ads/genieessp';
import {gmossp} from '../ads/gmossp';
import {ibillboard} from '../ads/ibillboard';
import {imobile} from '../ads/imobile';
import {improvedigital} from '../ads/improvedigital';
import {inmobi} from '../ads/inmobi';
import {kargo} from '../ads/kargo';
import {kixer} from '../ads/kixer';
import {ligatus} from '../ads/ligatus';
import {loka} from '../ads/loka';
import {mads} from '../ads/mads';
import {mantisDisplay, mantisRecommend} from '../ads/mantis';
import {mediaimpact} from '../ads/mediaimpact';
import {mediavine} from '../ads/mediavine';
import {meg} from '../ads/meg';
import {microad} from '../ads/microad';
import {mixpo} from '../ads/mixpo';
import {nativo} from '../ads/nativo';
import {nend} from '../ads/nend';
import {nokta} from '../ads/nokta';
import {openadstream} from '../ads/openadstream';
import {openx} from '../ads/openx';
import {plista} from '../ads/plista';
import {pubmatic} from '../ads/pubmatic';
import {pubmine} from '../ads/pubmine';
import {pulsepoint} from '../ads/pulsepoint';
import {purch} from '../ads/purch';
import {revcontent} from '../ads/revcontent';
import {rubicon} from '../ads/rubicon';
import {sharethrough} from '../ads/sharethrough';
import {smartadserver} from '../ads/smartadserver';
import {smartclip} from '../ads/smartclip';
import {sortable} from '../ads/sortable';
import {sovrn} from '../ads/sovrn';
import {taboola} from '../ads/taboola';
import {teads} from '../ads/teads';
import {triplelift} from '../ads/triplelift';
import {webediads} from '../ads/webediads';
import {weboramaDisplay} from '../ads/weborama';
import {widespace} from '../ads/widespace';
import {xlift} from '../ads/xlift';
import {yahoo} from '../ads/yahoo';
import {yahoojp} from '../ads/yahoojp';
import {yieldbot} from '../ads/yieldbot';
import {yieldmo} from '../ads/yieldmo';
import {yieldone} from '../ads/yieldone';
import {zedo} from '../ads/zedo';
import {zergnet} from '../ads/zergnet';
import {zucks} from '../ads/zucks';

/**
 * Whether the embed type may be used with amp-embed tag.
 * @const {!Object<string, boolean>}
 */
const AMP_EMBED_ALLOWED = {
  _ping_: true,
  'mantis-recommend': true,
  plista: true,
  smartclip: true,
  taboola: true,
  zergnet: true,
};

const data = parseFragment(location.hash);
window.context = data._context;

// This should only be invoked after window.context is set
initLogConstructor();

if (getMode().test || getMode().localDev) {
  register('_ping_', _ping_);
}

// Keep the list in alphabetic order
register('a9', a9);
register('accesstrade', accesstrade);
register('adblade', adblade);
register('adform', adform);
register('adgeneration', adgeneration);
register('adition', adition);
register('adman', adman);
register('adreactor', adreactor);
register('adsense', adsense);
register('adsnative', adsnative);
register('adspirit', adspirit);
register('adstir', adstir);
register('adtech', adtech);
register('aduptech', aduptech);
register('adverline', adverline);
register('advertserve', advertserve);
register('affiliateb', affiliateb);
register('amoad', amoad);
register('appnexus', appnexus);
register('atomx', atomx);
register('caprofitx', caprofitx);
register('chargeads', chargeads);
register('colombia', colombia);
register('contentad', contentad);
register('criteo', criteo);
register('dotandads', dotandads);
register('doubleclick', doubleclick);
register('eplanning', eplanning);
register('ezoic', ezoic);
register('facebook', facebook);
register('flite', flite);
register('genieessp', genieessp);
register('gmossp', gmossp);
register('ibillboard', ibillboard);
register('imobile', imobile);
register('improvedigital', improvedigital);
register('industrybrains', industrybrains);
register('inmobi', inmobi);
register('kargo', kargo);
register('kixer', kixer);
register('ligatus', ligatus);
register('loka', loka);
register('mads', mads);
register('mantis-display', mantisDisplay);
register('mantis-recommend', mantisRecommend);
register('mediaimpact', mediaimpact);
register('mediavine', mediavine);
register('meg', meg);
register('microad', microad);
register('mixpo', mixpo);
register('nativo', nativo);
register('nend', nend);
register('nokta', nokta);
register('openadstream', openadstream);
register('openx', openx);
register('plista', plista);
register('pubmatic', pubmatic);
register('pubmine', pubmine);
register('pulsepoint', pulsepoint);
register('purch', purch);
register('reddit', reddit);
register('revcontent', revcontent);
register('rubicon', rubicon);
register('sharethrough', sharethrough);
register('smartadserver', smartadserver);
register('smartclip', smartclip);
register('sortable', sortable);
register('sovrn', sovrn);
register('taboola', taboola);
register('teads', teads);
register('triplelift', triplelift);
register('twitter', twitter);
register('webediads', webediads);
register('weborama-display', weboramaDisplay);
register('widespace', widespace);
register('xlift' , xlift);
register('yahoo', yahoo);
register('yahoojp', yahoojp);
register('yieldbot', yieldbot);
register('yieldmo', yieldmo);
register('zergnet', zergnet);
register('yieldone', yieldone);
register('zedo', zedo);
register('zucks', zucks);

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

  user().assert(isTagNameAllowed(data.type, win.context.tagName),
      'Embed type %s not allowed with tag %s', data.type, win.context.tagName);
  if (configCallback) {
    configCallback(data, data => {
      user().assert(data,
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
 * @return {boolean} Whether this is the master iframe.
 */
function isMaster() {
  return window.context.master == window;
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
    window.context.location = parseUrl(data._context.location.href);
    validateParentOrigin(window, window.context.location);
    validateAllowedTypes(window, data.type, opt_allowed3pTypes);
    if (opt_allowedEmbeddingOrigins) {
      validateAllowedEmbeddingOrigins(window, opt_allowedEmbeddingOrigins);
    }
    // Define master related properties to be lazily read.
    Object.defineProperties(window.context, {
      master: {
        get: () => masterSelection(data.type),
      },
      isMaster: {
        get: isMaster,
      },
    });
    window.context.data = data;
    window.context.noContentAvailable = triggerNoContentAvailable;
    window.context.requestResize = triggerResizeRequest;
    window.context.renderStart = triggerRenderStart;

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
    // Subscribe to page visibility updates.
    nonSensitiveDataPostMessage('send-embed-state');
    nonSensitiveDataPostMessage('bootstrap-loaded');
  } catch (e) {
    const c = window.context || {mode: {test: false}};
    if (!c.mode.test) {
      lightweightErrorReport(e, c.canary);
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
 * @param {{width, height}=} opt_data
 */
function triggerRenderStart(opt_data) {
  nonSensitiveDataPostMessage('render-start', opt_data);
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
  user().assert(typeof entityId == 'string',
      'entityId should be a string %s', entityId);
  nonSensitiveDataPostMessage('entity-id', {
    id: entityId,
  });
}

/**
 * Throws if the current frame's parent origin is not equal to
 * the claimed origin.
 * Only check for browsers that support ancestorOrigins
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
    return;
  }
  user().assert(ancestors[0] == parentLocation.origin,
      'Parent origin mismatch: %s, %s',
      ancestors[0], parentLocation.origin);
}

/**
 * Check that this iframe intended this particular ad type to run.
 * @param {!Window} window
 * @param {string} type 3p type
 * @param {!Array<string>|undefined} allowedTypes May be undefined.
 * @visibleForTesting
 */
export function validateAllowedTypes(window, type, allowedTypes) {
  const thirdPartyHost = parseUrl(urls.thirdParty).hostname;

  // Everything allowed in default iframe.
  if (window.location.hostname == thirdPartyHost) {
    return;
  }
  if (urls.thirdPartyFrameRegex.test(window.location.hostname)) {
    return;
  }
  if (window.location.hostname == 'ads.localhost') {
    return;
  }
  if (defaultAllowedTypesInCustomFrame.indexOf(type) != -1) {
    return;
  }
  user().assert(allowedTypes && allowedTypes.indexOf(type) != -1,
      'Non-whitelisted 3p type for custom iframe: ' + type);
}

/**
 * Check that parent host name was whitelisted.
 * @param {!Window} window
 * @param {!Array<string>} allowedHostnames Suffixes of allowed host names.
 * @visibleForTesting
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
  const cdnHostname = parseUrl(urls.cdn).hostname;
  const onDefault = hostname == cdnHostname;
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
 * @visibleForTesting
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
 * @param {boolean} isCanary
 */
function lightweightErrorReport(e, isCanary) {
  new Image().src = urls.errorReporting +
      '?3p=1&v=' + encodeURIComponent('$internalRuntimeVersion$') +
      '&m=' + encodeURIComponent(e.message) +
      '&ca=' + (isCanary ? 1 : 0) +
      '&r=' + encodeURIComponent(document.referrer) +
      '&s=' + encodeURIComponent(e.stack || '');
}
