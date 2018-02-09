/*
 Copyright 2015 Google Inc. All Rights Reserved.

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
var globalOptions = require('../options');
var helpers = require('../helpers');

function networkFirst(request, values, options) {
  options = options || {};
  var successResponses = options.successResponses ||
      globalOptions.successResponses;
  // This will bypass options.networkTimeout if it's set to a false-y value like
  // 0, but that's the sane thing to do anyway.
  var networkTimeoutSeconds = options.networkTimeoutSeconds ||
      globalOptions.networkTimeoutSeconds;
  helpers.debug('Strategy: network first [' + request.url + ']', options);

  return helpers.openCache(options).then(function(cache) {
    var timeoutId;
    var promises = [];
    var originalResponse;

    if (networkTimeoutSeconds) {
      var cacheWhenTimedOutPromise = new Promise(function(resolve) {
        timeoutId = setTimeout(function() {
          cache.match(request).then(function(response) {
            var cacheOptions = options.cache || globalOptions.cache;
            // Only resolve this promise if there's a valid response in the
            // cache. This ensures that we won't time out a network request
            // unless there's a cached entry to fallback on, which is arguably
            // the preferable behavior.
            var now = Date.now();
            var maxAgeSeconds = cacheOptions.maxAgeSeconds;
            if (helpers.isResponseFresh(response, maxAgeSeconds, now)) {
              resolve(response);
            }
          });
        }, networkTimeoutSeconds * 1000);
      });
      promises.push(cacheWhenTimedOutPromise);
    }

    var networkPromise = helpers.fetchAndCache(request, options)
      .then(function(response) {
        // We've got a response, so clear the network timeout if there is one.
        if (timeoutId) {
          clearTimeout(timeoutId);
        }

        if (successResponses.test(response.status)) {
          return response;
        }

        helpers.debug('Response was an HTTP error: ' + response.statusText,
            options);
        originalResponse = response;
        throw new Error('Bad response');
      }).catch(function(error) {
        helpers.debug('Network or response error, fallback to cache [' +
            request.url + ']', options);
        return cache.match(request).then(function(response) {
          // If there's a match in the cache, resolve with that.
          if (response) {
            return response;
          }

          // If we have a Response object from the previous fetch, then resolve
          // with that, even though it corresponds to an error status code.
          if (originalResponse) {
            return originalResponse;
          }

          // If we don't have a Response object from the previous fetch, likely
          // due to a network failure, then reject with the failure error.
          throw error;
        });
      });

    promises.push(networkPromise);

    return Promise.race(promises);
  });
}

module.exports = networkFirst;
