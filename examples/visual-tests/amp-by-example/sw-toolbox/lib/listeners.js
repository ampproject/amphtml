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

// For cache.addAll.
require('serviceworker-cache-polyfill');

var helpers = require('./helpers');
var router = require('./router');
var options = require('./options');

// Event listeners

function fetchListener(event) {
  var handler = router.match(event.request);

  if (handler) {
    event.respondWith(handler(event.request));
  } else if (router.default &&
    event.request.method === 'GET' &&
    // Ensure that chrome-extension:// requests don't trigger the default route.
    event.request.url.indexOf('http') === 0) {
    event.respondWith(router.default(event.request));
  }
}

function activateListener(event) {
  helpers.debug('activate event fired');
  var inactiveCache = options.cache.name + '$$$inactive$$$';
  event.waitUntil(helpers.renameCache(inactiveCache, options.cache.name));
}

function flatten(items) {
  return items.reduce(function(a, b) {
    return a.concat(b);
  }, []);
}

function installListener(event) {
  var inactiveCache = options.cache.name + '$$$inactive$$$';
  helpers.debug('install event fired');
  helpers.debug('creating cache [' + inactiveCache + ']');
  event.waitUntil(
    helpers.openCache({cache: {name: inactiveCache}})
    .then(function(cache) {
      return Promise.all(options.preCacheItems)
      .then(flatten)
      .then(helpers.validatePrecacheInput)
      .then(function(preCacheItems) {
        helpers.debug('preCache list: ' +
              (preCacheItems.join(', ') || '(none)'));
        return cache.addAll(preCacheItems);
      });
    })
  );
}

module.exports = {
  fetchListener: fetchListener,
  activateListener: activateListener,
  installListener: installListener
};
