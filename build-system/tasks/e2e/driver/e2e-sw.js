/**
 * Copyright 2019 The AMP HTML Authors. All Rights Reserved.
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

self.addEventListener('install', () => {});

self.addEventListener('activate', event => {
  // Enable the service worker without reloading the document
  event.waitUntil(
    self.clients.claim().then(async () => {
      const {clientId} = event;
      const client = await self.clients.get(clientId);
      client.postMessage(self.requests_.get(clientId));
    })
  );
});

self.addEventListener('fetch', event => {
  self.requests_ = self.requests_ || new ClientRequests();

  const {clientId, request} = event;

  // Exit if we cannot access the client, e.g. if it's cross-origin
  if (!clientId) {
    return;
  }

  event.waitUntil(logRequest(clientId, request));
});

/**
 * A simple keyed store of Client IDs to lists of requests.
 * @template T
 */
class ClientRequests {
  constructor() {
    /** @const @private */
    this.map_ = {};
  }

  /**
   * Add an item to the log of requests
   * @param {string} id
   * @param {!T} request
   */
  put(id, request) {
    let list = this.map_[id];
    if (!list) {
      list = this.map_[id] = [];
    }

    list.push(request);
  }

  /**
   * Retrieve an item from the log of requests
   * @param {string} id
   * @return {?T}
   */
  get(id) {
    return this.map_[id];
  }
}

/**
 * @typedef {{
 *   url: string,
 *   body: string
 * }}
 */
let RequestLogDef;

/**
 * Store the given request and report the list of requests so far to the client.
 * @param {string} clientId
 * @param {Request} request
 * @return {!Promise}
 */
async function logRequest(clientId, request) {
  // Get the client and exit early if it's not available. e.g. if it closed
  const client = await self.clients.get(clientId);
  if (!client) {
    return;
  }

  const {url} = request;
  // const contentType = request.headers.get('content-type') || '';

  // let body;
  // if (contentType.indexOf('multipart/form-data') == 0) {
  //   const formData = await request.formData();

  //   const result = {};
  //   for (const [key, value] of formData.entries()) {
  //     result[key] = value;
  //   }
  //   body = result;
  // } else if (contentType.indexOf('application/json') == 0) {
  //   body = await request.json();
  // } else {
  //   body = await request.text();
  // }

  self.requests_.put(clientId, {url, body: {}});

  client.postMessage(self.requests_.get(clientId));
}
