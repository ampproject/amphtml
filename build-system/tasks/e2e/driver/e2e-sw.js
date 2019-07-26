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
      if (!client) {
        return;
      }
      client.postMessage(self.requests_.get(clientId));
    })
  );
});

// TODO(cvializ): This does not get fetches from iframes
// that are defined by a srcdoc, which is needed by amp-analytics.
// This could still be used for the amp-stories case.
// Puppeteer DOES have access to the fetches though.
self.addEventListener('fetch', event => {
  self.requests_ = self.requests_ || new ClientRequests();
  const {clientId, request} = event;
  console.log('uwu', request);
  // Exit if we cannot access the client, e.g. if it's cross-origin
  if (!clientId) {
    return;
  }

  event.waitUntil(logRequest(clientId, request));
});

self.addEventListener('message', event => {
  const {source, data} = event;

  const {id} = source;
  const {name} = data;
  if (name === 'sendRequests') {
    source.postMessage(self.requests_.get(id));
  }
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
 *   headers: Object,
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

  const {headers, url, referrer} = request;
  const headersMap = {};
  // This does not support all headers. e.g. Referrer
  for (const header of headers) {
    const key = header[0];
    const value = header[1];
    headersMap[key] = value;
  }
  headersMap['host'] = new URL(url).host;
  headersMap['referrer'] = referrer;

  self.requests_.put(clientId, {
    url,
    headers: headersMap,
    // TODO(cvializ): Pass the request body
    body: {},
  });

  client.postMessage(self.requests_.get(clientId));
}
