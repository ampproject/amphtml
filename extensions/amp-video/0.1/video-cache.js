/**
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

import {Services} from '../../../src/services';
import {addParamsToUrl, resolveRelativeUrl} from '../../../src/url';
import {
  createElementWithAttributes,
  iterateCursor,
  removeElement,
} from '../../../src/dom';
import {matches} from '../../../src/core/dom/query';
import {toArray} from '../../../src/core/types/array';
import {user} from '../../../src/log';

/**
 * Add the caching sources to the video if opted in.
 * The request is sent to the AMP cache url with /mbv path prefix,
 * and appends the document canonical url as the queryParam `amp_video_host_url`.
 *
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @return {!Promise}
 */
export function fetchCachedSources(videoEl, ampdoc) {
  const {win} = ampdoc;
  if (
    !(
      videoEl.getAttribute('src') ||
      videoEl.querySelector('source[src]')?.getAttribute('src')
    )
  ) {
    user().error('AMP-VIDEO', 'Video cache not properly configured');
    return Promise.resolve();
  }
  const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(win.document);
  maybeReplaceSrcWithSourceElement(videoEl, win);
  const videoUrl = resolveRelativeUrl(selectVideoSource(videoEl), sourceUrl);
  return getCacheUrlService(videoEl, ampdoc)
    .then((service) => service.createCacheUrl(videoUrl))
    .then((cacheUrl) => {
      const requestUrl = addParamsToUrl(cacheUrl.replace('/c/', '/mbv/'), {
        'amp_video_host_url':
          /* document url that contains the video */ canonicalUrl,
      });
      return Services.xhrFor(win).fetch(requestUrl);
    })
    .then((response) => response.json())
    .then((jsonResponse) =>
      applySourcesToVideo(videoEl, jsonResponse['sources'])
    )
    .catch(() => {
      // If cache fails, video should still load properly.
    });
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {?string}
 */
function selectVideoSource(videoEl) {
  const possibleSources = toArray(videoEl.querySelectorAll('source[src]'));
  for (let i = 0; i < possibleSources.length; i++) {
    if (matches(possibleSources[i], '[type*="video/mp4"]')) {
      return possibleSources[i].getAttribute('src');
    }
  }
  return possibleSources[0]?.getAttribute('src');
}

/**
 *
 * @param {!Element} videoEl
 * @param {!Array<!Object>} sources
 */
function applySourcesToVideo(videoEl, sources) {
  sources
    .sort((a, b) => a['bitrate_kbps'] - b['bitrate_kbps'])
    .forEach((source) => {
      const sourceEl = createElementWithAttributes(
        videoEl.ownerDocument,
        'source',
        {
          'src': source['url'],
          'type': source['type'],
          'data-bitrate': source['bitrate_kbps'],
        }
      );
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
  const sourceEl = win.document.createElement('source');
  const srcAttr = videoEl.getAttribute('src');
  sourceEl.setAttribute('src', srcAttr);

  const typeAttr = videoEl.getAttribute('type');
  if (typeAttr) {
    sourceEl.setAttribute('type', typeAttr);
  }

  // Remove the src attr so the source children can play.
  videoEl.removeAttribute('src');
  videoEl.removeAttribute('type');

  // Remove all existing sources as they are never supposed to play for a video
  // that has a src, cf https://html.spec.whatwg.org/#concept-media-load-algorithm
  const sourceEls = videoEl.querySelectorAll('source');
  iterateCursor(sourceEls, (el) => removeElement(el));

  videoEl.insertBefore(sourceEl, videoEl.firstChild);
}

/**
 * Lazy loads the amp-cache-url extension if needed and retrieves its service.
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @return {!Promise<../../../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
 */
function getCacheUrlService(videoEl, ampdoc) {
  return Services.extensionsFor(ampdoc.win)
    .installExtensionForDoc(ampdoc, 'amp-cache-url')
    .then(() => Services.cacheUrlServicePromiseForDoc(videoEl));
}
