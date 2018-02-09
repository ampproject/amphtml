/*
  Copyright 2014 Google Inc. All Rights Reserved.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/
'use strict';

var globalOptions = require('./options');
var idbCacheExpiration = require('./idb-cache-expiration');

function debug(message, options) {
  options = options || {};
  var flag = options.debug || globalOptions.debug;
  if (flag) {
    console.log('[sw-toolbox] ' + message);
  }
}

function openCache(options) {
  var cacheName;
  if (options && options.cache) {
    cacheName = options.cache.name;
  }
  cacheName = cacheName || globalOptions.cache.name;

  return caches.open(cacheName);
}

function fetchAndCache(request, options) {
  options = options || {};
  var successResponses = options.successResponses ||
      globalOptions.successResponses;

  return fetch(request.clone()).then(function(response) {
    // Only cache GET requests with successful responses.
    // Since this is not part of the promise chain, it will be done
    // asynchronously and will not block the response from being returned to the
    // page.
    if (request.method === 'GET' && successResponses.test(response.status)) {
      openCache(options).then(function(cache) {
        cache.put(request, response).then(function() {
          // If any of the options are provided in options.cache then use them.
          // Do not fallback to the global options for any that are missing
          // unless they are all missing.
          var cacheOptions = options.cache || globalOptions.cache;

          // Only run the cache expiration logic if at least one of the maximums
          // is set, and if we have a name for the cache that the options are
          // being applied to.
          if ((cacheOptions.maxEntries || cacheOptions.maxAgeSeconds) &&
              cacheOptions.name) {
            queueCacheExpiration(request, cache, cacheOptions);
          }
        });
      });
    }

    return response.clone();
  });
}

var cleanupQueue;
function queueCacheExpiration(request, cache, cacheOptions) {
  var cleanup = cleanupCache.bind(null, request, cache, cacheOptions);

  if (cleanupQueue) {
    cleanupQueue = cleanupQueue.then(cleanup);
  } else {
    cleanupQueue = cleanup();
  }
}

function cleanupCache(request, cache, cacheOptions) {
  var requestUrl = request.url;
  var maxAgeSeconds = cacheOptions.maxAgeSeconds;
  var maxEntries = cacheOptions.maxEntries;
  var cacheName = cacheOptions.name;

  var now = Date.now();
  debug('Updating LRU order for ' + requestUrl + '. Max entries is ' +
    maxEntries + ', max age is ' + maxAgeSeconds);

  return idbCacheExpiration.getDb(cacheName).then(function(db) {
    return idbCacheExpiration.setTimestampForUrl(db, requestUrl, now);
  }).then(function(db) {
    return idbCacheExpiration.expireEntries(db, maxEntries, maxAgeSeconds, now);
  }).then(function(urlsToDelete) {
    debug('Successfully updated IDB.');

    var deletionPromises = urlsToDelete.map(function(urlToDelete) {
      return cache.delete(urlToDelete);
    });

    return Promise.all(deletionPromises).then(function() {
      debug('Done with cache cleanup.');
    });
  }).catch(function(error) {
    debug(error);
  });
}

function renameCache(source, destination, options) {
  debug('Renaming cache: [' + source + '] to [' + destination + ']', options);
  return caches.delete(destination).then(function() {
    return Promise.all([
      caches.open(source),
      caches.open(destination)
    ]).then(function(results) {
      var sourceCache = results[0];
      var destCache = results[1];

      return sourceCache.keys().then(function(requests) {
        return Promise.all(requests.map(function(request) {
          return sourceCache.match(request).then(function(response) {
            return destCache.put(request, response);
          });
        }));
      }).then(function() {
        return caches.delete(source);
      });
    });
  });
}

function cache(url, options) {
  return openCache(options).then(function(cache) {
    return cache.add(url);
  });
}

function uncache(url, options) {
  return openCache(options).then(function(cache) {
    return cache.delete(url);
  });
}

function precache(items) {
  if (!(items instanceof Promise)) {
    validatePrecacheInput(items);
  }

  globalOptions.preCacheItems = globalOptions.preCacheItems.concat(items);
}

function validatePrecacheInput(items) {
  var isValid = Array.isArray(items);
  if (isValid) {
    items.forEach(function(item) {
      if (!(typeof item === 'string' || (item instanceof Request))) {
        isValid = false;
      }
    });
  }

  if (!isValid) {
    throw new TypeError('The precache method expects either an array of ' +
    'strings and/or Requests or a Promise that resolves to an array of ' +
    'strings and/or Requests.');
  }

  return items;
}

function isResponseFresh(response, maxAgeSeconds, now) {
  // If we don't have a response, then it's not fresh.
  if (!response) {
    return false;
  }

  // Only bother checking the age of the response if maxAgeSeconds is set.
  if (maxAgeSeconds) {
    var dateHeader = response.headers.get('date');
    // If there's no Date: header, then fall through and return true.
    if (dateHeader) {
      var parsedDate = new Date(dateHeader);
      // If the Date: header was invalid for some reason, parsedDate.getTime()
      // will return NaN, and the comparison will always be false. That means
      // that an invalid date will be treated as if the response is fresh.
      if ((parsedDate.getTime() + (maxAgeSeconds * 1000)) < now) {
        // Only return false if all the other conditions are met.
        return false;
      }
    }
  }

  // Fall back on returning true by default, to match the previous behavior in
  // which we never bothered checking to see whether the response was fresh.
  return true;
}

module.exports = {
  debug: debug,
  fetchAndCache: fetchAndCache,
  openCache: openCache,
  renameCache: renameCache,
  cache: cache,
  uncache: uncache,
  precache: precache,
  validatePrecacheInput: validatePrecacheInput,
  isResponseFresh: isResponseFresh
};
