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

import '../../third_party/babel/custom-babel-helpers';
import {urls} from '../config';

/**
 * An AMP Release version, not to be confused with an RTV version
 * @typedef {string}
 */
export let AmpVersion;

/**
 * An RTV version, not to be confused with an AMP Release version.
 * @typedef {string}
 */
export let RtvVersion;

/**
 * An environment of the RTV version.
 * @typedef {string}
 */
export let RtvEnvironment;

/** @const */
const TAG = 'cache-service-worker';

/**
 * A list of blacklisted AMP versions that must never be served from
 * cache. Versions may be blacklisted if they contain a significant
 * implementation bug.
 * @type {!Array<AmpVersion>}
 */
const BLACKLIST = self.AMP_CONFIG[`${TAG}-blacklist`] || [];

/**
 * The SW's current version.
 * @const
 * @type {RtvVersion}
 */
const BASE_RTV_VERSION = self.AMP_CONFIG.v;

/**
 * The SW's current environment.
 * @const
 * @type {RtvEnvironment}
 */
const BASE_RTV_ENVIRONMENT = BASE_RTV_VERSION.substr(0, 2);

/**
 * Our cache of CDN JS files.
 *
 * @type {!Cache}
 */
let cache;

/**
 * A mapping from a Client's (unique per tab _and_ refresh) ID to the AMP
 * release version we are serving it.
 *
 * @type {!Object<string, !Promise<!RtvVersion>>}
 */
const clientsVersion = Object.create(null);

/**
 * A mapping from a client's referrer into the time that referrer last made a
 * request. This is used as a fallback to a clientId for Foreign Fetch, since
 * it does not provide a unique clientId.
 *
 * This object will hopefully not grow too large. When the SW is terminated,
 * it'll use a brand new object on restart.
 *
 * @type {!Object<string, number>}
 */
const referrersLastRequestTime = Object.create(null);

/**
 * A mapping from a URL to a fetch request for that URL. This is used to batch
 * repeated requests into a single fetch. This batching is deleted after the
 * fetch completes.
 *
 * @type {!Object<string, !Promise<!Response>>}
 */
const fetchPromises = Object.create(null);


/**
 * A regex that matches every CDN JS URL we care to cache.
 * The "experiments" and "validator" JS is explicitly disallowed.
 *
 * The RTV will be the first capture group, if it is present.
 * The pathname will be the second capture group.
 *
 * Matched URLS include:
 *  - https://cdn.ampproject.org/v0.js
 *  - https://cdn.ampproject.org/v0/amp-comp.js
 *  - https://cdn.ampproject.org/rtv/123456789012345/v0.js
 *  - https://cdn.ampproject.org/rtv/123456789012345/v0/amp-comp.js
 *
 * Unmatched URLS include:
 *  - https://cdn.ampproject.org/v0/experiments.js
 *  - https://cdn.ampproject.org/v0/validator.js
 */
const CDN_JS_REGEX = new RegExp(
    // Require the CDN URL origin at the beginning.
    `^${urls.cdn.replace(/\./g, '\\.')}` +
    // Allow, but don't require, RTV.
    `(?:/rtv/((\\d{2})\\d{13,}))?` +
    // Require text "/v0"
    `(/v0` +
      // Allow, but don't require, an extension under the v0 directory.
      // We explicitly forbid the `experiments` and `validator` "extension".
      `(?:/(?!experiments|validator).+)?` +
    // Require text ".js" at the end.
    `\\.js)$`);


/**
 * Determines if a URL is a request to a CDN JS file.
 * @param {string} url
 * @return {boolean}
 * @visibleForTesting
 */
export function isCdnJsFile(url) {
  return CDN_JS_REGEX.test(url);
}

/**
 * Extracts the data from the request URL.
 * @param {string} url
 * @return {{
 *   environment: !RtvEnvironment,
 *   explicitRtv: !RtvVersion,
 *   pathname: string,
 *   rtv: !RtvVersion,
 * }|null}
 * @visibleForTesting
 */
export function requestData(url) {
  const match = CDN_JS_REGEX.exec(url);
  if (!match) {
    return null;
  }
  return {
    environment: match[2] || BASE_RTV_ENVIRONMENT,
    explicitRtv: match[1] || '',
    pathname: match[3],
    rtv: match[1] || BASE_RTV_VERSION,
  };
}

/**
 * Returns the URL with the requested version changed to `version`.
 *
 * @param {string} url
 * @param {!RtvVersion} version
 * @return {string}
 * @visibleForTesting
 */
