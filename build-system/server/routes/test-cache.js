/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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
const fetch = require('node-fetch');
const {log} = require('../../common/logging');
const {red, green} = require('kleur/colors');

process.on('exit', shutdownCache);
process.on('SIGINT', () => shutdownCache);
process.on('SIGTERM', () => shutdownCache);

/**
 * Gracefully shutdown the cache connection.
 */
function shutdownCache() {
  // Flush to disk / end connection to cache service.
}

// TODO(rileyajones) DO_NOT_SUBMIT TO BE REPLACED WITH A PROPER CACHE SERVICE.
const CACHE = {};

/** One hour */
const CACHE_DURATION = 1000 * 60 * 60;

/**
 * @param {string} url
 * @return {string|undefined}
 */
function getFromCache(url) {
  const start = Date.now();
  const response = CACHE[url];
  if (response) {
    if (Date.now() - CACHE_DURATION <= response.time) {
      const cacheRetrieveDuration = Date.now() - start;
      log(
        `Retrieved: ${url} from cache`,
        green(`saving ${cacheRetrieveDuration - response.estimatedLatency}ms`)
      );
      return response.value;
    }
    delete CACHE[url];
    log(`Evicting: ${url}`);
  }
}

/**
 * @param {string} url
 * @return {Promise<string>}
 */
function ingestUrl(url) {
  return new Promise(async (resolve, reject) => {
    log(green('Ingesting'), `: ${url}`);
    try {
      const start = Date.now();
      const response = await fetch(url);
      const responseText = await response.text();
      CACHE[url] = {
        estimatedLatency: Date.now() - start,
        time: Date.now(),
        value: response,
      };
      resolve(responseText);
    } catch (e) {
      log(red('ERROR:'), e);
      reject(e);
    }
  });
}

async function retrieveOrFetch(url) {
  return getFromCache(url) || ingestUrl(url);
}

/**
 * If urls response is available in the cache return the cached response.
 * Otherwise fetch the url and store the result.
 * @param {*} req
 * @param {*} res
 */
async function getUrl(req, res) {
  const url = req.url.substring(1);
  try {
    const response = await retrieveOrFetch(url);
    res.send(response);
  } catch (e) {
    res.status(500);
    res.end();
  }
}

module.exports = {
  getUrl,
  shutdownCache,
};
