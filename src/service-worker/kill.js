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

self.addEventListener('install', function(event) {
  // Usually when you register a new service worker, it has to wait for a
  // navigation (refreshing the page) before it really starts. Well, we can't
  // wait to kill it, so skip the wait.
  // NOTE(erwinm): add type hint that self is ServiceWorkerGlobalScope until
  // we can cleanly denote that the global object is ServiceWorkerGlobalScope
  // and not Window.
  event.waitUntil(/** @type {!ServiceWorkerGlobalScope} */ (
    self).skipWaiting());
});

self.addEventListener('activate', function(event) {
  // Usually after waiting for a navigation, it has to wait for all other
  // clients to close before it really starts. Well, we can't wait to kill it,
  // so tell the others to shove off.
  const killing = clients.claim().then(() => {
    // Delete our cache.
    return caches.delete('cdn-js');
  }).then(() => {
    return new Promise((resolve, reject) => {
      // Delete our database. Stupid IndexedDB doesn't return promises.
      const request = indexedDB.deleteDatabase('cdn-js');
      request.onsuccess = resolve;
      request.onerror = reject;
    });
  });

  event.waitUntil(killing);
});
