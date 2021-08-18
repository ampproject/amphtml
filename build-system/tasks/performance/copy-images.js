

const fs = require('fs');
const {CONTROL, maybeCopyImageToCache, urlToCachePath} = require('./helpers');
const {JSDOM} = require('jsdom');

/**
 * Lookup URL from cache. Inspect tags that could use images.
 *
 * @param {string} url
 * @return {Promise<void>}
 */
async function copyImagesFromTags(url) {
  const cachePath = urlToCachePath(url, CONTROL);
  const document = fs.readFileSync(cachePath);
  const dom = new JSDOM(document);

  copyImagesFromAmpImg(url, dom);
  copyImagesFromAmpVideo(url, dom);
}

/**
 * Copy locally stored images found in the amp-img tags
 * from src and srcset to cache.
 *
 * @param {string} url
 * @param {JSDOM} dom
 */
function copyImagesFromAmpImg(url, dom) {
  const imageTags = Array.from(dom.window.document.querySelectorAll('amp-img'));

  for (const imageTag of imageTags) {
    const src = imageTag.getAttribute('src');
    const srcset = imageTag.getAttribute('srcset');
    if (src) {
      maybeCopyImageToCache(url, src);
    }
    if (srcset) {
      // Get each source path, strip out responsive (1x, 2x..) found at the end
      const sources = srcset.split(',').map((s) => s.trim().split(' ')[0]);
      sources.forEach((srcPath) => maybeCopyImageToCache(url, srcPath));
    }
  }
}

/**
 * Copy locally stored images found in the amp-video tags
 * from artwork to cache.
 *
 * @param {string} url
 * @param {JSDOM} dom
 */
function copyImagesFromAmpVideo(url, dom) {
  const videoTags = Array.from(
    dom.window.document.querySelectorAll('amp-video')
  );
  for (const videoTag of videoTags) {
    const artwork = videoTag.getAttribute('artwork');
    if (artwork) {
      maybeCopyImageToCache(url, artwork);
    }
  }
}

/**
 * Copy locally stored images found in the markup to cache.
 *
 * @param {!Array<string>} urls
 * @return {Promise<void>}
 */
async function copyLocalImages(urls) {
  await Promise.all(urls.map(copyImagesFromTags));
}

module.exports = copyLocalImages;
