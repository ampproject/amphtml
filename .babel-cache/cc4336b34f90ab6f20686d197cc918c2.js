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
import { isArray, isObject } from "./core/types";
import { tryParseJson } from "./core/types/object/json";
import { devAssert, userAssert } from "./log";
import { Services } from "./service";

/**
 * @typedef {{
 *   artwork: Array,
 *   title: string,
 *   album: string,
 *   artist: string,
 * }}
 */
export var MetadataDef;

/** @const {MetadataDef} Dummy metadata used to fix a bug */
export var EMPTY_METADATA = {
  'title': '',
  'artist': '',
  'album': '',
  'artwork': [{
    'src': ''
  }]
};

/**
 * Updates the Media Session API's metadata
 * @param {!Window} win
 * @param {!MetadataDef} metadata
 * @param {function()=} playHandler
 * @param {function()=} pauseHandler
 */
export function setMediaSession(win, metadata, playHandler, pauseHandler) {
  var navigator = win.navigator;

  if ('mediaSession' in navigator && win.MediaMetadata) {
    // Clear mediaSession (required to fix a bug when switching between two
    // videos)
    navigator.mediaSession.metadata = new win.MediaMetadata(EMPTY_METADATA);
    navigator.mediaSession.metadata = new win.MediaMetadata(metadata);
    navigator.mediaSession.setActionHandler('play', playHandler);
    navigator.mediaSession.setActionHandler('pause', pauseHandler);
  }
}

/**
 * Parses the schema.org json-ld formatted meta-data, looks for the page's
 * featured image and returns it
 * @param {!Document} doc
 * @return {string|undefined}
 */
