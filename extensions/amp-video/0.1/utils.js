/**
  * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {assertHttpsUrl, isProxyOrigin} from '../../../src/url';
import {elementByTag, childElementsByTag, matches, removeElement} from '../../../src/dom';
import {toArray} from '../../../src/types';
import {Services} from '../../../src/services';
import {VideoEvents} from '../../../src/video-interface';
import {VisibilityState} from '../../../src/visibility-state';
import {findIndex} from '../../../src/utils/array';



export function getVideoSourceForPreconnect(element) {
  let videoSrc = element.getAttribute('src');
  if (!videoSrc) {
    const source = elementByTag(element, 'source');
    if (source) {
      return source.getAttribute('src');
    }
  }
  return videoSrc;
}


export function videoMetadataFor(element) {
  const poster = element.getAttribute('poster');
  const artist = element.getAttribute('artist');
  const title = element.getAttribute('title');
  const album = element.getAttribute('album');
  const artwork = element.getAttribute('artwork');
  return {
    'title': title || '',
    'artist': artist || '',
    'album': album || '',
    'artwork': [
      {'src': artwork || poster || ''},
    ],
  };
}


export function isCachedByCdn(element) {
  return matches(element, '[amp-orig-src]') &&
      isProxyOrigin(element.getAttribute('src'));
}


export function hasAnyCachedSources(element) {
  return isCachedByCdn(element) ||
      toArray(childElementsByTag(element, 'source')).some(isCachedByCdn);
}

/**
 * @param {string} src
 * @param {?string} type
 * @return {!Element} source element
 * @private
 */
export function createSourceElement(doc, src, type) {
  assertHttpsUrl(src, this.element);
  const source = doc.createElement('source');
  source.setAttribute('src', src);
  if (type) {
    source.setAttribute('type', type);
  }
  return source;
}


export function maybePlay(video) {
  const ret = video.play();
  if (ret && ret.catch) {
    ret.catch(() => {
      // Empty catch to prevent useless unhandled promise rejection logging.
      // Play can fail for many reasons such as video getting paused before
      // play() is finished.
      // We use events to know the state of the video and do not care about
      // the success or failure of the play()'s returned promise.
    });
  }
}
