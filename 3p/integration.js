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
import {
  IntegrationAmpContext,
  masterSelection,
} from './ampcontext-integration';
import {installEmbedStateListener, manageWin} from './environment';
import {isExperimentOn} from './3p';
import {nonSensitiveDataPostMessage, listenParent} from './messaging';
import {
  computeInMasterFrame,
  nextTick,
  register,
  run,
  setExperimentToggles,
} from './3p';
import {urls} from '../src/config';
import {endsWith} from '../src/string';
import {parseJson} from '../src/json';
import {parseUrl, getSourceUrl, isProxyOrigin} from '../src/url';
import {dev, initLogConstructor, setReportError, user} from '../src/log';
import {dict} from '../src/utils/object.js';
import {getMode} from '../src/mode';
import {startsWith} from '../src/string.js';
import {AmpEvents} from '../src/amp-events';

// 3P - please keep in alphabetic order
import {facebook} from './facebook';
import {github} from './github';
import {reddit} from './reddit';
import {twitter} from './twitter';

// 3P Ad Networks - please keep in alphabetic order
import {_ping_} from '../ads/_ping_';
import {a8} from '../ads/a8';
import {a9} from '../ads/a9';
import {accesstrade} from '../ads/accesstrade';
import {adblade, industrybrains} from '../ads/adblade';
import {adbutler} from '../ads/adbutler';
import {adform} from '../ads/adform';
import {adfox} from '../ads/adfox';
import {adgeneration} from '../ads/adgeneration';
import {adhese} from '../ads/adhese';
import {adition} from '../ads/adition';
import {adman} from '../ads/adman';
import {admanmedia} from '../ads/admanmedia';
import {adreactor} from '../ads/adreactor';
import {adsense} from '../ads/google/adsense';
import {adsnative} from '../ads/adsnative';
import {adspeed} from '../ads/adspeed';
import {adspirit} from '../ads/adspirit';
import {adstir} from '../ads/adstir';
import {adtech} from '../ads/adtech';
import {adthrive} from '../ads/adthrive';
import {aduptech} from '../ads/aduptech';
import {adverline} from '../ads/adverline';
import {adverticum} from '../ads/adverticum';
import {advertserve} from '../ads/advertserve';
import {affiliateb} from '../ads/affiliateb';
import {amoad} from '../ads/amoad';
import {appnexus} from '../ads/appnexus';
import {atomx} from '../ads/atomx';
import {bidtellect} from '../ads/bidtellect';
import {brainy} from '../ads/brainy';
import {bringhub} from '../ads/bringhub';
import {caajainfeed} from '../ads/caajainfeed';
import {capirs} from '../ads/capirs';
import {caprofitx} from '../ads/caprofitx';
import {chargeads} from '../ads/chargeads';
import {colombia} from '../ads/colombia';
import {contentad} from '../ads/contentad';
import {criteo} from '../ads/criteo';
import {csa} from '../ads/google/csa';
import {distroscale} from '../ads/distroscale';
import {ezoic} from '../ads/ezoic';
import {dotandads} from '../ads/dotandads';
import {doubleclick} from '../ads/google/doubleclick';
import {eas} from '../ads/eas';
import {engageya} from '../ads/engageya';
import {eplanning} from '../ads/eplanning';
import {f1e} from '../ads/f1e';
import {f1h} from '../ads/f1h';
import {felmat} from '../ads/felmat';
import {flite} from '../ads/flite';
import {fluct} from '../ads/fluct';
import {fusion} from '../ads/fusion';
import {genieessp} from '../ads/genieessp';
import {gmossp} from '../ads/gmossp';
import {gumgum} from '../ads/gumgum';
import {holder} from '../ads/holder';
import {ibillboard} from '../ads/ibillboard';
import {imaVideo} from '../ads/google/imaVideo';
import {imedia} from '../ads/imedia';
import {imobile} from '../ads/imobile';
import {improvedigital} from '../ads/improvedigital';
import {inmobi} from '../ads/inmobi';
import {ix} from '../ads/ix';
import {kargo} from '../ads/kargo';
import {kiosked} from '../ads/kiosked';
import {kixer} from '../ads/kixer';
import {ligatus} from '../ads/ligatus';
import {loka} from '../ads/loka';
import {mads} from '../ads/mads';
import {mantisDisplay, mantisRecommend} from '../ads/mantis';
import {mediaimpact} from '../ads/mediaimpact';
import {medianet} from '../ads/medianet';
import {mediavine} from '../ads/mediavine';
import {meg} from '../ads/meg';
import {microad} from '../ads/microad';
import {mixpo} from '../ads/mixpo';
import {mywidget} from '../ads/mywidget';
import {nativo} from '../ads/nativo';
import {navegg} from '../ads/navegg';
import {nend} from '../ads/nend';
import {netletix} from '../ads/netletix';
import {nokta} from '../ads/nokta';
import {openadstream} from '../ads/openadstream';
import {openx} from '../ads/openx';
import {outbrain} from '../ads/outbrain';
import {plista} from '../ads/plista';
import {polymorphicads} from '../ads/polymorphicads';
import {popin} from '../ads/popin';
import {pubmatic} from '../ads/pubmatic';
import {pubmine} from '../ads/pubmine';
import {pulsepoint} from '../ads/pulsepoint';
import {purch} from '../ads/purch';
import {revcontent} from '../ads/revcontent';
import {relap} from '../ads/relap';
import {rubicon} from '../ads/rubicon';
import {sharethrough} from '../ads/sharethrough';
import {sklik} from '../ads/sklik';
import {slimcutmedia} from '../ads/slimcutmedia';
import {smartadserver} from '../ads/smartadserver';
import {smartclip} from '../ads/smartclip';
import {sortable} from '../ads/sortable';
import {sovrn} from '../ads/sovrn';
import {spotx} from '../ads/spotx';
import {sunmedia} from '../ads/sunmedia';
import {swoop} from '../ads/swoop';
import {taboola} from '../ads/taboola';
import {teads} from '../ads/teads';
import {triplelift} from '../ads/triplelift';
import {valuecommerce} from '../ads/valuecommerce';
import {webediads} from '../ads/webediads';
import {weboramaDisplay} from '../ads/weborama';
import {widespace} from '../ads/widespace';
import {xlift} from '../ads/xlift';
import {yahoo} from '../ads/yahoo';
import {yahoojp} from '../ads/yahoojp';
import {yandex} from '../ads/yandex';
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
  bringhub: true,
  engageya: true,
  'mantis-recommend': true,
  mywidget: true,
  outbrain: true,
  plista: true,
  smartclip: true,
  taboola: true,
  zergnet: true,
};


