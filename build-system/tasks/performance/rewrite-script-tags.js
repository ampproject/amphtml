const fs = require('fs');
const {
  CDN_URL,
  CONTROL,
  DEFAULT_EXTENSIONS,
  EXPERIMENT,
  INABOX_PATH,
  LOCAL_PATH_REGEXP,
  V0_PATH,
  copyToCache,
  downloadToDisk,
  getLocalPathFromExtension,
  urlToCachePath,
} = require('./helpers');

/**
 * Lookup URL from cache and rewrite URLs to build from working branch
 *
 * @param {string} url
 * @return {Promise<void>}
 */
async function useLocalScripts(url) {
  const cachePath = urlToCachePath(url, EXPERIMENT);
  const document = fs.readFileSync(cachePath);
  const {JSDOM} = await import('jsdom'); // Lazy-imported to speed up task loading.
  const dom = new JSDOM(document);

  const scripts = Array.from(dom.window.document.querySelectorAll('script'));
  for (const script of scripts) {
    const matchArray = script.src.match(LOCAL_PATH_REGEXP);
    // These cases handle real world websites and locally hosted websites
    if (script.src.startsWith(CDN_URL)) {
      const split = script.src.split(CDN_URL)[1];
      script.src = await copyToCache(split);
    } else if (matchArray) {
      script.src = await copyToCache(matchArray[1]);
    } else if (script.src === V0_PATH) {
      script.src = await copyToCache('v0.js');
    } else if (script.src === INABOX_PATH) {
      script.src = await copyToCache('amp4ads-v0.js');
    }
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Lookup URL from cache and download scripts to cache and rewrite URLs to local
 * copy
 *
 * @param {string} url
 * @return {Promise<void>}
 */
async function useRemoteScripts(url) {
  const cachePath = urlToCachePath(url, CONTROL);
  const document = fs.readFileSync(cachePath);
  const {JSDOM} = await import('jsdom'); // Lazy-imported to speed up task loading.
  const dom = new JSDOM(document);

  const scripts = Array.from(dom.window.document.querySelectorAll('script'));
  for (const script of scripts) {
    const matchArray = script.src.match(LOCAL_PATH_REGEXP);
    // These cases handle real world websites and locally hosted websites
    if (script.src.startsWith(CDN_URL)) {
      script.src = await downloadToDisk(script.src);
    } else if (matchArray) {
      script.src = await downloadToDisk(CDN_URL + matchArray[1]);
    } else if (script.src === V0_PATH) {
      script.src = await downloadToDisk(CDN_URL + 'v0.js');
    } else if (script.src === INABOX_PATH) {
      script.src = await downloadToDisk(CDN_URL + 'amp4ads-v0.js');
    }
  }

  fs.writeFileSync(cachePath, dom.serialize());
}

/**
 * Download default extensions that are not explicility stated by script tags in
 * the HTML.
 * @return {Promise<string[]>}
 */
async function downloadDefaultExtensions() {
  return Promise.all(
    DEFAULT_EXTENSIONS.flatMap((extension) => {
      const localPath = getLocalPathFromExtension(extension);
      const cdnUrl = CDN_URL + localPath;
      return [downloadToDisk(cdnUrl), copyToCache(localPath)];
    })
  );
}

/**
 * Rewrite script tags for each document downloaded from the urls
 *
 * @param {!Array<string>} urls
 * @return {Promise<void[]>}
 */
async function rewriteScriptTags(urls) {
  await downloadDefaultExtensions();
  return Promise.all(
    urls.flatMap((url) => [useLocalScripts(url), useRemoteScripts(url)])
  );
}

module.exports = rewriteScriptTags;