export function urlWithVersion(url, version) {
  const data = requestData(url);
  if (!data) {
    return url;
  }
  const {explicitRtv, pathname} = data;
  if (explicitRtv) {
    return url.replace(explicitRtv, version);
  }
  return url.replace(pathname, `/rtv/${version}${pathname}`);
}

/**
 * Normalizes the request to a new RTV version. This handles changing the
 * request from one version to another, or rewriting an unversioned request to
 * a versioned.
 *
 * @param {!Request} request
 * @param {!RtvVersion} version
 * @return {!Request}
 */
function normalizedRequest(request, version) {
  const url = request.url;
  const data = requestData(url);
  if (data && data.explicitRtv === version) {
    return request;
  }

  return new Request(urlWithVersion(url, version), {
    // For Foreign Fetch, constructing a request using an origin that does
    // not match the SW's is mutinous.
    referer: `${urls.cdn}/sw.js`,
    headers: request.headers,
    method: request.method,
    mode: request.mode,
    credentials: request.credentials,
    cache: request.cache,
    redirect: request.redirect,
    integrity: request.integrity,
  });
}

/**
 * Determines if a AMP version is blacklisted.
 * @param {!RtvVersion} version
 * @return {boolean}
 * @visibleForTesting
 */
export function isBlacklisted(version) {
  /**
   * Trim the RTV perfix.
   * @type {AmpVersion}
   */
  const ampVersion = version.substr(2);
  return BLACKLIST.indexOf(ampVersion) > -1;
}

/**
 * Generates a clientId for Foreign Fetchs, since one is not provided.
 *
 * The current strategy is to batch all requests from referrer that happen
 * within 60 seconds (of the first request) into one clientId.
 *
 * @param {string} referrer
 * @return {string}
 * @visibleForTesting
 */
export function generateFallbackClientId(referrer) {
  const now = Date.now();
  let lastRequestTime = referrersLastRequestTime[referrer] || 0;

  // If last request was more than 60 seconds ago, we are now in a new
  // "clientId".
  if (lastRequestTime < now - (60 * 1000)) {
    lastRequestTime = referrersLastRequestTime[referrer] = now;
  }

  return referrer + lastRequestTime;
}

/**
 * Fetches a URL, and stores it into the cache if the response is valid.
 * Repeated fetches of the same URL will be batched into a single request while
 * the first is still fetching.
 *
 * @param {!Cache} cache
 * @param {!Request} request
 * @return {!Promise<!Response>}
 * @visibleForTesting
 */
export function fetchAndCache(cache, request) {
  const url = request.url;

  // Batch fetches. Mainly for the /diversions endpoint.
  if (fetchPromises[url]) {
    return fetchPromises[url].then(() => {
      return cache.match(request);
    });
  }

  return fetchPromises[url] = cache.match(request)
      .then(response => {
        if (response && !expired(response)) {
          delete fetchPromises[url];
          return response;
        }

        return fetch(request).then(response => {
          delete fetchPromises[url];

          // Did we receive a invalid response?
          if (!response.ok) {
            throw new Error(`fetching ${url} failed with statusCode ` +
                `${response.status}.`);
          }

          // You must clone to prevent double reading the body.
          cache.put(request, response.clone());
          return response;
        }, err => {
          delete fetchPromises[url];
          throw err;
        });
      });
}

/**
 * Checks if a (valid) response has expired.
 *
 * @param {!Response} response
 * @return {boolean}
 * @visibleForTesting
 */
export function expired(response) {
  const {headers} = response;

  if (!headers.has('date') || !headers.has('cache-control')) {
    return true;
  }

  const maxAge = /max-age=(\d+)/i.exec(headers.get('cache-control'));
  const date = headers.get('date');
  const age = maxAge ? maxAge[1] * 1000 : -Infinity;
  return Date.now() >= Number(new Date(date)) + age;
}

/**
 * Returns the active percent diversions.
 *
 * @param {!Cache} cache
 * @return {!Promise<!Array<!RtvVersion>>}
 * @visibleForTesting
 */
export function diversions(cache) {
  const request = new Request(`${urls.cdn}/diversions`);

  return fetchAndCache(cache, request).then(response => {
    return response.json();
  }).then(diversions => {
    if (!Array.isArray(diversions)) {
      return null;
    }

    return diversions;
  }, () => null);
}

/*
 * Resets clientsVersion, referrersLastRequestTime, and fetchPromises.
 * @visibleForTesting
 */
export function resetMemosForTesting() {
  for (const key in clientsVersion) {
    delete clientsVersion[key];
  }
  for (const key in referrersLastRequestTime) {
    delete referrersLastRequestTime[key];
  }
  for (const key in fetchPromises) {
    delete fetchPromises[key];
  }
}


