import {Services} from '#service';
import {addParamsToUrl, resolveRelativeUrl} from '../../../src/url';
import {
  createElementWithAttributes,
  iterateCursor,
  removeElement,
} from '#core/dom';
import {matches} from '#core/dom/query';
import {toArray} from '#core/types/array';
import {user} from '../../../src/log';

/**
 * Add the caching sources to the video if opted in.
 * The request is sent to the AMP cache url with /mbv path prefix,
 * and appends the document canonical url as the queryParam `amp_video_host_url`.
 *
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @param {number=} maxBitrate
 * @return {!Promise}
 */
export function fetchCachedSources(
  videoEl,
  ampdoc,
  maxBitrate = Number.POSITIVE_INFINITY
) {
  const {win} = ampdoc;
  // Keep non cached evergreen sources for crawlers.
  if (Services.platformFor(win).isBot()) {
    return Promise.resolve();
  }
  if (
    !(
      videoEl.getAttribute('src') ||
      videoEl.querySelector('source[src]')?.getAttribute('src')
    )
  ) {
    user().error('AMP-VIDEO', 'Video cache not properly configured');
    return Promise.resolve();
  }

  Services.performanceFor(ampdoc.win).addEnabledExperiment('video-cache');

  const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(win.document);
  maybeReplaceSrcWithSourceElement(videoEl, win);
  const videoUrl = resolveRelativeUrl(selectVideoSource(videoEl), sourceUrl);
  return getCacheUrlService(videoEl, ampdoc)
    .then((service) => service.createCacheUrl(videoUrl))
    .then((cacheUrl) => {
      const requestUrl = addParamsToUrl(cacheUrl.replace(/\/[ic]\//, '/mbv/'), {
        'amp_video_host_url':
          /* document url that contains the video */ canonicalUrl,
      });
      return Services.xhrFor(win).fetch(requestUrl, {prerenderSafe: true});
    })
    .then((response) => response.json())
    .then((jsonResponse) =>
      applySourcesToVideo(videoEl, jsonResponse['sources'], maxBitrate)
    )
    .catch(() => {
      // If cache fails, video should still load properly.
    });
}

/**
 * Selects and returns the prioritized video source URL
 * @param {!Element} videoEl
 * @return {?string}
 */
function selectVideoSource(videoEl) {
  const possibleSources = toArray(videoEl.querySelectorAll('source[src]'));
  for (let i = 0; i < possibleSources.length; i++) {
    if (matches(possibleSources[i], '[type*="video/mp4"]')) {
      return possibleSources[i].getAttribute('src');
    }
  }
  return possibleSources[0]?.getAttribute('src');
}

/**
 *
 * @param {!Element} videoEl
 * @param {!Array<!Object>} sources
 * @param {number} maxBitrate
 */
function applySourcesToVideo(videoEl, sources, maxBitrate) {
  sources
    .sort((a, b) => a['bitrate_kbps'] - b['bitrate_kbps'])
    .forEach((source) => {
      if (source['bitrate_kbps'] > maxBitrate) {
        return;
      }
      const sourceEl = createElementWithAttributes(
        videoEl.ownerDocument,
        'source',
        {
          'src': source['url'],
          'type': source['type'],
          'data-bitrate': source['bitrate_kbps'],
          'i-amphtml-video-cached-source': '',
        }
      );
      videoEl.insertBefore(sourceEl, videoEl.firstChild);
    });
}

/**
 * If present, moves the src attribute to a source element to enable playing
 * from multiple sources: the cached ones and the fallback initial src.
 * @param {!Element} videoEl
 * @param {!Window} win
 */
function maybeReplaceSrcWithSourceElement(videoEl, win) {
  if (!videoEl.hasAttribute('src')) {
    return;
  }
  const sourceEl = win.document.createElement('source');
  const srcAttr = videoEl.getAttribute('src');
  sourceEl.setAttribute('src', srcAttr);

  const typeAttr = videoEl.getAttribute('type');
  if (typeAttr) {
    sourceEl.setAttribute('type', typeAttr);
  }

  // Remove the src attr so the source children can play.
  videoEl.removeAttribute('src');
  videoEl.removeAttribute('type');

  // Remove all existing sources as they are never supposed to play for a video
  // that has a src, cf https://html.spec.whatwg.org/#concept-media-load-algorithm
  const sourceEls = videoEl.querySelectorAll('source');
  iterateCursor(sourceEls, (el) => removeElement(el));

  videoEl.insertBefore(sourceEl, videoEl.firstChild);
}

/**
 * Lazy loads the amp-cache-url extension if needed and retrieves its service.
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @return {!Promise<../../../amp-cache-url/amp-cache-url.AmpCacheUrlService>}
 */
function getCacheUrlService(videoEl, ampdoc) {
  return Services.extensionsFor(ampdoc.win)
    .installExtensionForDoc(ampdoc, 'amp-cache-url')
    .then(() => Services.cacheUrlServicePromiseForDoc(videoEl));
}
