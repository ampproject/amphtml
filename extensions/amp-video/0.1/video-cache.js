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
import {createElementWithAttributes} from '../../../src/dom';
import {toArray} from '../../../src/types';

/** @private {?boolean} whether the document can use cache url */
let docSupportsCache = null;

/**
 * Add the caching sources to the video if opted in.
 * @param {!AmpVideo} video
 * @return {!Promise}
 */
export function addCacheSources(video) {
  if (!triggerVideoCache(video.win)) {
    return Promise.resolve();
  }
  const servicePromise = Services.cacheUrlServicePromiseForDoc(video.element);
  return servicePromise
    .then((service) =>
      Promise.all([
        service.createCacheUrl(selectVideoSource(video.element)),
        Services.storyRequestServiceForOrNull(video.win),
      ])
    )
    .then((promiseResult) => {
      const requestUrl = promiseResult[0].replace('/c/', '/mbv/');
      return promiseResult[1].executeRequest(requestUrl);
    })
    .then((response) => applySourcesToVideo(video.element, response['sources']))
    .catch(() => {});
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {string}
 */
export function selectVideoSource(videoEl) {
  const possibleSources = toArray(videoEl.querySelectorAll('source[src]'));
  if (videoEl.hasAttribute('src')) {
    possibleSources.push(videoEl);
  }
  for (let i = 0; i < possibleSources.length; i++) {
    if (possibleSources[i].getAttribute('type') === 'video/mp4') {
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
export function applySourcesToVideo(videoEl, sources) {
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
      videoEl.prepend(sourceEl);
    });
}

/**
 * Whether the doc supports cache url
 * @param {!Window} win
 * @return {boolean}
 */
export function triggerVideoCache(win) {
  if (docSupportsCache === null) {
    docSupportsCache = !!win.document.head.querySelector(
      'script[custom-element="amp-cache-url"]'
    );
  }
  return docSupportsCache;
}
