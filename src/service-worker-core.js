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

import indexedDBP from "../third_party/indexed-db-as-promised/index"

const VERSION = '$internalRuntimeVersion$';
const RELEASE_DATE = versionToDate(VERSION);

function versionToDate(ampVersion) {
  return new Date(parseInt(ampVersion, 10));
}

function ampVersion(url) {
  const matches = /rtv\/(\d+)/.exec(url);
  return matches ? matches[1] : VERSION;
}

function isStale(ampVersion, days = 8) {
  const delta = RELEASE_DATE - new Date(parseInt(ampVersion, 10));
  return delta > days * (/* 1 day in ms */ 1000 * 60 * 60 * 24);
}

function basename(url) {
  return url.substr(url.lastIndexOf('/') + 1);
}

function versionedUrl(url, version = VERSION) {
  return url.replace(ampVersion(url), version);
}

/**
 * Is this a CDN JS file?
 * @param {string} url
 * @return {boolean}
 */
function isCdnJsFile(url) {
  return url.startsWith('https://cdn.ampproject.org/') &&
    url.endsWith('.js');
}


let cache;
let db;
let cacheCleanup = Promise.resolve();

const cachePromise = caches.open('cdn-js').then(result => {
  cache = result;
});

const dbPromise = cachePromise.then(() => {
  return indexedDBP.open('cdn-js', VERSION, {
    upgrade(db, { oldVersion, transaction }) {
      if (oldVersion == 0) {
        db.createObjectStore('clients', {keyPath: 'clientId'});
        const files = db.createObjectStore('js-files', {keyPath: 'file'});
        files.createIndex('versions', 'versions', { multiEntry: true });
      }

      const files = transaction.objectStore('js-files');
      const versions = files.index('versions');
      // Do not serve versions older than two weeks.
      const cutoff = Number(RELEASE_DATE.setDate(-14));
      const range = IDBKeyRange.upperBound(cutoff);

      const removals = [];
      cacheCleanup = versions.openCursor(range).while(cursor => {
        const item = cursor.item;
        const removal = {
          url: item.url,
          versions: item.versions.filter(v => (v <= cutoff))
        };
        item.versions = item.versions.filter(v => v > cutoff);

        return cursor.put(item).then(() => removal);
      }).then(removals => {
        const deletes = removals.map(removal => {
          const deletes = removal.versions.forEach(version => {
            const url = versionedUrl(removal.url, version);
            return cache.delete(url);
          });

          return Promise.all(deletes);
        });

        return Promise.all(deletes);
      });
    }
  });
}).then(result => {
  db = result;
});

self.addEventListener('install', function(install) {
  install.waitUntil(Promise.all([cachePromise, cacheCleanup, dbPromise]));

  // Setup the Fetch listener
  // My assumptions:
  //   - The AMP core runtime is the first request (since it's sync).
  //   - Doc requests one uniform AMP version for all files, anything else
  //     is malarkey.
  self.addEventListener('fetch', function(event) {
    const { request, clientId } = event;
    const { url } = request;
    let response;

    // We only cache CDN JS files, and we need a clientId to do our magic.
    if (clientId && isCdnJsFile(url)) {
      const requestFile = basename(url);
      const requestVersion = ampVersion(url);

      // What version do we have for this client? Keep it the same regardless.
      response = db.transaction('clients', 'readonly').then(transaction => {
        const clients = transaction.objectStore('clients');
        return clients.get(clientId);
      }).then(client => {
        // If we have a client, we must always use the same version.
        if (client) {
          return client.version;
        }

        // If not, do we have this version cached, if so serve it.
        // do we have a newer version cached? Check the db, if so serve it.
        // If not, get the newest version, cache it, serve it.
        return db.transaction('js-files', 'readonly').then(transaction => {
          const files = transaction.objectStore('js-files');
          return files.get(requestFile);
        }).then(cachedVersions => {
          const { versions } = cachedVersions || {};
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
              db.transaction('js-files', 'readwrite').then(transaction => {
                const files = transaction.objectStore('js-files');
                return files.get(requestFile).then(item => {
                  if (!item) {
                    item = {
                      file: requestFile,
                      url: versionedUrl(url, '0000000000000'),
                      versions: [],
                    };
                  }
                  const { versions } = item;
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
});
