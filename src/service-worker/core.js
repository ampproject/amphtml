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
import urls from '../config';
import indexedDBP from '../../third_party/indexed-db-as-promised/index';

/**
 * The SW's current version.
 * @const
 */
const VERSION = '$internalRuntimeVersion$';

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
  return url.endsWith('.js') && (
    url.startsWith(`${urls.cdn}/rtv`) ||
    url.startsWith(`${urls.cdn}/v0`)
  );
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
 * A (wrapped) IndexedDB Database, where we record which versions of a file
 * have been cached. Used to determine if we have another version of the same
 * file cached when we miss.
 *
 * @type {../../third_party/indexed-db-as-promised/classes/database.Database}
 */
let db;

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
 * A promise to open up our Indexed DB database, which will be resolved before
 * any requests are intercepted by the SW.
 *
 * @type {!Promise}
 */
const dbPromise = Promise.resolve(indexedDBP.open('cdn-js', 1, {
  upgrade(db, event) {
    const oldVersion = event.oldVersion;
    // Do we need to create our database?
    if (oldVersion == 0) {
      const files = db.createObjectStore('js-files', {autoIncrement: true});
      files.createIndex('files', 'file');
      files.createIndex('fileVersions', ['file', 'version']);
    }
  },
}).then(result => {
  db = result;
}));

/**
 * Fetches the request, and stores it in the cache. Since we only store one
 * version of each file, we'll prune all older versions after we cache this.
 *
 * @param {!Request} request
 */
function fetchAndCache(request) {
  const url = request.url;
  const requestFile = basename(url);
  const requestVersion = ampVersion(url);

  // TODO(jridgewell): we should also fetch this requestVersion for all files
  // we know about.

  return fetch(request).then(response => {
    // Did we receive a valid response (200 <= status < 300)?
    if (response && response.ok) {
      // You must clone to prevent double reading the body.
      cache.put(request, response.clone());

      // Store the file version in IndexedDB
      // This intentionally does not block the request resolution to speed
      // things up. This is likely fine since you don't have multiple
      // `<script>`s with the same `src` on a page.
      db.transaction('js-files', 'readwrite').run(transaction => {
        const files = transaction.objectStore('js-files');
        // Push the item into our cached files. We do this first so it might be
        // caught if the user refreshes quickly.
        return files.add({
          file: requestFile,
          version: requestVersion,
        }).then(key => {
          // Now, let's prune all the older versions.
          return files.index('files').openCursor(requestFile).while(cursor => {
            // Don't prune the file-version we just added.
            if (cursor.primaryKey === key) {
              return '';
            }

            // We'll want to remove this from the cache, too.
            const version = cursor.value.version;
            cursor.delete();
            return version;
          });
        });
      }).then(removedVersions => {
        removedVersions.forEach(version => {
          // Is the return value for the file-version we added (we explicitly
          // returned an empty string for it)?
          if (!version) {
            return;
          }

          const deleteUrl = versionedUrl(url, version);
          // We only want to delete RTV files.
          if (url !== deleteUrl) {
            cache.delete(deleteUrl);
          }
        });
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
 * @param {string} requestFile
 * @param {string} requestVersion
 * @return {!Promise<string>} Not really a promise, but a Promise-like.
 */
function getCachedVersion(requestFile, requestVersion) {
  return db.transaction('js-files', 'readonly').run(transaction => {
    const files = transaction.objectStore('js-files');
    const id = [requestFile, requestVersion];

    // First check if we have this exact file-version.
    return files.index('fileVersions').get(id).then(file => {
      // We have it cached!
      if (file) {
        return file.version;
      }

      // Do we have any versions of this file cached?
      // To get the first cached file, we must open a cursor. We won't actually
      // iterate past the first match, though, since we do not advance the
      // cursor.
      return files.index('files').openCursor(requestFile).iterate(cursor => {
        return cursor.value.version;
      }).then(versions => {
        // We have a version in cache (cause we iterated over it)!
        if (versions.length) {
          return versions[0];
        }

        // This is the first request we've seen for this file.
        return '';
      });
    });
  });
}

self.addEventListener('install', install => {
  install.waitUntil(Promise.all([cachePromise, dbPromise]));
});

// Setup the Fetch listener
// My assumptions:
//   - Doc requests one uniform AMP release version for all files, anything
//     else is malarkey.
//   - The requested version is always the newest AMP version.
self.addEventListener('fetch', event => {
  const request = event.request;
  const clientId = event.clientId;
  const url = request.url;

  // We only cache CDN JS files, and we need a clientId to do our magic.
  if (!clientId || !isCdnJsFile(url)) {
    return;
  }

  const requestFile = basename(url);
  const requestVersion = ampVersion(url);

  // Wait for the cachePromise and dbPromise to resolve. This is necessary
  // since the SW thread may be killed and restarted at any time.
  const response = Promise.all([cachePromise, dbPromise]).then(() => {
    // If we already registered this client, we must always use the same
    // version.
    if (clientsMap[clientId]) {
      return clientsMap[clientId];
    }

    // If not, do we have this version cached?
    return getCachedVersion(requestFile, requestVersion).then(version => {
      // We have a cached version! Serve it up!
      if (version) {
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
        if (version !== requestVersion && requestVersion.endsWith(VERSION)) {
          fetchAndCache(request);
        }

        return response;
      }

      // If not, let's fetch and cache the request.
      return fetchAndCache(versionedRequest);
    });
  });

  event.respondWith(response);
});
