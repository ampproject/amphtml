import { resolvedPromise as _resolvedPromise2 } from "./../../../src/core/data-structures/promise";import { resolvedPromise as _resolvedPromise } from "./../../../src/core/data-structures/promise"; /**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import { Services } from "../../../src/service";
import { addParamsToUrl, resolveRelativeUrl } from "../../../src/url";
import {
createElementWithAttributes,
iterateCursor,
removeElement } from "../../../src/core/dom";

import { matches } from "../../../src/core/dom/query";
import { toArray } from "../../../src/core/types/array";
import { user } from "../../../src/log";

/**
 * Add the caching sources to the video if opted in.
 * The request is sent to the AMP cache url with /mbv path prefix,
 * and appends the document canonical url as the queryParam `amp_video_host_url`.
 *
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @param {number=} maxBitrate
 * @return {!Promise}
 */
export function fetchCachedSources(
videoEl,
ampdoc)

{var _videoEl$querySelecto;var maxBitrate = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : Number.POSITIVE_INFINITY;
  var win = ampdoc.win;
  // Keep non cached evergreen sources for crawlers.
  if (Services.platformFor(win).isBot()) {
    return _resolvedPromise();
  }
  if (
  !(
  videoEl.getAttribute('src') || ((_videoEl$querySelecto =
  videoEl.querySelector('source[src]')) !== null && _videoEl$querySelecto !== void 0) && _videoEl$querySelecto.getAttribute('src')))

  {
    user().error('AMP-VIDEO', 'Video cache not properly configured');
    return _resolvedPromise2();
  }

  Services.performanceFor(ampdoc.win).addEnabledExperiment('video-cache');

  var _Services$documentInf = Services.documentInfoForDoc(win.document),canonicalUrl = _Services$documentInf.canonicalUrl,sourceUrl = _Services$documentInf.sourceUrl;
  maybeReplaceSrcWithSourceElement(videoEl, win);
  var videoUrl = resolveRelativeUrl(selectVideoSource(videoEl), sourceUrl);
  return getCacheUrlService(videoEl, ampdoc).
  then(function (service) {return service.createCacheUrl(videoUrl);}).
  then(function (cacheUrl) {
    var requestUrl = addParamsToUrl(cacheUrl.replace(/\/[ic]\//, '/mbv/'), {
      'amp_video_host_url':
      /* document url that contains the video */canonicalUrl });

    return Services.xhrFor(win).fetch(requestUrl, { prerenderSafe: true });
  }).
  then(function (response) {return response.json();}).
  then(function (jsonResponse) {return (
      applySourcesToVideo(videoEl, jsonResponse['sources'], maxBitrate));}).

  catch(function () {
    // If cache fails, video should still load properly.
  });
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {?string}
 */
function selectVideoSource(videoEl) {var _possibleSources$;
  var possibleSources = toArray(videoEl.querySelectorAll('source[src]'));
  for (var i = 0; i < possibleSources.length; i++) {
    if (matches(possibleSources[i], '[type*="video/mp4"]')) {
      return possibleSources[i].getAttribute('src');
    }
  }
  return ((_possibleSources$ = possibleSources[0]) === null || _possibleSources$ === void 0) ? (void 0) : _possibleSources$.getAttribute('src');
}

/**
 *
 * @param {!Element} videoEl
 * @param {!Array<!Object>} sources
 * @param {number} maxBitrate
 */
function applySourcesToVideo(videoEl, sources, maxBitrate) {
  sources.
  sort(function (a, b) {return a['bitrate_kbps'] - b['bitrate_kbps'];}).
  forEach(function (source) {
    if (source['bitrate_kbps'] > maxBitrate) {
      return;
    }
    var sourceEl = createElementWithAttributes(
    videoEl.ownerDocument,
    'source',
    {
      'src': source['url'],
      'type': source['type'],
      'data-bitrate': source['bitrate_kbps'],
      'i-amphtml-video-cached-source': '' });


    videoEl.insertBefore(sourceEl, videoEl.firstChild);
  });
}

/**
 * If present, moves the src attribute to a source element to enable playing
 * from multiple sources: the cached ones and the fallback initial src.
 * @param {!Element} videoEl
 * @param {!Window} win
 */
function maybeReplaceSrcWithSourceElement(videoEl, win) {
  if (!videoEl.hasAttribute('src')) {
    return;
  }
  var sourceEl = win.document.createElement('source');
  var srcAttr = videoEl.getAttribute('src');
  sourceEl.setAttribute('src', srcAttr);

  var typeAttr = videoEl.getAttribute('type');
  if (typeAttr) {
    sourceEl.setAttribute('type', typeAttr);
  }

  // Remove the src attr so the source children can play.
  videoEl.removeAttribute('src');
  videoEl.removeAttribute('type');

  // Remove all existing sources as they are never supposed to play for a video
  // that has a src, cf https://html.spec.whatwg.org/#concept-media-load-algorithm
  var sourceEls = videoEl.querySelectorAll('source');
  iterateCursor(sourceEls, function (el) {return removeElement(el);});

  videoEl.insertBefore(sourceEl, videoEl.firstChild);
}

/**
 * Lazy loads the amp-cache-url extension if needed and retrieves its service.
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @return {!Promise<../../../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
 */
function getCacheUrlService(videoEl, ampdoc) {
  return Services.extensionsFor(ampdoc.win).
  installExtensionForDoc(ampdoc, 'amp-cache-url').
  then(function () {return Services.cacheUrlServicePromiseForDoc(videoEl);});
}
// /Users/mszylkowski/src/amphtml/extensions/amp-video/0.1/video-cache.js