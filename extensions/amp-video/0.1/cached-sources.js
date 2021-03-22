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
import {ampToolboxCacheUrl} from '@ampproject/toolbox-cache-url';
import {createElementWithAttributes} from '../../../src/dom';
import {toArray} from '../../../src/types';

/**
 * Set up google cached videos.
 * @public
 * @param {!AmpVideo} video
 * @return {!Promise}
 */
function resolveGoogleCachedSources(video) {
  if (video.querySelector('source[data-orig-src]')) {
    return Promise.resolve();
  }
  const videoSource = selectVideoSource(video.element);
  return ampToolboxCacheUrl
    .createCacheUrl('cdn.ampproject.org', videoSource)
    .then((cacheUrl) => {
      const requestUrl = cacheUrl.replace('/c', '/mbv');
      return Services.storyRequestServiceForOrNull(video.win).then(
        (requestService) =>
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
      );
    })
    .catch((unusedErr) => {});
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {string}
 */
function selectVideoSource(videoEl) {
  const possibleSources = toArray(videoEl.querySelectorAll('source[src]'));
  if (videoEl.hasAttribute('src')) {
    possibleSources.push(videoEl);
  }
  for (let i = 0; i < possibleSources.length; i++) {
    if (possibleSources[i].getAttribute('type') === 'video/mp4') {
      return possibleSources[i];
    }
  }
  return possibleSources[0];
}