export function parseSchemaImage(doc) {
  var schema = doc.querySelector('script[type="application/ld+json"]');

  if (!schema) {
    // No schema element found
    return;
  }

  var schemaJson = tryParseJson(schema.textContent);

  if (!schemaJson || !schemaJson['image']) {
    // No image found in the schema
    return;
  }

  // Image definition in schema could be one of :
  if (typeof schemaJson['image'] === 'string') {
    // 1. "image": "http://..",
    return schemaJson['image'];
  } else if (schemaJson['image']['@list'] && typeof schemaJson['image']['@list'][0] === 'string') {
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
  var metaTag = doc.querySelector('meta[property="og:image"]');

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
  var linkTag = doc.querySelector('link[rel="shortcut icon"]') || doc.querySelector('link[rel="icon"]');

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
  var urlService = Services.urlForDoc(element);

  // Ensure src of artwork has valid protocol
  if (metadata && metadata.artwork) {
    var artwork = metadata.artwork;
    devAssert(isArray(artwork));
    artwork.forEach(function (item) {
      if (item) {
        var src = isObject(item) ? item.src : item;
        userAssert(urlService.isProtocolValid(src));
      }
    });
  }
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm1lZGlhc2Vzc2lvbi1oZWxwZXIuanMiXSwibmFtZXMiOlsiaXNBcnJheSIsImlzT2JqZWN0IiwidHJ5UGFyc2VKc29uIiwiZGV2QXNzZXJ0IiwidXNlckFzc2VydCIsIlNlcnZpY2VzIiwiTWV0YWRhdGFEZWYiLCJFTVBUWV9NRVRBREFUQSIsInNldE1lZGlhU2Vzc2lvbiIsIndpbiIsIm1ldGFkYXRhIiwicGxheUhhbmRsZXIiLCJwYXVzZUhhbmRsZXIiLCJuYXZpZ2F0b3IiLCJNZWRpYU1ldGFkYXRhIiwibWVkaWFTZXNzaW9uIiwic2V0QWN0aW9uSGFuZGxlciIsInBhcnNlU2NoZW1hSW1hZ2UiLCJkb2MiLCJzY2hlbWEiLCJxdWVyeVNlbGVjdG9yIiwic2NoZW1hSnNvbiIsInRleHRDb250ZW50IiwicGFyc2VPZ0ltYWdlIiwibWV0YVRhZyIsImdldEF0dHJpYnV0ZSIsInBhcnNlRmF2aWNvbiIsImxpbmtUYWciLCJ2YWxpZGF0ZU1lZGlhTWV0YWRhdGEiLCJlbGVtZW50IiwidXJsU2VydmljZSIsInVybEZvckRvYyIsImFydHdvcmsiLCJmb3JFYWNoIiwiaXRlbSIsInNyYyIsImlzUHJvdG9jb2xWYWxpZCJdLCJtYXBwaW5ncyI6IkFBQUE7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EsU0FBUUEsT0FBUixFQUFpQkMsUUFBakI7QUFDQSxTQUFRQyxZQUFSO0FBQ0EsU0FBUUMsU0FBUixFQUFtQkMsVUFBbkI7QUFDQSxTQUFRQyxRQUFSOztBQUVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLElBQUlDLFdBQUo7O0FBRVA7QUFDQSxPQUFPLElBQU1DLGNBQWMsR0FBRztBQUM1QixXQUFTLEVBRG1CO0FBRTVCLFlBQVUsRUFGa0I7QUFHNUIsV0FBUyxFQUhtQjtBQUk1QixhQUFXLENBQUM7QUFBQyxXQUFPO0FBQVIsR0FBRDtB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LENBQUNFLGFBQUosQ0FBa0Isa0JBQWxCLENBRkY7O0FBR0EsTUFBSU8sT0FBSixFQUFhO0FBQ1gsV0FBT0EsT0FBTyxDQUFDRixZQUFSLENBQXFCLE1BQXJCLENBQVA7QUFDRCxHQUZELE1BRU87QUFDTDtBQUNEO0FBQ0Y7O0FBRUQ7QUFDQTtBQUNBO0FBQ0E7QUFDQSxPQUFPLFNBQVNHLHFCQUFULENBQStCQyxPQUEvQixFQUF3Q25CLFFBQXhDLEVBQWtEO0FBQ3ZELE1BQU1vQixVQUFVLEdBQUd6QixRQUFRLENBQUMwQixTQUFULENBQW1CRixPQUFuQixDQUFuQjs7QUFDQTtBQUNBLE1BQUluQixRQUFRLElBQUlBLFFBQVEsQ0FBQ3NCLE9BQXpCLEVBQWtDO0FBQ2hDLFFBQU9BLE9BQVAsR0FBa0J0QixRQUFsQixDQUFPc0IsT0FBUDtBQUNBN0IsSUFBQUEsU0FBUyxDQUFDSCxPQUFPLENBQUNnQyxPQUFELENBQVIsQ0FBVDtBQUNBQSxJQUFBQSxPQUFPLENBQUNDLE9BQVIsQ0FBZ0IsVUFBQ0MsSUFBRCxFQUFVO0FBQ3hCLFVBQUlBLElBQUosRUFBVTtBQUNSLFlBQU1DLEdBQUcsR0FBR2xDLFFBQVEsQ0FBQ2lDLElBQUQsQ0FBUixHQUFpQkEsSUFBSSxDQUFDQyxHQUF0QixHQUE0QkQsSUFBeEM7QUFDQTlCLFFBQUFBLFVBQVUsQ0FBQzBCLFVBQVUsQ0FBQ00sZUFBWCxDQUEyQkQsR0FBM0IsQ0FBRCxDQUFWO0FBQ0Q7QUFDRixLQUxEO0FBTUQ7QUFDRiIsInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29weXJpZ2h0IDIwMTcgVGhlIEFNUCBIVE1MIEF1dGhvcnMuIEFsbCBSaWdodHMgUmVzZXJ2ZWQuXG4gKlxuICogTGljZW5zZWQgdW5kZXIgdGhlIEFwYWNoZSBMaWNlbnNlLCBWZXJzaW9uIDIuMCAodGhlIFwiTGljZW5zZVwiKTtcbiAqIHlvdSBtYXkgbm90IHVzZSB0aGlzIGZpbGUgZXhjZXB0IGluIGNvbXBsaWFuY2Ugd2l0aCB0aGUgTGljZW5zZS5cbiAqIFlvdSBtYXkgb2J0YWluIGEgY29weSBvZiB0aGUgTGljZW5zZSBhdFxuICpcbiAqICAgICAgaHR0cDovL3d3dy5hcGFjaGUub3JnL2xpY2Vuc2VzL0xJQ0VOU0UtMi4wXG4gKlxuICogVW5sZXNzIHJlcXVpcmVkIGJ5IGFwcGxpY2FibGUgbGF3IG9yIGFncmVlZCB0byBpbiB3cml0aW5nLCBzb2Z0d2FyZVxuICogZGlzdHJpYnV0ZWQgdW5kZXIgdGhlIExpY2Vuc2UgaXMgZGlzdHJpYnV0ZWQgb24gYW4gXCJBUy1JU1wiIEJBU0lTLFxuICogV0lUSE9VVCBXQVJSQU5USUVTIE9SIENPTkRJVElPTlMgT0YgQU5ZIEtJTkQsIGVpdGhlciBleHByZXNzIG9yIGltcGxpZWQuXG4gKiBTZWUgdGhlIExpY2Vuc2UgZm9yIHRoZSBzcGVjaWZpYyBsYW5ndWFnZSBnb3Zlcm5pbmcgcGVybWlzc2lvbnMgYW5kXG4gKiBsaW1pdGF0aW9ucyB1bmRlciB0aGUgTGljZW5zZS5cbiAqL1xuaW1wb3J0IHtpc0FycmF5LCBpc09iamVjdH0gZnJvbSAnLi9jb3JlL3R5cGVzJztcbmltcG9ydCB7dHJ5UGFyc2VKc29ufSBmcm9tICcuL2NvcmUvdHlwZXMvb2JqZWN0L2pzb24nO1xuaW1wb3J0IHtkZXZBc3NlcnQsIHVzZXJBc3NlcnR9IGZyb20gJy4vbG9nJztcbmltcG9ydCB7U2VydmljZXN9IGZyb20gJy4vc2VydmljZSc7XG5cbi8qKlxuICogQHR5cGVkZWYge3tcbiAqICAgYXJ0d29yazogQXJyYXksXG4gKiAgIHRpdGxlOiBzdHJpbmcsXG4gKiAgIGFsYnVtOiBzdHJpbmcsXG4gKiAgIGFydGlzdDogc3RyaW5nLFxuICogfX1cbiAqL1xuZXhwb3J0IGxldCBNZXRhZGF0YURlZjtcblxuLyoqIEBjb25zdCB7TWV0YWRhdGFEZWZ9IER1bW15IG1ldGFkYXRhIHVzZWQgdG8gZml4IGEgYnVnICovXG5leHBvcnQgY29uc3QgRU1QVFlfTUVUQURBVEEgPSB7XG4gICd0aXRsZSc6ICcnLFxuICAnYXJ0aXN0JzogJycsXG4gICdhbGJ1bSc6ICcnLFxuICAnYXJ0d29yayc6IFt7J3NyYyc6ICcnfV0sXG59O1xuXG4vKipcbiAqIFVwZGF0ZXMgdGhlIE1lZGlhIFNlc3Npb24gQVBJJ3MgbWV0YWRhdGFcbiAqIEBwYXJhbSB7IVdpbmRvd30gd2luXG4gKiBAcGFyYW0geyFNZXRhZGF0YURlZn0gbWV0YWRhdGFcbiAqIEBwYXJhbSB7ZnVuY3Rpb24oKT19IHBsYXlIYW5kbGVyXG4gKiBAcGFyYW0ge2Z1bmN0aW9uKCk9fSBwYXVzZUhhbmRsZXJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldE1lZGlhU2Vzc2lvbih3aW4sIG1ldGFkYXRhLCBwbGF5SGFuZGxlciwgcGF1c2VIYW5kbGVyKSB7XG4gIGNvbnN0IHtuYXZpZ2F0b3J9ID0gd2luO1xuICBpZiAoJ21lZGlhU2Vzc2lvbicgaW4gbmF2aWdhdG9yICYmIHdpbi5NZWRpYU1ldGFkYXRhKSB7XG4gICAgLy8gQ2xlYXIgbWVkaWFTZXNzaW9uIChyZXF1aXJlZCB0byBmaXggYSBidWcgd2hlbiBzd2l0Y2hpbmcgYmV0d2VlbiB0d29cbiAgICAvLyB2aWRlb3MpXG4gICAgbmF2aWdhdG9yLm1lZGlhU2Vzc2lvbi5tZXRhZGF0YSA9IG5ldyB3aW4uTWVkaWFNZXRhZGF0YShFTVBUWV9NRVRBREFUQSk7XG5cbiAgICBuYXZpZ2F0b3IubWVkaWFTZXNzaW9uLm1ldGFkYXRhID0gbmV3IHdpbi5NZWRpYU1ldGFkYXRhKG1ldGFkYXRhKTtcblxuICAgIG5hdmlnYXRvci5tZWRpYVNlc3Npb24uc2V0QWN0aW9uSGFuZGxlcigncGxheScsIHBsYXlIYW5kbGVyKTtcbiAgICBuYXZpZ2F0b3IubWVkaWFTZXNzaW9uLnNldEFjdGlvbkhhbmRsZXIoJ3BhdXNlJywgcGF1c2VIYW5kbGVyKTtcblxuICAgIC8vIFRPRE8oQHdhc3NnaGEpIEltcGxlbWVudCBzZWVrICYgbmV4dC9wcmV2aW91c1xuICB9XG59XG5cbi8qKlxuICogUGFyc2VzIHRoZSBzY2hlbWEub3JnIGpzb24tbGQgZm9ybWF0dGVkIG1ldGEtZGF0YSwgbG9va3MgZm9yIHRoZSBwYWdlJ3NcbiAqIGZlYXR1cmVkIGltYWdlIGFuZCByZXR1cm5zIGl0XG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtzdHJpbmd8dW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VTY2hlbWFJbWFnZShkb2MpIHtcbiAgY29uc3Qgc2NoZW1hID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJ3NjcmlwdFt0eXBlPVwiYXBwbGljYXRpb24vbGQranNvblwiXScpO1xuICBpZiAoIXNjaGVtYSkge1xuICAgIC8vIE5vIHNjaGVtYSBlbGVtZW50IGZvdW5kXG4gICAgcmV0dXJuO1xuICB9XG4gIGNvbnN0IHNjaGVtYUpzb24gPSB0cnlQYXJzZUpzb24oc2NoZW1hLnRleHRDb250ZW50KTtcbiAgaWYgKCFzY2hlbWFKc29uIHx8ICFzY2hlbWFKc29uWydpbWFnZSddKSB7XG4gICAgLy8gTm8gaW1hZ2UgZm91bmQgaW4gdGhlIHNjaGVtYVxuICAgIHJldHVybjtcbiAgfVxuXG4gIC8vIEltYWdlIGRlZmluaXRpb24gaW4gc2NoZW1hIGNvdWxkIGJlIG9uZSBvZiA6XG4gIGlmICh0eXBlb2Ygc2NoZW1hSnNvblsnaW1hZ2UnXSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyAxLiBcImltYWdlXCI6IFwiaHR0cDovLy4uXCIsXG4gICAgcmV0dXJuIHNjaGVtYUpzb25bJ2ltYWdlJ107XG4gIH0gZWxzZSBpZiAoXG4gICAgc2NoZW1hSnNvblsnaW1hZ2UnXVsnQGxpc3QnXSAmJlxuICAgIHR5cGVvZiBzY2hlbWFKc29uWydpbWFnZSddWydAbGlzdCddWzBdID09PSAnc3RyaW5nJ1xuICApIHtcbiAgICAvLyAyLiBcImltYWdlXCI6IHsuLiwgXCJAbGlzdFwiOiBbXCJodHRwOi8vLi5cIl0sIC4ufVxuICAgIHJldHVybiBzY2hlbWFKc29uWydpbWFnZSddWydAbGlzdCddWzBdO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzY2hlbWFKc29uWydpbWFnZSddWyd1cmwnXSA9PT0gJ3N0cmluZycpIHtcbiAgICAvLyAzLiBcImltYWdlXCI6IHsuLiwgXCJ1cmxcIjogXCJodHRwOi8vLi5cIiwgLi59XG4gICAgcmV0dXJuIHNjaGVtYUpzb25bJ2ltYWdlJ11bJ3VybCddO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBzY2hlbWFKc29uWydpbWFnZSddWzBdID09PSAnc3RyaW5nJykge1xuICAgIC8vIDQuIFwiaW1hZ2VcIjogW1wiaHR0cDovLy4uIFwiXVxuICAgIHJldHVybiBzY2hlbWFKc29uWydpbWFnZSddWzBdO1xuICB9IGVsc2Uge1xuICAgIHJldHVybjtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgb2c6aW1hZ2UgaWYgaXQgZXhpc3RzIGFuZCByZXR1cm5zIGl0XG4gKiBAcGFyYW0geyFEb2N1bWVudH0gZG9jXG4gKiBAcmV0dXJuIHtzdHJpbmd8dW5kZWZpbmVkfVxuICovXG5leHBvcnQgZnVuY3Rpb24gcGFyc2VPZ0ltYWdlKGRvYykge1xuICBjb25zdCBtZXRhVGFnID0gZG9jLnF1ZXJ5U2VsZWN0b3IoJ21ldGFbcHJvcGVydHk9XCJvZzppbWFnZVwiXScpO1xuICBpZiAobWV0YVRhZykge1xuICAgIHJldHVybiBtZXRhVGFnLmdldEF0dHJpYnV0ZSgnY29udGVudCcpO1xuICB9IGVsc2Uge1xuICAgIHJldHVybjtcbiAgfVxufVxuXG4vKipcbiAqIFBhcnNlcyB0aGUgd2Vic2l0ZSdzIEZhdmljb24gYW5kIHJldHVybnMgaXRcbiAqIEBwYXJhbSB7IURvY3VtZW50fSBkb2NcbiAqIEByZXR1cm4ge3N0cmluZ3x1bmRlZmluZWR9XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBwYXJzZUZhdmljb24oZG9jKSB7XG4gIGNvbnN0IGxpbmtUYWcgPVxuICAgIGRvYy5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1cInNob3J0Y3V0IGljb25cIl0nKSB8fFxuICAgIGRvYy5xdWVyeVNlbGVjdG9yKCdsaW5rW3JlbD1cImljb25cIl0nKTtcbiAgaWYgKGxpbmtUYWcpIHtcbiAgICByZXR1cm4gbGlua1RhZy5nZXRBdHRyaWJ1dGUoJ2hyZWYnKTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm47XG4gIH1cbn1cblxuLyoqXG4gKiBAcGFyYW0geyFFbGVtZW50fSBlbGVtZW50XG4gKiBAcGFyYW0geyFNZXRhZGF0YURlZn0gbWV0YWRhdGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHZhbGlkYXRlTWVkaWFNZXRhZGF0YShlbGVtZW50LCBtZXRhZGF0YSkge1xuICBjb25zdCB1cmxTZXJ2aWNlID0gU2VydmljZXMudXJsRm9yRG9jKGVsZW1lbnQpO1xuICAvLyBFbnN1cmUgc3JjIG9mIGFydHdvcmsgaGFzIHZhbGlkIHByb3RvY29sXG4gIGlmIChtZXRhZGF0YSAmJiBtZXRhZGF0YS5hcnR3b3JrKSB7XG4gICAgY29uc3Qge2FydHdvcmt9ID0gbWV0YWRhdGE7XG4gICAgZGV2QXNzZXJ0KGlzQXJyYXkoYXJ0d29yaykpO1xuICAgIGFydHdvcmsuZm9yRWFjaCgoaXRlbSkgPT4ge1xuICAgICAgaWYgKGl0ZW0pIHtcbiAgICAgICAgY29uc3Qgc3JjID0gaXNPYmplY3QoaXRlbSkgPyBpdGVtLnNyYyA6IGl0ZW07XG4gICAgICAgIHVzZXJBc3NlcnQodXJsU2VydmljZS5pc1Byb3RvY29sVmFsaWQoc3JjKSk7XG4gICAgICB9XG4gICAgfSk7XG4gIH1cbn1cbiJdfQ==
// /Users/mszylkowski/src/amphtml/src/mediasession-helper.js