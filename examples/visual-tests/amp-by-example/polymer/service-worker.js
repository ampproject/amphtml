/**
 * Copyright 2016 Google Inc. All rights reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/

// DO NOT EDIT THIS GENERATED OUTPUT DIRECTLY!
// This file should be overwritten as part of your build process.
// If you need to extend the behavior of the generated service worker, the best approach is to write
// additional code and include it using the importScripts option:
//   https://github.com/GoogleChrome/sw-precache#importscripts-arraystring
//
// Alternatively, it's possible to make changes to the underlying template file and then use that as the
// new base for generating output, via the templateFilePath option:
//   https://github.com/GoogleChrome/sw-precache#templatefilepath-string
//
// If you go that route, make sure that whenever you update your sw-precache dependency, you reconcile any
// changes made to this original template file with your modified copy.

// This generated service worker JavaScript will precache your site's resources.
// The code needs to be saved in a .js file at the top-level of your site, and registered
// from your pages in order to be used. See
// https://github.com/googlechrome/sw-precache/blob/master/demo/app/js/service-worker-registration.js
// for an example of how you can register this script and handle various service worker events.

/* eslint-env worker, serviceworker */
/* eslint-disable indent, no-unused-vars, no-multiple-empty-lines, max-nested-callbacks, space-before-function-paren, quotes, comma-spacing */
'use strict';

