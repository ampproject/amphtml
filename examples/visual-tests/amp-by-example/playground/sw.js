// Copyright 2018 The AMPHTML Authors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

importScripts('workbox-sw.prod.js');

const urlsToPrecache = [
  'https://cdn.ampproject.org/v0.js',
  'https://cdn.ampproject.org/v0/validator.js'
];

const workboxSW = new WorkboxSW({
  clientsClaim: true,
});

workboxSW.precache(urlsToPrecache);
workboxSW.precache([
  {
    "url": "0.bc58915a90a6589929a0.bundle.js",
    "revision": "5b2c03c820b816a7a8c3477a95481af6"
  },
  {
    "url": "app.c5382b854064daa3421f.js",
    "revision": "e3a544f6eb8b290f528a18394c8da69d"
  },
  {
    "url": "index.html",
    "revision": "b2eb137c02808025a5cf8edd69ee2228"
  }
]);

const networkFirst = workboxSW.strategies.networkFirst();
const staleWhileRevalidate = workboxSW.strategies.staleWhileRevalidate();

workboxSW.router.registerRoute(/\/document\/.*/, networkFirst);
workboxSW.router.registerRoute(/\/amp\/.*/, networkFirst);
workboxSW.router.registerRoute(/.*/, staleWhileRevalidate);
workboxSW.router.registerRoute(/https\:\/\/cdn\.ampproject\.org.*/, staleWhileRevalidate);
