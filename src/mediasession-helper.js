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

/** @const {./video-interface.VideoMetaDef} Dummy metadata used to fix a bug */
export const EMPTY_METADATA = {
  'title': '',
  'artist': '',
  'album': '',
  'artwork': [
    {'src': ''},
  ],
};

/**
 * Updates the Media Session API's metadata
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @param {!./video-interface.VideoMetaDef} metadata
 * @param {function()=} playHandler
 * @param {function()=} pauseHandler
 */
export function setMediaSession(ampdoc,
                                metadata,
                                playHandler,
                                pauseHandler) {
  const win = ampdoc.win;
  const navigator = win.navigator;
  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata(EMPTY_METADATA);
    // Add metadata
    navigator.mediaSession.metadata = new win.MediaMetadata(metadata);

    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler);

    // TODO(@wassgha) Implement seek & next/previous
  }
}


/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseSchemaImage(ampdoc) {
  const doc = ampdoc.win.document;
  const schema = doc.querySelector('script[type="application/ld+json"]');
  if (!schema) {
    // No schema element found
    return;
  }
  const schemaJson = tryParseJson(schema.textContent);
  if (!schemaJson || !schemaJson['image']) {
    // No image found in the schema
    return;
  }

  // Image definition in schema could be one of :
  if (typeof schemaJson['image'] === 'string') {
    // 1. "image": "http://..",
    return schemaJson['image'];
  } else if (schemaJson['image']['@list']
      && typeof schemaJson['image']['@list'][0] === 'string') {
    // 2. "image": {.., "@list": ["http://.."], ..}
    return schemaJson['image']['@list'][0];
  } else if (typeof schemaJson['image']['url'] === 'string') {
    // 3. "image": {.., "url": "http://..", ..}
    return schemaJson['image']['url'];
  } else if (typeof schemaJson['image'][0] === 'string') {
    // 4. "image": ["http://.. "]
    return schemaJson['image'][0];
  } else {
    return;
  }
};

/**
 * Parses the og:image if it exists and returns it
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseOgImage(ampdoc) {
  const doc = ampdoc.win.document;
  const metaTag = doc.querySelector('meta[property="og:image"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
  } else {
    return;
  }
};

/**
 * Parses the website's Favicon and returns it
 * @param {!./service/ampdoc-impl.AmpDoc} ampdoc
 * @return {string|undefined}
 */
export function parseFavicon(ampdoc) {
  const doc = ampdoc.win.document;
  const linkTag = doc.querySelector('link[rel="shortcut icon"]')
                  || doc.querySelector('link[rel="icon"]');
  if (linkTag) {
    return linkTag.getAttribute('href');
  } else {
    return;
  }
}