var precacheConfig = [["index.html","4fe95d91e3906c6fec777df73407b66b"],["node_modules/@npm-polymer/app-layout/app-scroll-effects/app-scroll-effects-behavior.html","14edd42292fe767ddeef097733993085"],["node_modules/@npm-polymer/app-layout/app-scroll-effects/effects/waterfall.html","bdc129afdf41aaa5c97f13e0071cb1bd"],["node_modules/@npm-polymer/app-layout/app-toolbar/app-toolbar.html","c7bda59172e0f43b9603d8a272abe870"],["node_modules/@npm-polymer/app-layout/helpers/helpers.html","15ca7d5e97647e9c7f33ff48c1174c24"],["node_modules/@npm-polymer/app-route/app-location.html","4ca0cf7e5b67faebdeeca7c8debfd272"],["node_modules/@npm-polymer/app-route/app-route-converter-behavior.html","dccecb824d90a3e92a4305aaa87f060c"],["node_modules/@npm-polymer/app-route/app-route.html","950d5004471c15d69338f3b55b88a6c1"],["node_modules/@npm-polymer/iron-ajax/iron-ajax.html","2014ea7dc1d2d417afa9f488cff74382"],["node_modules/@npm-polymer/iron-ajax/iron-request.html","0a08085e796bed6171caef37a6b12257"],["node_modules/@npm-polymer/iron-flex-layout/iron-flex-layout.html","c842503c86f6b4c1b925fdfce0300f29"],["node_modules/@npm-polymer/iron-location/iron-location.html","f1dce10105d3249607522580626b32a6"],["node_modules/@npm-polymer/iron-location/iron-query-params.html","4a47baa157ea3fdd25d7cd1f2df4b60d"],["node_modules/@npm-polymer/iron-media-query/iron-media-query.html","0716c876740cd1225cfc060109c4f1d9"],["node_modules/@npm-polymer/iron-pages/iron-pages.html","298d1a614caf26f6f82692ae1a4351f0"],["node_modules/@npm-polymer/iron-resizable-behavior/iron-resizable-behavior.html","cbed592a1eea3350b22a54bf2fda268b"],["node_modules/@npm-polymer/iron-scroll-target-behavior/iron-scroll-target-behavior.html","a67f2f05799e4ca78ad48450aa1ac21c"],["node_modules/@npm-polymer/iron-selector/iron-multi-selectable.html","e6100fe240603126deea4518f606821f"],["node_modules/@npm-polymer/iron-selector/iron-selectable.html","c0be605c5a2fa78c436304dff82f3428"],["node_modules/@npm-polymer/iron-selector/iron-selection.html","cc0797080a508370c26a7104a29433ca"],["node_modules/@npm-polymer/iron-selector/iron-selector.html","c8946dcd397168b6ba3248f4ce7d0ca9"],["node_modules/@npm-polymer/polymer/lib/elements/array-selector.html","7e4a9dd8ef76ddd0b1be7a7927a29664"],["node_modules/@npm-polymer/polymer/lib/elements/custom-style.html","9eeb5c0360db8368eb69e2e4975e0ee4"],["node_modules/@npm-polymer/polymer/lib/elements/dom-bind.html","2177669425e595962bdebcbdd49d0be1"],["node_modules/@npm-polymer/polymer/lib/elements/dom-if.html","74ba6e6ae107b30d3ff04446d7f15771"],["node_modules/@npm-polymer/polymer/lib/elements/dom-module.html","2a16a0339d949f90b90746d6fe5e565a"],["node_modules/@npm-polymer/polymer/lib/elements/dom-repeat.html","5d9ea6ab6c2c03ecab04e59b72166813"],["node_modules/@npm-polymer/polymer/lib/legacy/class.html","da895bb44e80b9ebd58b1fc7b0420391"],["node_modules/@npm-polymer/polymer/lib/legacy/legacy-element-mixin.html","5fb95bf1b4ef16f106a3f26ca342a6fc"],["node_modules/@npm-polymer/polymer/lib/legacy/mutable-data-behavior.html","a5540926ee21f7c7293d3ad5c05be9b3"],["node_modules/@npm-polymer/polymer/lib/legacy/polymer-fn.html","6fb533656a615f47737b9d4020d525a1"],["node_modules/@npm-polymer/polymer/lib/legacy/polymer.dom.html","a9079a4c25b27da5d922f7afec218e48"],["node_modules/@npm-polymer/polymer/lib/legacy/templatizer-behavior.html","9b2b6b5d57381187dbf302ff534f8bef"],["node_modules/@npm-polymer/polymer/lib/mixins/element-mixin.html","73632700407c2a71131fd5b5440b9614"],["node_modules/@npm-polymer/polymer/lib/mixins/gesture-event-listeners.html","53e81a7596307802203f9fdb8f437bfd"],["node_modules/@npm-polymer/polymer/lib/mixins/mutable-data.html","9895e7570814e172f569b3a09351827e"],["node_modules/@npm-polymer/polymer/lib/mixins/property-accessors.html","2e000b73bba6c43b5651b745f4e08fdd"],["node_modules/@npm-polymer/polymer/lib/mixins/property-effects.html","243e2276b09b6323afeb49e22815dbfa"],["node_modules/@npm-polymer/polymer/lib/mixins/template-stamp.html","4d32cf7f4a0e2b12a0c546dc788fd434"],["node_modules/@npm-polymer/polymer/lib/utils/array-splice.html","e87f26f2c19dfdb1618bb731902a4f2c"],["node_modules/@npm-polymer/polymer/lib/utils/async.html","304fdfc0dad0d9b1f3a2cd6cfb1d3856"],["node_modules/@npm-polymer/polymer/lib/utils/boot.html","1eb37706c9cb810b4b1946a7a0c37791"],["node_modules/@npm-polymer/polymer/lib/utils/case-map.html","4d949c6dc8b68dd6f01bf54f06b3f37c"],["node_modules/@npm-polymer/polymer/lib/utils/debounce.html","bc1e7062466883e2be607363b99d5b7c"],["node_modules/@npm-polymer/polymer/lib/utils/flattened-nodes-observer.html","053f828a8553291fe8cb8c057ccb205f"],["node_modules/@npm-polymer/polymer/lib/utils/flush.html","bba45c8707ff9aa6800ec92a89352e99"],["node_modules/@npm-polymer/polymer/lib/utils/gestures.html","27a97247e72f749477410bcef8b70aec"],["node_modules/@npm-polymer/polymer/lib/utils/import-href.html","00f76d81e071f561a219da0735556330"],["node_modules/@npm-polymer/polymer/lib/utils/mixin.html","820fe15e8160fb365491dc341360a69e"],["node_modules/@npm-polymer/polymer/lib/utils/path.html","dc529dda65720e541e95bfa7f654dbff"],["node_modules/@npm-polymer/polymer/lib/utils/render-status.html","c8fff560a3ade79e2279111549a2fb23"],["node_modules/@npm-polymer/polymer/lib/utils/resolve-url.html","4de13f2e51342c13e689742280a8332f"],["node_modules/@npm-polymer/polymer/lib/utils/style-gather.html","de17d3cc13f521b1a040235aebf16eb9"],["node_modules/@npm-polymer/polymer/lib/utils/templatize.html","1630b0e342a65e27ae02f5a8a9fc1afc"],["node_modules/@npm-polymer/polymer/lib/utils/unresolved.html","48732bcda92c5b9c591d75f7c036f7a5"],["node_modules/@npm-polymer/polymer/polymer-element.html","99ba63ce1234e975cbfc9e10962db5f6"],["node_modules/@npm-polymer/polymer/polymer.html","ff2cd4c34828a0ffe4677bf933618de4"],["node_modules/@npm-polymer/promise-polyfill/Promise.js","6d72e76387d06f828797b0ce05a2feb7"],["node_modules/@npm-polymer/promise-polyfill/promise-polyfill-lite.html","965c7e4a3b59ae6da112c36ef7fcaeb6"],["node_modules/@npm-polymer/shadycss/apply-shim.html","75f54922d2507d0c43bdf946149c38b1"],["node_modules/@npm-polymer/shadycss/apply-shim.min.js","fad5622d07f9301799bbc9773e51d324"],["node_modules/@npm-polymer/shadycss/custom-style-interface.html","ceb0842ff6c53d8d13d6cf2345f41490"],["node_modules/@npm-polymer/shadycss/custom-style-interface.min.js","8aacb093f4dc252152854ab9aaabb39c"],["node_modules/@webcomponents/webcomponentsjs/custom-elements-es5-adapter.js","a5043c1d0dd16d84558ee6cc2276212e"],["node_modules/@webcomponents/webcomponentsjs/gulpfile.js","1aac641003c7d14b266843d632cbf71f"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-hi-ce.js","6e70d19aa72bca16779abfadceba8d58"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-hi-sd-ce.js","874c3be210adb362d08aaf97bbb3f21b"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-hi-sd.js","f1db6505f87f7a8660b566a0540e7e5b"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-hi.js","c2270cd6fb0b95ed2f87c6b1c143c94f"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-lite.js","7354f6c8fce5789ec22b2dbc045f9d52"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-loader.js","f13bbbbf647b7922575a7894367ddaaf"],["node_modules/@webcomponents/webcomponentsjs/webcomponents-sd-ce.js","20b8283441ed3da5c6c69c5ea9c208ae"],["src/abe-polymer-app.html","9294bc732364089195adf35a1bcc6bcd"],["src/sample-category-data.html","81781b187cd914ee1d5bcaf1ea292647"],["src/sample-home.html","63a8f55be7e11f54431ff872cfba6486"],["src/sample-list-item.html","6991044dff87471e01898817993bc9d5"],["src/sample-list.html","37028c4082d40be0f94b49fba10b7894"]];
var cacheName = 'sw-precache-v3--' + (self.registration ? self.registration.scope : '');


