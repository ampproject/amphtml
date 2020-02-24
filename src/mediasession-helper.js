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
import {Services} from './services';
import {devAssert, userAssert} from './log';
import {isArray, isObject} from './types';

/**
 * @typedef {{
 *   artwork: Array,
 *   title: string,
 *   album: string,
 *   artist: string,
 * }}
 */
export let MetadataDef;

/** @const {MetadataDef} Dummy metadata used to fix a bug */
export const EMPTY_METADATA = {
  'title': '',
  'artist': '',
  'album': '',
  'artwork': [{'src': ''}],
};

/**
 * Updates the Media Session API's metadata
 * @param {!Element} element
 * @param {!Window} win
 * @param {!MetadataDef} metadata
 * @param {function()=} playHandler
 * @param {function()=} pauseHandler
 */
export function setMediaSession(
  element,
  win,
  metadata,
  playHandler,
  pauseHandler
) {
  const {navigator} = win;
  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata(EMPTY_METADATA);

    // Add metadata
    validateMetadata(element, metadata);
    navigator.mediaSession.metadata = new win.MediaMetadata(metadata);

    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler);

    // TODO(@wassgha) Implement seek & next/previous
  }
}

/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */
export function parseSchemaImage(doc) {
  const {jsonLd: schemaJson} = Services.documentInfoForDoc(doc.documentElement);
  if (!schemaJson || !schemaJson['image']) {
    // No schema or image found
    return;
  }

  // Image definition in schema could be one of :
  if (typeof schemaJson['image'] === 'string') {
    // 1. "image": "http://..",
    return /** @type {string} */ (schemaJson['image']);
  } else if (
    schemaJson['image']['@list'] &&
    typeof schemaJson['image']['@list'][0] === 'string'
  ) {
    // 2. "image": {.., "@list": ["http://.."], ..}
    return /** @type {string} */ (schemaJson['image']['@list'][0]);
  } else if (typeof schemaJson['image']['url'] === 'string') {
    // 3. "image": {.., "url": "http://..", ..}
    return schemaJson['image']['url'];
  } else if (typeof schemaJson['image'][0] === 'string') {
    // 4. "image": ["http://.. "]
    return /** @type {string} */ (schemaJson['image'][0]);
  } else {
    return;
  }
}

/**
 * Parses the og:image if it exists and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */
export function parseOgImage(doc) {
  const {metaTags} = Services.documentInfoForDoc(doc.documentElement);
  if (
    metaTags &&
    metaTags['og:image'] &&
    typeof metaTags['og:image'] === 'string'
  ) {
    return /** @type {string} */ (metaTags['og:image']);
  } else {
    return;
  }
}

/**
 * Parses the website's Favicon and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */
export function parseFavicon(doc) {
  const {linkRels} = Services.documentInfoForDoc(doc.documentElement);
  if (linkRels && linkRels['icon'] && typeof linkRels['icon'] === 'string') {
    return /** @type {string} */ (linkRels['icon']);
  } else {
    return;
  }
}

/**
 * @param {!Element} element
 * @param {!MetadataDef} metadata
 * @private
 */
function validateMetadata(element, metadata) {
  const urlService = Services.urlForDoc(element);
  // Ensure src of artwork has valid protocol
  if (metadata && metadata.artwork) {
    const {artwork} = metadata;
    devAssert(isArray(artwork));
    artwork.forEach(item => {
      if (item) {
        const src = isObject(item) ? item.src : item;
        userAssert(urlService.isProtocolValid(src));
      }
    });
  }
}
