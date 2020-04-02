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

const fs = require('fs');
const {
  CDN_URL,
  CONTROL,
  EXPERIMENT,
  LOCAL_PATH_REGEXP,
  AMP_JS_PATH,
  copyToCache,
  downloadToDisk,
  urlToCachePath,
} = require('./helpers');
const {JSDOM} = require('jsdom');

/**
 * Lookup URL from cache and rewrite URLs to build from working branch
 *
 * @param {string} url
 */
async function useLocalScripts(url) {
  const cachePath = urlToCachePath(url, EXPERIMENT);
  const document = fs.readFileSync(cachePath);
  const dom = new JSDOM(document);

  const scripts = Array.from(dom.window.document.querySelectorAll('script'));
  for (const script of scripts) {
    const matchArray = script.src.match(LOCAL_PATH_REGEXP);
    if (script.src.startsWith(CDN_URL)) {
      const split = script.src.split(CDN_URL)[1];
      script.src = await copyToCache(split);
    } else if (matchArray) {
      script.src = await copyToCache(matchArray[1] + matchArray[2]);
    } else if (script.src === AMP_JS_PATH) {
      script.src = await copyToCache('v0.js');
    }
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Lookup URL from cache and download scripts to cache and rewrite URLs to local copy
 *
 * @param {string} url
 */
async function useRemoteScripts(url) {
  const cachePath = urlToCachePath(url, CONTROL);
  const document = fs.readFileSync(cachePath);
  const dom = new JSDOM(document);

  const scripts = Array.from(dom.window.document.querySelectorAll('script'));
  for (const script of scripts) {
    const matchArray = script.src.match(LOCAL_PATH_REGEXP);
    if (script.src.startsWith(CDN_URL)) {
      script.src = await downloadToDisk(script.src);
    } else if (matchArray) {
      script.src = await downloadToDisk(
        CDN_URL + matchArray[1] + matchArray[2]
      );
    } else if (script.src === AMP_JS_PATH) {
      script.src = await downloadToDisk(CDN_URL + 'v0.js');
    }
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Rewrite script tags for each document downloaded from the urls
 *
 * @param {!Array<string>} urls
 * @return {Promise}
 */
function rewriteScriptTags(urls) {
  return Promise.all(
    urls.flatMap((url) => [useLocalScripts(url), useRemoteScripts(url)])
  );
}

module.exports = rewriteScriptTags;