var ignoreUrlParametersMatching = [/^utm_/];



var addDirectoryIndex = function (originalUrl, index) {
    var url = new URL(originalUrl);
    if (url.pathname.slice(-1) === '/') {
      url.pathname += index;
    }
    return url.toString();
  };

var cleanResponse = function (originalResponse) {
    // If this is not a redirected response, then we don't have to do anything.
    if (!originalResponse.redirected) {
      return Promise.resolve(originalResponse);
    }

    // Firefox 50 and below doesn't support the Response.body stream, so we may
    // need to read the entire body to memory as a Blob.
    var bodyPromise = 'body' in originalResponse ?
      Promise.resolve(originalResponse.body) :
      originalResponse.blob();

    return bodyPromise.then(function(body) {
      // new Response() is happy when passed either a stream or a Blob.
      return new Response(body, {
        headers: originalResponse.headers,
        status: originalResponse.status,
        statusText: originalResponse.statusText
      });
    });
  };

var createCacheKey = function (originalUrl, paramName, paramValue,
                           dontCacheBustUrlsMatching) {
    // Create a new URL object to avoid modifying originalUrl.
    var url = new URL(originalUrl);

    // If dontCacheBustUrlsMatching is not set, or if we don't have a match,
    // then add in the extra cache-busting URL parameter.
    if (!dontCacheBustUrlsMatching ||
        !(url.pathname.match(dontCacheBustUrlsMatching))) {
      url.search += (url.search ? '&' : '') +
        encodeURIComponent(paramName) + '=' + encodeURIComponent(paramValue);
    }

    return url.toString();
  };

var isPathWhitelisted = function (whitelist, absoluteUrlString) {
    // If the whitelist is empty, then consider all URLs to be whitelisted.
    if (whitelist.length === 0) {
      return true;
    }

    // Otherwise compare each path regex to the path of the URL passed in.
    var path = (new URL(absoluteUrlString)).pathname;
    return whitelist.some(function(whitelistedPathRegex) {
      return path.match(whitelistedPathRegex);
    });
  };

