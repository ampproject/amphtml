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

'use strict';

self.addEventListener('install', event => {
});

self.addEventListener('fetch', event => {
  // TODO(dvoytenko): use cache, implement one-behind.
  if (event.request.url.indexOf('amp.html') != -1) {
    // Override response with the shell unless the leaf document is explicitly
    // requested.
    if (event.request.mode === 'navigate') {
      event.respondWith(fetch('/pwa'));
      // Immediately start downloading the actual resource.
      fetch(event.request.url);
    }
  }
});