/**
 * A promise to open up our CDN JS cache, which will be resolved before any
 * requests are intercepted by the SW.
 *
 * @type {!Promise}
 */
const cachePromise = self.caches.open('cdn-js').then(result => {
  cache = result;
});

/**
 * Fetches the request, and stores it in the cache. Since we only store one
 * version of each file, we'll prune all older versions after we cache this.
 *
 * @param {!Cache} cache
 * @param {!Request} request
 * @param {string} requestPath the pathname of the request
 * @param {!RtvVersion} requestVersion the version of the request
 * @return {!Promise<!Response>}
 * @visibleForTesting
 */
export function fetchJsFile(cache, request, requestPath, requestVersion) {
  // TODO(jridgewell): we should also fetch this requestVersion for all files
  // we know about.
  return fetchAndCache(cache, request).then(response => {
    // Fetch all diversions of this file.
    // This intentionally does not block the request resolution to speed
    // things up.
    diversions(cache).then(diversions => {
      // Prune old versions from the cache.
      // This also prunes old diversions of other scripts, see purge for
      // detailed information.
      purge(cache, requestPath, requestVersion, diversions);

      if (!diversions) {
        return;
      }
      let p = new Promise(resolve => {
        // Delay initial diversions requests by 10 seconds.
        // This is because diversions are low priority compared to page
        // content.
        setTimeout(resolve, 10000);
      });
      for (let i = 0; i < diversions.length; i++) {
        p = p.then(() => {
          const diversionRequest = normalizedRequest(request, diversions[i]);
          return fetchAndCache(cache, diversionRequest);
        });
      }
    });

    return response;
  });
}

/**
 * Purges our cache of old files.
 * - If path and version are given, then we will only delete files that match
 *   path but are not version. I.e., we we clean up old versions of path.
 * - Else, we cleanup any non-production script that's not a current diversion.
 *
 * @param {!Cache} cache
 * @param {string} path
 * @param {string} version
 * @param {?Array<!RtvVersion>} diversions
 * @return {!Promise<undefined>}
 */
function purge(cache, path, version, diversions) {
  return cache.keys().then(requests => {
    for (let i = 0; i < requests.length; i++) {
      const request = requests[i];
      const url = request.url;
      const cachedData = requestData(url);
      if (!cachedData) {
        continue;
      }

      if (path === cachedData.pathname) {
        // This is case 1.
        if (version === cachedData.rtv) {
          continue;
        }
      } else {
        // This is case 2.
        if (BASE_RTV_ENVIRONMENT === cachedData.environment) {
          continue;
        }
      }

      if (diversions) {
        // This is case 3.
        if (diversions.indexOf(cachedData.rtv) > -1) {
          continue;
        }
      } else {
        // This is case 4.
        if (BASE_RTV_ENVIRONMENT !== cachedData.environment) {
          continue;
        }
      }

      // At this point, we know the cached file is either:
      // - An old production env of newly fetched script (falls through case
      //   1 and 3).
      // - An old diversion of newly fetched script (falls through case 1 and
      //   3).
      // - An old diversion of any other script (falls through case 2 and  3).
      // Importantly, it CANNOT be one of the following:
      // - The newly fetched version script (case 1)
      // - Any production env of any other script (case 2)
      // - A current diversion the newly fetched script (case 3)
      // - A current diversion of any other script (case 3)
      // - Any suspected diversion of the newly fetched script (case 4)
      // - Any suspected diversion of any other script (case 4)
      //
      // Note case 2 and 4 guarantee truthiness, so other scripts won't be
      // deleted unless they're guaranteed old diversions.
      cache.delete(request);
    }
  });
}

/**
 * Gets the version we want to serve for this client. We attempt to serve the
 * version with the most cached files, with a additional weight given to the
 * main binary and the first requested file.
 *
 * @param {!Cache} cache
 * @param {string} requestPath
 * @param {!RtvVersion} requestVersion
 * @param {!RtvEnvironment} requestEnv
 * @return {!Promise<!RtvVersion>}
 * @visibleForTesting
 */