var stripIgnoredUrlParameters = function (originalUrl,
    ignoreUrlParametersMatching) {
    var url = new URL(originalUrl);
    // Remove the hash; see https://github.com/GoogleChrome/sw-precache/issues/290
    url.hash = '';

    url.search = url.search.slice(1) // Exclude initial '?'
      .split('&') // Split into an array of 'key=value' strings
      .map(function(kv) {
        return kv.split('='); // Split each 'key=value' string into a [key, value] array
      })
      .filter(function(kv) {
        return ignoreUrlParametersMatching.every(function(ignoredRegex) {
          return !ignoredRegex.test(kv[0]); // Return true iff the key doesn't match any of the regexes.
        });
      })
      .map(function(kv) {
        return kv.join('='); // Join each [key, value] array into a 'key=value' string
      })
      .join('&'); // Join the array of 'key=value' strings into a string with '&' in between each

    return url.toString();
  };


var hashParamName = '_sw-precache';
var urlsToCacheKeys = new Map(
  precacheConfig.map(function(item) {
    var relativeUrl = item[0];
    var hash = item[1];
    var absoluteUrl = new URL(relativeUrl, self.location);
    var cacheKey = createCacheKey(absoluteUrl, hashParamName, hash, false);
    return [absoluteUrl.toString(), cacheKey];
  })
);

function setOfCachedUrls(cache) {
  return cache.keys().then(function(requests) {
    return requests.map(function(request) {
      return request.url;
    });
  }).then(function(urls) {
    return new Set(urls);
  });
}

self.addEventListener('install', function(event) {
  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return setOfCachedUrls(cache).then(function(cachedUrls) {
        return Promise.all(
          Array.from(urlsToCacheKeys.values()).map(function(cacheKey) {
            // If we don't have a key matching url in the cache already, add it.
            if (!cachedUrls.has(cacheKey)) {
              var request = new Request(cacheKey, {credentials: 'same-origin'});
              return fetch(request).then(function(response) {
                // Bail out of installation unless we get back a 200 OK for
                // every request.
                if (!response.ok) {
                  throw new Error('Request for ' + cacheKey + ' returned a ' +
                    'response with status ' + response.status);
                }

                return cleanResponse(response).then(function(responseToCache) {
                  return cache.put(cacheKey, responseToCache);
                });
              });
            }
          })
        );
      });
    }).then(function() {

      // Force the SW to transition from installing -> active state
      return self.skipWaiting();

    })
  );
});

self.addEventListener('activate', function(event) {
  var setOfExpectedUrls = new Set(urlsToCacheKeys.values());

  event.waitUntil(
    caches.open(cacheName).then(function(cache) {
      return cache.keys().then(function(existingRequests) {
        return Promise.all(
          existingRequests.map(function(existingRequest) {
            if (!setOfExpectedUrls.has(existingRequest.url)) {
              return cache.delete(existingRequest);
            }
          })
        );
      });
    }).then(function() {

      return self.clients.claim();

    })
  );
});


self.addEventListener('fetch', function(event) {
  if (event.request.method === 'GET') {
    // Should we call event.respondWith() inside this fetch event handler?
    // This needs to be determined synchronously, which will give other fetch
    // handlers a chance to handle the request if need be.
    var shouldRespond;

    // First, remove all the ignored parameters and hash fragment, and see if we
    // have that URL in our cache. If so, great! shouldRespond will be true.
    var url = stripIgnoredUrlParameters(event.request.url, ignoreUrlParametersMatching);
    shouldRespond = urlsToCacheKeys.has(url);

    // If shouldRespond is false, check again, this time with 'index.html'
    // (or whatever the directoryIndex option is set to) at the end.
    var directoryIndex = '';
    if (!shouldRespond && directoryIndex) {
      url = addDirectoryIndex(url, directoryIndex);
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond is still false, check to see if this is a navigation
    // request, and if so, whether the URL matches navigateFallbackWhitelist.
    var navigateFallback = '/index.html';
    if (!shouldRespond &&
        navigateFallback &&
        (event.request.mode === 'navigate') &&
        isPathWhitelisted(["\\/[^\\/\\.]*(\\?|$)"], event.request.url)) {
      url = new URL(navigateFallback, self.location).toString();
      shouldRespond = urlsToCacheKeys.has(url);
    }

    // If shouldRespond was set to true at any point, then call
    // event.respondWith(), using the appropriate cache key.
    if (shouldRespond) {
      event.respondWith(
        caches.open(cacheName).then(function(cache) {
          return cache.match(urlsToCacheKeys.get(url)).then(function(response) {
            if (response) {
              return response;
            }
            throw Error('The cached response that was expected is missing.');
          });
        }).catch(function(e) {
          // Fall back to just fetch()ing the request if some unexpected error
          // prevented the cached response from being valid.
          console.warn('Couldn\'t serve response for "%s" from cache: %O', event.request.url, e);
          return fetch(event.request);
        })
      );
    }
  }
});