/** @const {!JsonObject} */
const FALLBACK_CONTEXT_DATA = dict({
  '_context': dict(),
});


// Need to cache iframeName as it will be potentially overwritten by
// masterSelection, as per below.
const iframeName = window.name;
const data = getData(iframeName);

window.context = data['_context'];

// This should only be invoked after window.context is set
initLogConstructor();
setReportError(console.error.bind(console));

// Experiment toggles
setExperimentToggles(window.context.experimentToggles);
delete window.context.experimentToggles;

if (getMode().test || getMode().localDev) {
  register('_ping_', _ping_);
}

// Keep the list in alphabetic order
register('a8', a8);
register('a9', a9);
register('accesstrade', accesstrade);
register('adblade', adblade);
register('adbutler', adbutler);
register('adform', adform);
register('adfox', adfox);
register('adgeneration', adgeneration);
register('adhese', adhese);
register('adition', adition);
register('adman', adman);
register('admanmedia', admanmedia);
register('adreactor', adreactor);
register('adsense', adsense);
register('adsnative', adsnative);
register('adspeed', adspeed);
register('adspirit', adspirit);
register('adstir', adstir);
register('adtech', adtech);
register('adthrive', adthrive);
register('aduptech', aduptech);
register('adverline', adverline);
register('adverticum', adverticum);
register('advertserve', advertserve);
register('affiliateb', affiliateb);
register('amoad', amoad);
register('appnexus', appnexus);
register('atomx', atomx);
register('bidtellect', bidtellect);
register('brainy', brainy);
register('bringhub', bringhub);
register('caajainfeed', caajainfeed);
register('capirs', capirs);
register('caprofitx', caprofitx);
register('chargeads', chargeads);
register('colombia', colombia);
register('contentad', contentad);
register('criteo', criteo);
register('csa', csa);
register('distroscale', distroscale);
register('dotandads', dotandads);
register('doubleclick', doubleclick);
register('eas', eas);
register('engageya', engageya);
register('eplanning', eplanning);
register('ezoic', ezoic);
register('f1e', f1e);
register('f1h', f1h);
register('facebook', facebook);
register('felmat', felmat);
register('flite', flite);
register('fluct', fluct);
register('fusion', fusion);
register('genieessp', genieessp);
register('github', github);
register('gmossp', gmossp);
register('gumgum', gumgum);
register('holder', holder);
register('ibillboard', ibillboard);
register('ima-video', imaVideo);
register('imedia', imedia);
register('imobile', imobile);
register('improvedigital', improvedigital);
register('industrybrains', industrybrains);
register('inmobi', inmobi);
register('ix', ix);
register('kargo', kargo);
register('kiosked', kiosked);
register('kixer', kixer);
register('ligatus', ligatus);
register('loka', loka);
register('mads', mads);
register('mantis-display', mantisDisplay);
register('mantis-recommend', mantisRecommend);
register('mediaimpact', mediaimpact);
register('medianet', medianet);
register('mediavine', mediavine);
register('meg', meg);
register('microad', microad);
register('mixpo', mixpo);
register('mywidget', mywidget);
register('nativo', nativo);
register('navegg', navegg);
register('nend', nend);
register('netletix', netletix);
register('nokta', nokta);
register('openadstream', openadstream);
register('openx', openx);
register('outbrain', outbrain);
register('plista', plista);
register('polymorphicads', polymorphicads);
register('popin', popin);
register('pubmatic', pubmatic);
register('pubmine', pubmine);
register('pulsepoint', pulsepoint);
register('purch', purch);
register('reddit', reddit);
register('relap', relap);
register('revcontent', revcontent);
register('rubicon', rubicon);
register('sharethrough', sharethrough);
register('sklik', sklik);
register('slimcutmedia', slimcutmedia);
register('smartadserver', smartadserver);
register('smartclip', smartclip);
register('sortable', sortable);
register('sovrn', sovrn);
register('spotx', spotx);
register('sunmedia', sunmedia);
register('swoop', swoop);
register('taboola', taboola);
register('teads', teads);
register('triplelift', triplelift);
register('twitter', twitter);
register('valuecommerce', valuecommerce);
register('webediads', webediads);
register('weborama-display', weboramaDisplay);
register('widespace', widespace);
register('xlift' , xlift);
register('yahoo', yahoo);
register('yahoojp', yahoojp);
register('yandex', yandex);
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
 * Gets data encoded in iframe name attribute.
 * @return {!JsonObject}
 */