export function getCachedVersion(cache, requestPath, requestVersion,
    requestEnv) {

  // If a request comes in for a version that does not match the SW's
  // environment (eg, a percent diversion when the SW is using the production
  // env), we must serve with the requested version.
  if (requestEnv !== BASE_RTV_ENVIRONMENT) {
    return Promise.resolve(requestVersion);
  }

  // TODO(jridgewell): Maybe we should add a very short delay (~5ms) to collect
  // several requests. Then, use all requests to determine what to serve.
  return cache.keys().then(requests => {
    const counts = {};
    let most = requestVersion;
    let mostCount = 0;

    // Generates a weighted maximum version, ie the version with the most
    // cached files. Given every file we've cached, determine what version
    // it is, and increment the number of files we have for that version.
    for (let i = 0; i < requests.length; i++) {
      const url = requests[i].url;
      const data = requestData(url);
      if (!data) {
        continue;
      }

      const {pathname, rtv, environment} = data;

      // We will not stale serve a version that does not match the request's
      // environment. This is so cached percent diversions will not be "stale"
      // served when requesting a production script.
      if (requestEnv !== environment) {
        continue;
      }

      // We do not want to stale serve blacklisted files. If nothing else is
      // cached, we will end up serving whatever version is requested.
      if (isBlacklisted(rtv)) {
        continue;
      }

      let count = counts[rtv] || 0;

      // Incrementing the number of "files" that have this version with a
      // weight.
      // The main binary (arguably the most important file to cache) is given a
      // heavy weight, while the first requested file is given a slight weight.
      // Everything else increments normally.
      if (pathname.indexOf('/', 1) === -1) {
        // Main binary
        count += 5;
      } else if (requestPath === pathname) {
        // Give a little precedence to the requested file
        count += 2;
      } else {
        count++;
      }

      counts[rtv] = count;
      if (count > mostCount) {
        most = rtv;
        mostCount = count;
      }
    }

    return most;
  });
}

/**
 * Handles fetching the request from Cache, or fetching and caching from the
 * Cache CDN, if we care about the request.
 * My assumptions:
 *   - Doc requests one uniform AMP release version for all files, anything
 *     else is malarkey.
 *   - The requested version is always the newest AMP version.
 *
 * @param {!Request} request
 * @param {string|undefined} maybeClientId
 * @return {?Promise<!Response>}
 * @visibleForTesting
 */
export function handleFetch(request, maybeClientId) {
  const url = request.url;
  // We only cache CDN JS files, and we need a clientId to do our magic.
  const data = requestData(url);

  if (!maybeClientId || !data) {
    return null;
  }

  // Closure Compiler!
  const clientId = /** @type {string} */(maybeClientId);
  const {pathname, rtv, environment} = data;

  // Rewrite unversioned requests to the versioned RTV URL. This is a noop if
  // it's already versioned.
  request = normalizedRequest(request, rtv);

  // Wait for the cachePromise to resolve. This is necessary
  // since the SW thread may be killed and restarted at any time.
  return cachePromise.then(() => {
    // If we already registered this client, we must always use the same
    // version.
    if (clientsVersion[clientId]) {
      return clientsVersion[clientId];
    }

    // If not, let's find the version to serve up.
    return clientsVersion[clientId] = getCachedVersion(cache, pathname, rtv,
        environment);
  }).then(version => {
    const versionedRequest = normalizedRequest(request, version);

    return cache.match(versionedRequest).then(response => {
      // Cache hit!
      if (response) {
        // Now, was it because we served an old cached version or because
        // they requested this exact version; If we served an old version,
        // let's get the new one.
        if (version !== rtv && rtv == BASE_RTV_VERSION) {
          fetchJsFile(cache, request, pathname, rtv);
        }

        return response;
      }

      // If not, let's fetch and cache the request.
      return fetchJsFile(cache, versionedRequest, pathname, version);
    });
  });
}


self.addEventListener('install', install => {
  install.waitUntil(cachePromise);
  // Registers the SW for Foreign Fetch events, if they are supported.
  if (install.registerForeignFetch) {
    install.registerForeignFetch({
      scopes: [/** @type {!ServiceWorkerGlobalScope} */(
          self).registration.scope],
      origins: ['*'],
    });
  }
});

// Setup the Fetch listener, for when the client is on the CDN origin.
self.addEventListener('fetch', event => {
  const response = handleFetch(event.request, event.clientId);

  // We only get a response promise back if it's a request we care to cache.
  if (!response) {
    return;
  }

  event.respondWith(response);
});

// Setup the Foreign Fetch listener, for when the client is on a Publisher
// origin.
self.addEventListener('foreignfetch', event => {
  const response = handleFetch(event.request,
      (event.clientId || generateFallbackClientId(event.request.referrer)));

  // We only get a response promise back if it's a request we care to cache.
  if (!response) {
    return;
  }

  event.respondWith(response.then(resp => {
    // Foreign Fetch requires a { response: !Response } object.
    return {
      response: resp,
      // This allows CORS requests, if one were to come in.
      origin: event.origin,
    };
  }));
});
