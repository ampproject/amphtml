import {isArray, isObject} from '#core/types';
import {tryParseJson} from '#core/types/object/json';

import {Services} from '#service';

import {devAssert, userAssert} from '#utils/log';

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
 * @param {!Window} win
 * @param {!MetadataDef} metadata
 * @param {function()=} playHandler
 * @param {function()=} pauseHandler
 */
export function setMediaSession(win, metadata, playHandler, pauseHandler) {
  const {navigator} = win;
  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata(EMPTY_METADATA);

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
  } else if (
    schemaJson['image']['@list'] &&
    typeof schemaJson['image']['@list'][0] === 'string'
  ) {
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
}

/**
 * Parses the og:image if it exists and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */
export function parseOgImage(doc) {
  const metaTag = doc.querySelector('meta[property="og:image"]');
  if (metaTag) {
    return metaTag.getAttribute('content');
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
  const linkTag =
    doc.querySelector('link[rel="shortcut icon"]') ||
    doc.querySelector('link[rel="icon"]');
  if (linkTag) {
    return linkTag.getAttribute('href');
  } else {
    return;
  }
}

/**
 * @param {!Element} element
 * @param {!MetadataDef} metadata
 */
export function validateMediaMetadata(element, metadata) {
  const urlService = Services.urlForDoc(element);
  // Ensure src of artwork has valid protocol
  if (metadata && metadata.artwork) {
    const {artwork} = metadata;
    devAssert(isArray(artwork));
    artwork.forEach((item) => {
      if (item) {
        const src = isObject(item) ? item.src : item;
        userAssert(urlService.isProtocolValid(src));
      }
    });
  }
}
