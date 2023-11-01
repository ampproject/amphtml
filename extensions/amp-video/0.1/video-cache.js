import {createElementWithAttributes, removeElement} from '#core/dom';
import * as Preact from '#core/dom/jsx';
import {matches} from '#core/dom/query';
import {toArray} from '#core/types/array';

import {isExperimentOn} from '#experiments';

import {Services} from '#service';

import {user} from '#utils/log';

import {addParamsToUrl, resolveRelativeUrl} from '../../../src/url';

/** @const {!Array<string>} */
const CODECS_IN_ASCENDING_PRIORITY = ['h264', 'vp09'];

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

  // Always set crossorigin attribute so captions can be set.
  if (!videoEl.hasAttribute('crossorigin')) {
    videoEl.setAttribute('crossorigin', '');
  }

  const videoSrc = videoEl.getAttribute('src');
  const sourceSrc = videoEl.querySelector('source[src]')?.getAttribute('src');
  if (!videoSrc && !sourceSrc) {
    user().error('AMP-VIDEO', 'Video cache not properly configured');
    return Promise.resolve();
  }

  Services.performanceFor(ampdoc.win).addEnabledExperiment('video-cache');

  return requestCachedVideoSources(videoEl, ampdoc)
    .then((response) => {
      applySourcesToVideo(videoEl, response['sources'], maxBitrate);
      if (isExperimentOn(win, 'story-video-cache-apply-audio')) {
        applyAudioInfoToVideo(videoEl, response['has_audio']);
      }
      applyCaptionsTrackToVideo(videoEl, response['captions']);
    })
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
    .sort((a, b) => {
      // This comparator sorts the video sources from least to most preferred.

      const A_GOES_FIRST = -1;
      const B_GOES_FIRST = 1;

      // 'codec' values can contain metadata after the '.' that we must strip
      // for sorting purposes. For example, "vp09.00.30.08" contains level,
      // profile, and color depth values that are ignored in this sort.
      const aCodec = a['codec']?.split('.')[0];
      const bCodec = b['codec']?.split('.')[0];

      // Codec priority is the primary sorting factor of this comparator.
      // The greater the codec priority, the more the source is preferred.
      const aCodecPriority = CODECS_IN_ASCENDING_PRIORITY.indexOf(aCodec);
      const bCodecPriority = CODECS_IN_ASCENDING_PRIORITY.indexOf(bCodec);
      if (aCodecPriority > bCodecPriority) {
        return B_GOES_FIRST;
      }
      if (aCodecPriority < bCodecPriority) {
        return A_GOES_FIRST;
      }

      // Bitrate is the tiebreaking sorting factor of this comparator.
      // The greater the bitrate, the more the source is preferred.
      const aBitrate = a['bitrate_kbps'];
      const bBitrate = b['bitrate_kbps'];
      if (aBitrate > bBitrate) {
        return B_GOES_FIRST;
      }
      if (aBitrate < bBitrate) {
        return A_GOES_FIRST;
      }

      return 0;
    })
    .forEach((source) => {
      // This callback inserts each source as the first child within the video.
      // So, although the sources were just sorted in ascending preference,
      // they are ultimately arranged within the video element in descending
      // preference.

      if (source['bitrate_kbps'] > maxBitrate) {
        return;
      }

      let type = source['type'];
      // If the codec information is available, add it to the type attribute.
      // We do not append H.264 codec strings because, unlike their synonymous
      // AVC codec strings (e.g., "avc1.4d002a"), "h264" is not recognized as a
      // playable type by the browser.
      if (source['codec'] && source['codec'] !== 'h264') {
        type += '; codecs=' + source['codec'];
      }
      const sourceEl = createElementWithAttributes(
        videoEl.ownerDocument,
        'source',
        {
          'src': source['url'],
          type,
          'data-bitrate': source['bitrate_kbps'],
          'i-amphtml-video-cached-source': '',
        }
      );
      videoEl.insertBefore(sourceEl, videoEl.firstChild);
    });
}

/**
 * @param {!Element} videoEl
 * @param {boolean|undefined} hasAudio
 */
function applyAudioInfoToVideo(videoEl, hasAudio) {
  if (hasAudio === false) {
    videoEl.setAttribute('noaudio', '');
  }
}

/**
 * Appends captions track and amp-story-captions to video if captions
 * url is defined and video element doesn't have a track child
 * specified in the document.
 * @param {!Element} videoEl
 * @param {!Object} captionsResponse
 */
function applyCaptionsTrackToVideo(videoEl, captionsResponse) {
  if (
    !captionsResponse ||
    !captionsResponse['src'] ||
    !captionsResponse['srclang'] ||
    videoEl.querySelector('track')
  ) {
    return;
  }

  const trackEl = (
    <track
      src={captionsResponse['src']}
      srclang={captionsResponse['srclang']}
      kind="captions"
    ></track>
  );

  const captionsEl = (
    <amp-story-captions
      id={captionsResponse['src']}
      style-preset="default"
      layout="container"
      auto-append
    ></amp-story-captions>
  );
  // Set captions-id on video to pass track to story-captions.
  videoEl.setAttribute('captions-id', captionsResponse['src']);

  videoEl.appendChild(trackEl);
  videoEl.appendChild(captionsEl);
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
  videoEl.querySelectorAll('source').forEach(removeElement);

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

/**
 * Fetch the sources for the given video element.
 * @param {!Element} videoEl
 * @param {!AmpDoc} ampdoc
 * @return {!Promise<!Object>} JSON representing AMP's cached video sources.
 */
function requestCachedVideoSources(videoEl, ampdoc) {
  const {win} = ampdoc;
  if (shouldUseInlineVideoResponse(videoEl, win)) {
    const inlineResponseEl = win.document.getElementById(
      'amp-google-video-cache-response'
    );
    try {
      const inlineResponseJson = JSON.parse(inlineResponseEl.textContent);
      if (inlineResponseJson['sources']) {
        return Promise.resolve(inlineResponseJson);
      }
    } catch (err) {
      // If parsing the response fails, an XHR request will be made below.
    }
  }

  const {canonicalUrl, sourceUrl} = Services.documentInfoForDoc(win.document);
  maybeReplaceSrcWithSourceElement(videoEl, win);
  const videoUrl = resolveRelativeUrl(selectVideoSource(videoEl), sourceUrl);
  return getCacheUrlService(videoEl, ampdoc)
    .then((service) => service.createCacheUrl(videoUrl))
    .then((cacheUrl) => {
      const requestUrl = addParamsToUrl(cacheUrl.replace(/\/[ic]\//, '/mbv/'), {
        'amp_video_host_url':
          /* document url that contains the video */ canonicalUrl,
        'amp_video_require_acao_header': 1,
      });
      return Services.xhrFor(win)
        .fetch(requestUrl, {prerenderSafe: true})
        .then((xhrResponse) => xhrResponse.json());
    });
}

/**
 * Returns `true` if the video's inline response should be used instead of
 * issuing an XHR request.
 * @param {!Element} videoEl
 * @param {!Window} win
 * @return {boolean}
 */
function shouldUseInlineVideoResponse(videoEl, win) {
  // Google video cache inlines the first video of the first web story page.
  const firstVid = win.document.querySelector(
    'amp-story-page:first-of-type amp-video'
  );
  return videoEl === firstVid;
}