function getData(iframeName) {
  try {
    // TODO(bradfrizzell@): Change the data structure of the attributes
    //    to make it less terrible.
    return parseJson(iframeName)['attributes'];
  } catch (err) {
    if (!getMode().test) {
      dev().info(
          'INTEGRATION', 'Could not parse context from:', iframeName);
    }
    return FALLBACK_CONTEXT_DATA;
  }
}


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
    const location = parseUrl(data['_context']['location']['href']);

    ensureFramed(window);
    validateParentOrigin(window, location);
    validateAllowedTypes(window, data['type'], opt_allowed3pTypes);
    if (opt_allowedEmbeddingOrigins) {
      validateAllowedEmbeddingOrigins(window, opt_allowedEmbeddingOrigins);
    }
    installContext(window);
    delete data['_context'];
    manageWin(window);
    installEmbedStateListener();
    draw3p(window, data, opt_configCallback);

    if (isAmpContextExperimentOn()) {
      window.context.bootstrapLoaded();
    } else {
      updateVisibilityState(window);

      // Subscribe to page visibility updates.
      nonSensitiveDataPostMessage('send-embed-state');
      nonSensitiveDataPostMessage('bootstrap-loaded');
    }
  } catch (e) {
    const c = window.context || {mode: {test: false}};
    if (!c.mode.test) {
      lightweightErrorReport(e, c.canary);
      throw e;
    }
  }
};


/** @return {boolean} */
function isAmpContextExperimentOn() {
  return isExperimentOn('3p-use-ampcontext');
}


/**
 * Installs window.context API.
 * @param {!Window} win
 */
function installContext(win) {
  if (isAmpContextExperimentOn()) {
    installContextUsingExperimentalImpl(win);
    return;
  }

  installContextUsingStandardImpl(win);
}


/**
 * Installs window.context API.
 * @param {!Window} win
 */
function installContextUsingExperimentalImpl(win) {
  win.context = new IntegrationAmpContext(win);
}


/**
 * Installs window.context using standard (to be deprecated) implementation.
 * @param {!Window} win
 */
