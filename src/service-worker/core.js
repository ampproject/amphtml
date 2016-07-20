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
import indexedDBP from '../../third_party/indexed-db-as-promised/index';

/**
 * The SW's current version. We conveniently use JS Date timestamps as version
 * numbers, so we use this to determine how old a given versioned file is
 * compared to the latest version (this version).
 * @const
 */
const VERSION = '$internalRuntimeVersion$';

/**
 * The release date of the latest version.
 * @const
 */
const RELEASE_DATE = versionToDate(VERSION);

/**
 * Returns the release date of a given AMP release version.
 *
 * @param {string} ampVersion
 * @return {!Date}
 */
function versionToDate(ampVersion) {
  return new Date(parseInt(ampVersion, 10));
}

/**
 * Returns the version of a given versioned JS file.
 *
 * @param {string} url
 * @return {string}
 */
function ampVersion(url) {
  const matches = /rtv\/(\d+)/.exec(url);
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
 * @param {string=} version
 * @return {string}
 */
function versionedUrl(url, version = VERSION) {
  return url.replace(ampVersion(url), version);
}

/**
 * Determines if a url is a request to a CDN JS file.
 * @param {string} url
 * @return {boolean}
 */
function isCdnJsFile(url) {
  return url.startsWith('https://cdn.ampproject.org/') &&
    url.endsWith('.js');
}


/**
 * A mapping from a Client's (unique per tab _and_ refresh) ID to the AMP
 * release version we are serving it.
 *
 * @const
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
 * A promise that will be overridden when upgrading our SW that waits until all
 * extremely stale versions of all files are purged.
 *
 * @type {!Promise}
 */
let cacheCleanup = Promise.resolve();

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
const dbPromise = cachePromise.then(() => {
  return indexedDBP.open('cdn-js', VERSION, {
    upgrade(db, event) {
      const oldVersion = event.oldVersion;
      const transaction = event.transaction;
      // Do we need to create our database?
      if (oldVersion == 0) {
        const files = db.createObjectStore('js-files', {keyPath: 'file'});
        files.createIndex('versions', 'versions', {multiEntry: true});
      }

      const files = transaction.objectStore('js-files');
      const versions = files.index('versions');

      // Do not serve versions older than two weeks.
      const cutoff = Number(RELEASE_DATE.setDate(-14));
      const range = IDBKeyRange.upperBound(cutoff);

      // We need to find every file that has an old version, then prune that
      // version from the db and cache.
      cacheCleanup = Promise.resolve(versions.openCursor(range).while(cur => {
        const item = cur.value;
        const removal = {
          url: item.url,
          versions: item.versions.filter(v => (v <= cutoff)),
        };

        // Remove old versions from our db.
        item.versions = item.versions.filter(v => v > cutoff);
        return cur.put(item).then(() => removal);
      })).then(removals => {
        // Prune all versions of all files from the cache.
        const deletes = removals.map(removal => {
          // Prune all versions of this file from the cache
          const deletes = removal.versions.map(version => {
            const url = versionedUrl(removal.url, version);
            return cache.delete(url);
          });

          return Promise.all(deletes);
        });

        return Promise.all(deletes);
      });
    },
  });
}).then(result => {
  db = result;
});

self.addEventListener('install', function(install) {
  install.waitUntil(Promise.all([cachePromise, cacheCleanup, dbPromise]));
});

// Setup the Fetch listener
// My assumptions:
//   - Doc requests one uniform AMP release version for all files, anything
//     else is malarkey.
self.addEventListener('fetch', function(event) {
  const request = event.request;
  const clientId = event.clientId;
  const url = request.url;
  let response;

  // We only cache CDN JS files, and we need a clientId to do our magic.
  if (clientId && isCdnJsFile(url)) {
    const requestFile = basename(url);
    const requestVersion = ampVersion(url);

    // What version do we have for this client?
    response = Promise.resolve(clientsMap[clientId]).then(version => {
      // If we already registered this client, we must always use the same
      // version.
      if (version) {
        return version;
      }

      // If not, do we have this version cached, if so serve it.
      // do we have a newer version cached? Check the db, if so serve it.
      // If not, get the newest version, cache it, serve it.
      return db.transaction('js-files', 'readonly').run(transaction => {
        const files = transaction.objectStore('js-files');
        return files.get(requestFile);
      }).then((item = {}) => {
        const versions = item.versions;
        if (!versions || versions.length === 0) {
          return VERSION;
        }

        const isVersionCached = versions.indexOf(requestVersion) > -1;
        // TODO Make this smarter. We should probably select the version
        // with the most other-files.
        return isVersionCached ? requestVersion : versions[versions.length - 1];
      });
    }).then(version => {
      const versionedRequest = version === requestVersion ?
          request :
          new Request(versionedUrl(url, version), request);
      clientsMap[clientId] = version;

      return cache.match(versionedRequest).then(function(response) {
        // Cache hit - return response
        if (response) {
          return response;
        }

        // Must always fetch.
        return fetch(versionedRequest).then(function(response) {
          // Did we receive a valid response (200 <= status < 300)?
          if (response && response.ok) {
            // You must clone to prevent double reading the body.
            cache.put(versionedRequest, response.clone());

            // Store the file version in IndexedDB
            // This intentionally does not block the request to speed things
            // up. This is likely fine since you don't have multiple
            // `<script>`s with the same `src` on a page.
            db.transaction('js-files', 'readwrite').run(transaction => {
              const files = transaction.objectStore('js-files');
              return files.get(requestFile).then(item => {
                if (!item) {
                  item = {
                    file: requestFile,
                    // We store a "version-less" url so we may purge our
                    // versioned urls at a later time from the cache (which
                    // keys things based on url).
                    url: versionedUrl(url, '0000000000000'),
                    versions: [],
                  };
                }

                const versions = item.versions;
                if (versions.indexOf(version) == -1) {
                  versions.push(version);
                  versions.sort((a, b) => a - b);
                  return files.put(item);
                }
              });
            });
          }

          return response;
        });
      });
    });
  } else {
    response = fetch(request);
  }

  // You must always respond with a Response.
  event.respondWith(response);
});
