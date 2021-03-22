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

/**
 * @param {!AmpVideo} video
 * @return {?Promise}
 */
export function resolveCachedSources(video) {
  if (video.querySelector('source[data-orig-src]')) {
    return Promise.resolve();
  }
  if (video.element.getAttribute('cache') === 'google') {
    return fetchGoogleCachedVideos(video);
  }
  return Promise.resolve();
}

/**
 * Set up google cached videos.
 * @param {!AmpVideo} video
 * @return {!Promise}
 */
function fetchGoogleCachedVideos(video) {
  const requestUrl = selectVideoSource(video.element);
  return Services.storyRequestServiceForOrNull(video.win)
    .then((requestService) =>
      requestService.executeRequest(requestUrl).then((response) => {
        response['sources']
          .sort((a, b) => a['bitrate_kbps'] - b['bitrate_kbps'])
          .forEach((source) => {
            const sourceEl = createElementWithAttributes(
              video.element.ownerDocument,
              'source',
              {
                'src': source['url'],
                'type': source['type'],
                'data-bitrate': source['bitrate_kbps'],
              }
            );
            video.element.prepend(sourceEl);
          });
      })
    )
    .catch((unusedErr) => {});
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {string}
 */
function selectVideoSource(videoEl) {
  const possibleSources = [];
  toArray(videoEl.querySelectorAll('source[src]')).forEach((sourceEl) => {
    possibleSources.push({
      src: sourceEl.getAttribute('src'),
      bitrate: parseFloat(sourceEl.getAttribute('data-bitrate')),
    });
  });
  if (videoEl.hasAttribute('src')) {
    possibleSources.push({
      src: videoEl.getAttribute('src'),
      bitrate: null,
    });
  }
  const prioritizedSource = possibleSources.reduce((a, b) =>
    !b.bitrate || (a.bitrate && a.bitrate >= b.bitrate) ? a : b
  );
  return convertToCDN(videoEl, prioritizedSource.src);
}

/**
 * Follows https://developers.google.com/amp/cache/overview to construct the URL in the CDN
 * @param {!Element} videoEl
 * @param {string} src
 * @return {string}
 */
function convertToCDN(videoEl, src) {
  const urlService = Services.urlForDoc(videoEl);
  const mbvUrl = urlService.getCdnUrlOnOrigin(src, 'mvb');
  const originUrl = urlService.getSourceOrigin(src);
  const cdnOrigin =
    'https://' +
    originUrl
      .replace(/\.|-/, (str) => (str === '.' ? '-' : '--'))
      .replace(/https?:\/\//, '') +
    '.';

  return mbvUrl.replace('https://', cdnOrigin);
}