function installContextUsingStandardImpl(win) {
  // Define master related properties to be lazily read.
  Object.defineProperties(win.context, {
    master: {
      get: () => masterSelection(win, data['type']),
    },
    isMaster: {
      get: isMaster,
    },
  });

  win.context.data = data;
  win.context.location = parseUrl(data['_context']['location']['href']);
  win.context.noContentAvailable = triggerNoContentAvailable;
  win.context.requestResize = triggerResizeRequest;
  win.context.renderStart = triggerRenderStart;

  const type = data['type'];
  if (type === 'facebook' || type === 'twitter' || type === 'github') {
    // Only make this available to selected embeds until the
    // generic solution is available.
    win.context.updateDimensions = triggerDimensions;
  }

  // This only actually works for ads.
  const initialIntersection = win.context.initialIntersection;
  win.context.observeIntersection = cb => {
    const unlisten = observeIntersection(cb);
    // Call the callback with the value that was transmitted when the
    // iframe was drawn. Called in nextTick, so that callers don't
    // have to specially handle the sync case.
    nextTick(win, () => cb([initialIntersection]));
    return unlisten;
  };
  win.context.onResizeSuccess = onResizeSuccess;
  win.context.onResizeDenied = onResizeDenied;
  win.context.reportRenderedEntityIdentifier =
      reportRenderedEntityIdentifier;
  win.context.computeInMasterFrame = computeInMasterFrame;
  win.context.addContextToIframe = iframe => {
    iframe.name = iframeName;
  };
  win.context.getHtml = getHtml;
}


function triggerNoContentAvailable() {
  nonSensitiveDataPostMessage('no-content');
}

function triggerDimensions(width, height) {
  nonSensitiveDataPostMessage('embed-size', dict({
    'width': width,
    'height': height,
  }));
}

function triggerResizeRequest(width, height) {
  nonSensitiveDataPostMessage('embed-size', dict({
    'width': width,
    'height': height,
  }));
}

/**
 * @param {!JsonObject=} opt_data fields: width, height
 */
function triggerRenderStart(opt_data) {
  nonSensitiveDataPostMessage('render-start', opt_data);
}

/**
 * Id for getHtml postMessage.
 * @type {!number}
 */
let currentMessageId = 0;

/**
 * See readme for window.context.getHtml
 * @param {!string} selector - CSS selector of the node to take content from
 * @param {!Array<string>} attributes - tag attributes to be left in the stringified HTML
 * @param {!Function} callback
 */
function getHtml(selector, attributes, callback) {
  const messageId = currentMessageId++;
  nonSensitiveDataPostMessage('get-html', dict({
    'selector': selector,
    'attributes': attributes,
    'messageId': messageId,
  }));

  const unlisten = listenParent(window, 'get-html-result', data => {
    if (data['messageId'] === messageId) {
      callback(data['content']);
      unlisten();
    }
  });
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
    observerCallback(data['changes']);
  });
}

/**
 * Listens for events via postMessage and updates `context.hidden` based on
 * it and forwards the event to a custom event called `amp:visibilitychange`.
 * @param {!Window} global
 */
function updateVisibilityState(global) {
  listenParent(window, 'embed-state', function(data) {
    global.context.hidden = data['pageHidden'];
    dispatchVisibilityChangeEvent(global, data['pageHidden']);
  });
}


function dispatchVisibilityChangeEvent(win, isHidden) {
  const event = win.document.createEvent('Event');
  event.data = {hidden: isHidden};
  event.initEvent(AmpEvents.VISIBILITY_CHANGE, true, true);
  win.dispatchEvent(event);
}

/**
 * Registers a callback for communicating when a resize request succeeds.
 * @param {function(number, number)} observerCallback
 * @returns {!function()} A function which removes the event listener that
 *    observes for resize status messages.
 */
function onResizeSuccess(observerCallback) {
  return listenParent(window, 'embed-size-changed', data => {
    observerCallback(data['requestedHeight'], data['requestedWidth']);
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
    observerCallback(data['requestedHeight'], data['requestedWidth']);
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
  nonSensitiveDataPostMessage('entity-id', dict({
    'id': entityId,
  }));
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
  if (isProxyOrigin(ancestor)) {
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
 * @return {?JsonObject}
 * @visibleForTesting
 */
export function parseFragment(fragment) {
  try {
    let json = fragment.substr(1);
    // Some browser, notably Firefox produce an encoded version of the fragment
    // while most don't. Since we know how the string should start, this is easy
    // to detect.
    if (startsWith(json, '{%22')) {
      json = decodeURIComponent(json);
    }
    return /** @type {!JsonObject} */ (json ? parseJson(json) : dict());
  } catch (err) {
    return null;
  }
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
