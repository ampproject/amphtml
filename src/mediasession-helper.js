/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {tryParseJson} from './json';

/**
 * Updates the Media Session API's metadata
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @param {!./video-interface.VideoMetaDef} metaData
 * @param {function} playHandler
 * @param {function} pauseHandler
 */
export function setMediaSession(ampdoc,
                                metaData,
                                playHandler = null,
                                pauseHandler = null) {
  const win = ampdoc.win;
  const navigator = win.navigator;
  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata({
      title: '',
      artist: '',
      album: '',
      artwork: [
        { src: ''},
      ]
    });
    // Add metaData
    navigator.mediaSession.metadata = new win.MediaMetadata(metaData);

    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler);

    // TODO(@wassgha) Implement seek & next/previous
  }
}


/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseSchemaImage(ampdoc) {
  const doc = ampdoc.win.document;
  const schema = doc.querySelector('script[type="application/ld+json"]');
  if (!schema) {
    // No schema element found
    return undefined;
  }
  const schemaJson = tryParseJson(schema.textContent);
  if (!schemaJson || !schemaJson.image) {
    // No image found in the schema
    return undefined;
  }

  // Image definition in schema could be one of :
  if (schemaJson.image['@list']
      && schemaJson.image['@list'][0]
      && typeof schemaJson.image['@list'][0] === 'string') {
    // 1. "image": {.., "@list": ["http://.."], ..}
    return schemaJson.image['@list'][0];
  } else if (schemaJson.image['url']
      && typeof schemaJson.image['url'] === 'string') {
    // 2. "image": {.., "url": "http://..", ..}
    return schemaJson.image['url'];
  } else if (schemaJson.image[0]
      && typeof schemaJson.image[0] === 'string') {
    // 3. "image": ["http://.. "]
    return schemaJson.image[0];
  } else if (typeof schemaJson.image === 'string') {
    // 4. "image": "http://..",
    return schemaJson.image;
  } else {
    return undefined;
  }
};

/**
 * Parses the og:image if it exists and returns it
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseOgImage(ampdoc) {
  const doc = ampdoc.win.document;
  const metaTag = doc.querySelector('meta[property="og:image"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  } else {
    return undefined;
  }
};

/**
 * Parses the website's Favicon and returns it
 * @param {!./ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseFavicon(ampdoc) {
  const doc = ampdoc.win.document;
  const linkTag = doc.querySelector('link[rel="shortcut icon"]')
                  || doc.querySelector('link[rel="icon"]');
  if (linkTag) {
    return linkTag.getAttribute('href');
  } else {
    return undefined;
  }
}
