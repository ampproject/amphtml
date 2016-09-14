/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../../third_party/babel/custom-babel-helpers';
import {urls} from '../config';
import {endsWith, startsWith} from '../string';

/**
 * The SW's current version.
 * @const
 */
const VERSION = '$internalRuntimeVersion$';

/** @const */
const TAG = 'cache-service-worker';

/**
 * A list of blacklisted AMP versions that must never be served from
 * cache. Versions may be blacklisted if they contain a significant
 * implementation bug.
 */
const BLACKLIST = (self.AMP_CONFIG &&
    self.AMP_CONFIG[`${TAG}-blacklist`]) || [];

/**
 * Returns the version of a given versioned JS file.
 *
 * @param {string} url
 * @return {string}
 */
function ampVersion(url) {
  // RTVs are 2 digit prefixes followed by the timestamp of the release.
  const matches = /rtv\/(\d{2}\d{13,})/.exec(url);
  return matches ? matches[1] : VERSION;
}

/**
 * Returns the basename (AKA the filename) of a url, used to key a url (since
 * our JS filenames are unique).
 *
 * @param {string} url
 * @return {string}
 */
function basename(url) {
  return url.substr(url.lastIndexOf('/') + 1);
}

/**
 * Returns the url with the requested version changed to `version`.
 *
 * @param {string} url
 * @param {string} version
 * @return {string}
 */
function versionedUrl(url, version) {
  // Ensure we do not replace the prefix.
  return url.replace(ampVersion(url), version);
}

/**
 * Determines if a url is a request to a CDN JS file.
 * @param {string} url
 * @return {boolean}
 */
function isCdnJsFile(url) {
  return endsWith(url, '.js') && (
    startsWith(url, `${urls.cdn}/rtv`) ||
    startsWith(url, `${urls.cdn}/v0`)
  );
}

/**
 * Determines if a AMP version is blacklisted.
 * @param {string} version
 * @return {boolean}
 */
function isBlacklisted(version) {
  // Trim the RTV perfix.
  version = version.substr(2);
  return BLACKLIST.indexOf(version) > -1;
}

/**
 * A mapping from a Client's (unique per tab _and_ refresh) ID to the AMP
 * release version we are serving it.
 *
 * @type {!Object<string, string>}
 */
const clientsMap = Object.create(null);

/**
 * Our cache of CDN JS files.
 *
 * @type {Cache}
 */
let cache;

/**
 * A promise to open up our CDN JS cache, which will be resolved before any
 * requests are intercepted by the SW.
 *
 * @type {!Promise}
 */
const cachePromise = caches.open('cdn-js').then(result => {
  cache = result;
});

/**
 * Fetches the request, and stores it in the cache. Since we only store one
 * version of each file, we'll prune all older versions after we cache this.
 *
 * @param {!Cache} cache
 * @param {!Request} request
 * @param {string} requestFile the basename of the request
 * @param {string} requestVersion the version of the request
 * @return {!Promise<!Response>}
 */
function fetchAndCache(cache, request, requestFile, requestVersion) {
  // TODO(jridgewell): we should also fetch this requestVersion for all files
  // we know about.

  return fetch(request).then(response => {
    // Did we receive a valid response (200 <= status < 300)?
    if (response && response.ok) {
      // You must clone to prevent double reading the body.
      cache.put(request, response.clone());

      // Prune old versions of this file from the cache.
      // This intentionally does not block the request resolution to speed
      // things up. This is likely fine since you don't have multiple
      // `<script>`s with the same `src` on a page.
      cache.keys().then(requests => {
        for (let i = 0; i < requests.length; i++) {
          const request = requests[i];
          const url = request.url;
          if (requestFile !== basename(url)) {
            continue;
          }
          if (requestVersion === ampVersion(url)) {
            continue;
          }

          cache.delete(request);
        }
      });
    }

    return response;
  });
}


/**
 * Gets the version we have cached for this file. It's either:
 *  - The requestVersion, meaning we have this explicit version cached.
 *  - Some older version
 *  - An empty string, meaning we have nothing cached for this file.
 *
 * @param {!Cache} cache
 * @param {string} requestFile
 * @return {!Promise<string>}
 */
function getCachedVersion(cache, requestFile) {
  return cache.keys().then(requests => {
    for (let i = 0; i < requests.length; i++) {
      const url = requests[i].url;
      if (requestFile === basename(url)) {
        return ampVersion(url);
      }
    }

    return '';
  });
}

self.addEventListener('install', install => {
  install.waitUntil(cachePromise);
  if (install.registerForeignFetch) {
    install.registerForeignFetch({
      scopes: [self.registration.scope],
      origins: ['*'],
    });
  }
});

/**
 * Handles fetching the request from Cache, or fetching and caching from the
 * Cache CDN, if we care about the request.
 * My assumptions:
 *   - Doc requests one uniform AMP release version for all files, anything
 *     else is malarkey.
 *   - The requested version is always the newest AMP version.
 *
 * @param {!Request} request
 * @param {string|undefined} clientId
 * @return {?Promise<!Response>}
 */
function handleFetch(request, clientId) {
  const url = request.url;

  // We only cache CDN JS files, and we need a clientId to do our magic.
  if (!clientId || !isCdnJsFile(url)) {
    return;
  }

  const requestFile = basename(url);
  const requestVersion = ampVersion(url);

  // Wait for the cachePromise to resolve. This is necessary
  // since the SW thread may be killed and restarted at any time.
  return cachePromise.then(() => {
    // If we already registered this client, we must always use the same
    // version.
    if (clientsMap[clientId]) {
      return clientsMap[clientId];
    }

    // If not, do we have this version cached?
    return getCachedVersion(cache, requestFile).then(version => {
      // We have a cached version! Serve it up!
      if (version && !isBlacklisted(version)) {
        return version;
      }

      // Tears! We have nothing cached, so we'll have to make a request.
      return requestVersion;
    }).then(version => {
      // Determining the version to serve is racey, since there are parallel
      // requests coming in for all the CDN JS files. If one of them "won"
      // the race, respect the winner.
      if (clientsMap[clientId]) {
        return clientsMap[clientId];
      }

      clientsMap[clientId] = version;
      return version;
    });
  }).then(version => {
    const versionedRequest = version === requestVersion ?
        request :
        new Request(versionedUrl(url, version), request);

    return cache.match(versionedRequest).then(response => {
      // Cache hit!
      if (response) {
        // Now, was it because we served an old cached version or because
        // they requested this exact version; If we served an old version,
        // let's get the new one.
        if (version !== requestVersion && endsWith(requestVersion, VERSION)) {
          fetchAndCache(cache, request, requestFile, requestVersion);
        }

        return response;
      }

      // If not, let's fetch and cache the request.
      return fetchAndCache(cache, versionedRequest, requestFile, version);
    });
  });
}

// Setup the Fetch listener, for when the client is on the CDN origin.
self.addEventListener('fetch', event => {
  const response = handleFetch(event.request, event.clientId);

  // We only get a response promise back if it's a request we care to cache.
  if (!response) {
    return;
  }

  event.respondWith(response);
});

// Setup the Foreign Fetch listener, for when the client is on a Publisher
// origin.
self.addEventListener('foreignfetch', event => {
  const response = handleFetch(event.request, event.clientId);

  // We only get a response promise back if it's a request we care to cache.
  if (!response) {
    return;
  }

  event.respondWith(response.then(response => {
    // Foreign Fetch requires an { response: !Response } object.
    return {
      response,
      // This allows CORS requests, if one were to come in.
      origin: event.origin,
    };
  }));
});
