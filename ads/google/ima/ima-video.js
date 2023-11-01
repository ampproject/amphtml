import {loadScript} from '#3p/3p';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';
import {htmlFor, htmlRefs, svgFor} from '#core/dom/static-template';
import {camelCaseToTitleCase, setStyle, toggle} from '#core/dom/style';
import {isArray, isObject} from '#core/types';
import {throttle} from '#core/types/function';
import {tryParseJson} from '#core/types/object/json';

import {getData} from '#utils/event-helper';

// Source for this constant is css/amp-ima-video-iframe.css
import {addParamToUrl} from 'src/url';

import {ImaPlayerData} from './ima-player-data';

import {cssText} from '../../../build/amp-ima-video-iframe.css';

/**
 * Possible player states.
 * @enum {number}
 * @private
 */
const PlayerStates = {
  PLAYING: 1,
  PAUSED: 2,
};

/**
 * Icons from Google Material Icons
 * https://material.io/tools/icons
 */
const icons = {
  play: (svg) => svg`
    <svg viewBox="0 0 24 24">
      <path d="M8 5v14l11-7z"></path>
    </svg>
  `,
  pause: (svg) => svg`
    <svg viewBox="0 0 24 24">
      <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
      <path d="M0 0h24v24H0z" fill="none"></path>
    </svg>
  `,
  fullscreen: (svg) => svg`
    <svg viewBox="0 0 24 24">
      <path d="M0 0h24v24H0z" fill="none"></path>
      <path
        d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"
      ></path>
    </svg>
  `,
  muted: (svg) => svg`
    <svg viewBox="0 0 24 24">
      <path
        d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"
      ></path>
      <path d="M0 0h24v24H0z" fill="none"></path>
    </svg>
  `,
  volumeMax: (svg) => svg`
    <svg viewBox="0 0 24 24">
      <path
        d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"
      ></path>
      <path d="M0 0h24v24H0z" fill="none"></path>
    </svg>
  `,
};

// References to rendered elements. See renderElements().
let elements;

// Event indicating user interaction.
let interactEvent;

// Event for mouse down.
let mouseDownEvent;

// Event for mouse move.
let mouseMoveEvent;

// Event for mouse up.
let mouseUpEvent;

// Percent of the way through the video the user has seeked. Used for seek
// events.
let seekPercent;

// Flag tracking whether or not content has played to completion.
let contentComplete;

// Flag tracking whether or not all ads have been played and been completed.
let allAdsCompleted;

// Flag tracking if an ad request has failed.
let adRequestFailed;

// IMA SDK Ad object
let currentAd;

// IMA SDK AdDisplayContainer object.
let adDisplayContainer;

// IMA SDK AdsRequest object.
let adsRequest;

// IMA SDK AdsLoader object.
let adsLoader;

// IMA SDK AdsManager object;
let adsManager;

// Timer for UI updates.
let uiTicker;

// Tracks the current state of the player.
let playerState;

// Flag for whether or not we are currently in fullscreen mode.
let fullscreen;

// Width the player should be in fullscreen mode.
let fullscreenWidth;

// Height the player should be in fullscreen mode.
let fullscreenHeight;

// "Ad" label used in ad controls.
let adLabel;

// Flag tracking if ads are currently active.
let adsActive;

// Flag tracking if playback has started.
let playbackStarted;

// Flag for video's controls first being shown.
let showControlsFirstCalled;

// Flag to indicate that showControls() should
// not take immediate effect: i.e. the case when
// hideControls() is called before controls are
// visible.
let hideControlsQueued;

// Boolean tracking if controls are hidden or shown
let controlsVisible;

// Timer used to hide controls after user action.
let hideControlsTimeout;

// Flag tracking if we need to mute the ads manager once it loads. Used for
// autoplay.
let muteAdsManagerOnLoaded;

// Flag tracking if we are in native fullscreen mode. Used for iPhone.
let nativeFullscreen;

// Flag tracking if the IMA library was allowed to load. Will be set to false
// when e.g. a user is using an ad blocker.
let imaLoadAllowed;

// Used if the adsManager needs to be resized on load.
let adsManagerWidthOnLoad, adsManagerHeightOnLoad;

// Initial video dimensions.
let videoWidth, videoHeight;

// IMASettings provided via <script> tag in parent element.
let imaSettings;

// Player data used for video analytics.
const playerData = new ImaPlayerData();

// Flag used to track if ads have been requested or not.
let adsRequested;

// Flag that tracks if the user tapped and dragged on the overlay button.
let userTappedAndDragged;

// global context
let context;

// Throttle for the showControls() function
let showControlsThrottled = throttle(window, showControls, 1000);

/**
 * @param {!Node} parent
 * @param {string} css
 */
function insertCss(parent, css) {
  const style = parent.ownerDocument.createElement('style');
  style./*OK*/ textContent = css;
  parent.appendChild(style);
}

/**
 * @param {string} state
 * @param {boolean} active
 */
function toggleRootDataAttribute(state, active) {
  const {'root': root} = elements;
  const attributeName = `data-${state}`;
  if (active) {
    root.setAttribute(attributeName, '');
  } else {
    root.removeAttribute(attributeName);
  }
}

/**
 * @param {Document} elementOrDoc
 * @return {!{[key: string]: !Element}}
 */
function renderElements(elementOrDoc) {
  const html = htmlFor(elementOrDoc);

  // Elements annotated with `ref="name"` are referenced as `elements['name']`.
  // They also have their `ref` copied as a classname, so they can be selected
  // from CSS using that exact value.
  const root = html`
    <div class="fill">
      <div class="fill">
        <video
          ref="video"
          playsinline
          controlslist="nodownload nofullscreen noremoteplayback"
        >
          <!-- Video children are later propagated from the iframe's name. -->
        </video>
      </div>

      <div ref="adContainer" class="fill" hidden>
        <!-- This subtree may be modified by the IMA SDK. -->
      </div>

      <div ref="controls" hidden>
        <button ref="playButton"></button>

        <div class="countdownWrapper">
          <div ref="countdown">
            <!-- Text content updated using data-ad-label onAdProgress(). -->
          </div>
        </div>

        <div ref="time">-:-</div>

        <div ref="progress" hidden>
          <div ref="progressLine"></div>
          <div ref="progressMarker"></div>
        </div>

        <button ref="muteButton"></button>
        <button ref="fullscreenButton"></button>
      </div>

      <button ref="overlayButton" class="fill"></button>
    </div>
  `;

  const elements = htmlRefs(root);

  // The root element cannot be referenced by `ref="root"`, so we insert it.
  elements['root'] = root;

  // For a smaller template, we copy each element's `ref` value as a classname.
  for (const ref in elements) {
    elements[ref].classList.add(ref);
  }

  // Adding SVGs separately because they require a different namespace, and the
  // HTML template must be static.
  const svg = svgFor(elementOrDoc);

  elements['overlayButton'].appendChild(icons.play(svg));
  elements['fullscreenButton'].appendChild(icons.fullscreen(svg));

  // Buttons toggle SVGs by including two each, one is displayed at a time.
  // See CSS selectors for buttons under .root[data-*].
  const {'muteButton': muteButton, 'playButton': playButton} = elements;

  playButton.appendChild(icons.play(svg));
  playButton.appendChild(icons.pause(svg));

  muteButton.appendChild(icons.volumeMax(svg));
  muteButton.appendChild(icons.muted(svg));

  return elements;
}

/**
 * @param {!Document} document
 * @param {!Element} parent
 * @param {?Array<Array<string|Object>>} childrenDef
 *   an array of [tagName, attributes] items like:
 *     [
 *       ['SOURCE', {'src': 'foo.mp4'}],
 *       ['TRACK', {'src': 'bar.mp4'}],
 *     ]
 */
function maybeAppendChildren(document, parent, childrenDef) {
  if (!isArray(childrenDef)) {
    return;
  }
  childrenDef.forEach((child) => {
    const tagName = child[0];
    const attributes = child[1];
    if (
      !(
        typeof tagName === 'string' &&
        typeof attributes === 'object' &&
        attributes != null
      )
    ) {
      throw new Error(child);
    }
    const element = document.createElement(tagName);
    for (const attr in attributes) {
      element.setAttribute(attr, attributes[attr]);
    }
    parent.appendChild(element);
  });
}

/**
 * @param {!Object} global
 * @param {!Object} data
 */
export function imaVideo(global, data) {
  context = global.context;

  insertCss(global.document.head, cssText);

  videoWidth = global./*OK*/ innerWidth;
  videoHeight = global./*OK*/ innerHeight;
  adLabel = data.adLabel || 'Ad (%s of %s)';

  elements = renderElements(global.document);

  controlsVisible = false;

  // Propagate settings and video element's children.
  const {'video': video} = elements;
  video.setAttribute('poster', data.poster);
  if (data['crossorigin'] != null) {
    video.setAttribute('crossorigin', data['crossorigin']);
  }
  if (data.src) {
    const sourceElement = document.createElement('source');
    sourceElement.setAttribute('src', data.src);
    video.appendChild(sourceElement);
  }
  maybeAppendChildren(
    global.document,
    video,
    tryParseJson(data['sourceChildren'])
  );

  if (data.imaSettings) {
    imaSettings = tryParseJson(data.imaSettings);
  }

  global.document.getElementById('c').appendChild(elements['root']);

  // Attach events and configure IMA SDK.

  window.addEventListener('message', onMessage.bind(null, global));

  hideControlsQueued = false;
  showControlsFirstCalled = false;
  contentComplete = false;
  adsActive = false;
  allAdsCompleted = false;
  playbackStarted = false;
  nativeFullscreen = false;
  imaLoadAllowed = true;

  const {
    'fullscreenButton': fullscreenButton,
    'muteButton': muteButton,
    'playButton': playButton,
    'progress': progress,
  } = elements;

  let mobileBrowser = false;
  interactEvent = 'click';
  mouseDownEvent = 'mousedown';
  mouseMoveEvent = 'mousemove';
  mouseUpEvent = 'mouseup';
  if (
    navigator.userAgent.match(/iPhone/i) ||
    navigator.userAgent.match(/iPad/i) ||
    navigator.userAgent.match(/Android/i)
  ) {
    mobileBrowser = true;
    interactEvent = 'touchend';
    mouseDownEvent = 'touchstart';
    mouseMoveEvent = 'touchmove';
    mouseUpEvent = 'touchend';
  }
  const {'overlayButton': overlayButton} = elements;
  if (mobileBrowser) {
    // Create our own tap listener that ignores tap and drag.
    overlayButton.addEventListener(mouseMoveEvent, onOverlayButtonTouchMove);
    overlayButton.addEventListener(mouseUpEvent, onOverlayButtonTouchEnd);
    overlayButton.addEventListener(
      'tapwithoutdrag',
      onOverlayButtonInteract.bind(null, global)
    );
  } else {
    overlayButton.addEventListener(
      interactEvent,
      onOverlayButtonInteract.bind(null, global)
    );
  }
  playButton.addEventListener(interactEvent, onPlayPauseClick);
  progress.addEventListener(mouseDownEvent, onProgressClick);
  muteButton.addEventListener(interactEvent, onMuteUnmuteClick);
  fullscreenButton.addEventListener(
    interactEvent,
    toggleFullscreen.bind(null, global)
  );

  // Timeout is 1s, because showControls will hide after 3s
  showControlsThrottled = throttle(window, showControls, 1000);

  const fullScreenEvents = [
    'fullscreenchange',
    'mozfullscreenchange',
    'webkitfullscreenchange',
  ];
  fullScreenEvents.forEach((fsEvent) => {
    global.document.addEventListener(
      fsEvent,
      onFullscreenChange.bind(null, global),
      false
    );
  });

  if (context.initialConsentState == CONSENT_POLICY_STATE.UNKNOWN) {
    // On unknown consent state, do not load IMA. Treat this the same as if IMA
    // failed to load.
    onImaLoadFail();
  } else {
    // Set-up code that can't run until the IMA lib loads.
    loadScript(
      /** @type {!Window} */ (global),
      'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
      () => onImaLoadSuccess(global, data),
      onImaLoadFail
    );
  }
}

/**
 * Adds the appropriate event listener to an element
 * to represent a hover state.
 *
 * NOTE: This does not add a throttler,
 * since this is applied per element,
 * and would require wrapping the callback.
 * Thus, the callback passed should be,
 * appropriately throttled. See showControlsThrottled.
 *
 * @param {!Element} element
 * @param {!Function} callback
 */
export function addHoverEventToElement(element, callback) {
  element.addEventListener(interactEvent, callback);
  element.addEventListener(mouseMoveEvent, callback);
}

/**
 * Removes the appropriate event listener from an element
 * that represented a hover state.
 * @param {!Element} element
 * @param {!Function} callback
 */
export function removeHoverEventFromElement(element, callback) {
  element.removeEventListener(interactEvent, callback);
  element.removeEventListener(mouseMoveEvent, callback);
}

/**
 * @param {!Object} global
 * @param {!Object} data
 */
function onImaLoadSuccess(global, data) {
  // This is the first place where we have access to any IMA objects.

  // Handle settings that need to be set before the AdDisplayContainer is
  // created.
  if (imaSettings) {
    if (imaSettings['locale']) {
      global.google.ima.settings.setLocale(imaSettings['locale']);
    }
    if (imaSettings['vpaidMode']) {
      global.google.ima.settings.setVpaidMode(imaSettings['vpaidMode']);
    }
  }

  const {'adContainer': adContainer, 'video': video} = elements;

  adDisplayContainer = new global.google.ima.AdDisplayContainer(
    adContainer,
    video
  );

  adsLoader = new global.google.ima.AdsLoader(adDisplayContainer);
  adsLoader.getSettings().setPlayerType('amp-ima');
  adsLoader.getSettings().setPlayerVersion('0.1');
  // Propogate settings provided via child script tag.
  // locale and vpaidMode are set above, as they must be set before we create
  // an AdDisplayContainer.
  // playerType and playerVersion are used by the developers to track usage,
  // so we do not want to allow users to overwrite those values.
  const skippedSettings = [
    'locale',
    'vpaidMode',
    'playerType',
    'playerVersion',
  ];
  for (const setting in imaSettings) {
    if (!skippedSettings.includes(setting)) {
      // Change e.g. 'ppid' to 'setPpid'.
      const methodName = 'set' + camelCaseToTitleCase(setting);
      if (typeof adsLoader.getSettings()[methodName] === 'function') {
        adsLoader.getSettings()[methodName](imaSettings[setting]);
      }
    }
  }
  adsLoader.addEventListener(
    global.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
    onAdsManagerLoaded.bind(null, global),
    false
  );
  adsLoader.addEventListener(
    global.google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdsLoaderError,
    false
  );

  video.addEventListener('ended', onContentEnded);

  adsRequest = new global.google.ima.AdsRequest();
  adsRequest.adTagUrl = data.tag;
  adsRequest.linearAdSlotWidth = videoWidth;
  adsRequest.linearAdSlotHeight = videoHeight;
  adsRequest.nonLinearAdSlotWidth = videoWidth;
  adsRequest.nonLinearAdSlotHeight = videoHeight / 3;

  if (!data['delayAdRequest']) {
    requestAds();
  } else {
    // Let amp-ima-video know that we are done set-up.
    postMessage({event: VideoEvents_Enum.LOAD});
  }
}

/**
 * Handler for on fail.
 */
function onImaLoadFail() {
  // Something blocked ima3.js from loading - ignore all IMA stuff and just play
  // content.
  addHoverEventToElement(
    /** @type {!Element} */ (elements['video']),
    showControlsThrottled
  );
  imaLoadAllowed = false;
  postMessage({event: VideoEvents_Enum.LOAD});
}

/**
 * Triggered when the user clicks on the overlay button.
 * @param {!Object} global
 * @visibleForTesting
 */
export function onOverlayButtonInteract(global) {
  const {'overlayButton': overlayButton, 'video': video} = elements;
  if (playbackStarted) {
    // Resart the video
    playVideo();
  } else {
    // Play the video for the first time
    playbackStarted = true;
    uiTicker = setInterval(uiTickerClick, 500);
    setInterval(playerDataTick, 1000);
    if (adDisplayContainer) {
      adDisplayContainer.initialize();
    }
    video.load();
    playAds(global);
  }

  toggle(overlayButton, false);
}

// TODO(alanorozco): Update name on test's end.
export const onBigPlayClick = onOverlayButtonInteract;

/**
 * Triggered when the user ends a tap on the overlay button.
 * @param {Event} event
 */
function onOverlayButtonTouchEnd(event) {
  if (userTappedAndDragged) {
    // Reset state and ignore this tap.
    userTappedAndDragged = false;
  } else {
    const tapWithoutDragEvent = new Event('tapwithoutdrag');
    event.currentTarget.dispatchEvent(tapWithoutDragEvent);
  }
}

/**
 * Triggered when the user moves a tap on the overlay button.
 */
function onOverlayButtonTouchMove() {
  userTappedAndDragged = true;
}

/**
 * Requests ads.
 */
export function requestAds() {
  adsRequested = true;
  adRequestFailed = false;
  const {initialConsentState} = context;
  if (initialConsentState == CONSENT_POLICY_STATE.UNKNOWN) {
    // We're unaware of the user's consent state - do not request ads.
    imaLoadAllowed = false;
    return;
  }
  adsRequest.adTagUrl = addParamsToAdTagUrl(adsRequest.adTagUrl);
  adsLoader.requestAds(adsRequest);
}

/**
 * @param {string} url
 * @return {string}
 */
function addParamsToAdTagUrl(url) {
  const {initialConsentMetadata, initialConsentState, initialConsentValue} =
    context;
  if (initialConsentState == CONSENT_POLICY_STATE.INSUFFICIENT) {
    // User has provided consent state but has not consented to personalized
    // ads.
    url = addParamToUrl(url, 'npa', '1');
  }
  const {additionalConsent, consentStringType} = initialConsentMetadata || {};
  const isGdpr =
    consentStringType != null &&
    consentStringType !== CONSENT_STRING_TYPE.US_PRIVACY_STRING;
  if (isGdpr && initialConsentValue != null) {
    url = addParamToUrl(url, 'gdpr', '1');
    url = addParamToUrl(url, 'gdpr_consent', initialConsentValue);
  }
  if (additionalConsent != null) {
    url = addParamToUrl(url, 'addtl_consent', additionalConsent);
  }
  return url;
}

/**
 * Starts ad playback. If the ad request has not yet resolved, calls itself
 * again after 250ms.
 * @param {!Object} global
 * @visibleForTesting
 */
export function playAds(global) {
  if (!imaLoadAllowed) {
    playVideo();
    return;
  }

  if (!adsRequested) {
    requestAds();
    playAds(global);
    return;
  } else if (adsManager) {
    // Ad request resolved.
    try {
      adsManager.init(
        videoWidth,
        videoHeight,
        global.google.ima.ViewMode.NORMAL
      );
      adsManager.start();
    } catch (adError) {
      playVideo();
    }
  } else if (!adRequestFailed) {
    // Ad request did not yet resolve but also did not yet fail.
    setTimeout(playAds.bind(null, global), 250);
  } else {
    // Ad request failed.
    playVideo();
  }
}

/**
 * Called when the content completes.
 *
 * @visibleForTesting
 */
export function onContentEnded() {
  contentComplete = true;
  if (adsLoader) {
    adsLoader.contentComplete();
  }

  // If all ads are not completed,
  // onContentResume will show the elements['overlayButton']
  if (allAdsCompleted) {
    toggle(elements['overlayButton'], true);
  }

  postMessage({event: VideoEvents_Enum.PAUSE});
  postMessage({event: VideoEvents_Enum.ENDED});
}

/**
 * Called when the IMA SDK has an AdsManager ready for us.
 * @param {!Object} global
 * @param {*} adsManagerLoadedEvent
 * @visibleForTesting
 */
export function onAdsManagerLoaded(global, adsManagerLoadedEvent) {
  const adsRenderingSettings = new global.google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  adsManager = adsManagerLoadedEvent.getAdsManager(
    elements['video'],
    adsRenderingSettings
  );
  adsManager.addEventListener(
    global.google.ima.AdErrorEvent.Type.AD_ERROR,
    onAdError
  );
  adsManager.addEventListener(global.google.ima.AdEvent.Type.LOADED, onAdLoad);
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.PAUSED,
    onAdPaused
  );
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.RESUMED,
    onAdResumed
  );
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.AD_PROGRESS,
    onAdProgress
  );
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
    onContentPauseRequested.bind(null, global)
  );
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
    onContentResumeRequested
  );
  adsManager.addEventListener(
    global.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
    onAllAdsCompleted
  );
  if (muteAdsManagerOnLoaded) {
    adsManager.setVolume(0);
  }
  postMessage({event: VideoEvents_Enum.LOAD});
}

/**
 * Called when we encounter an error trying to load ads.
 *
 * @visibleForTesting
 */
export function onAdsLoaderError() {
  adRequestFailed = true;
  // Send this message to trigger auto-play for failed pre-roll requests -
  // failing to load an ad is just as good as loading one as far as starting
  // playback is concerned because our content will be ready to play.
  postMessage({event: VideoEvents_Enum.LOAD});
  addHoverEventToElement(
    /** @type {!Element} */ (elements['video']),
    showControlsThrottled
  );
  if (playbackStarted) {
    playVideo();
  }
}

/**
 * Called when we encounter an error trying to play ads.
 *
 * @visibleForTesting
 */
export function onAdError() {
  postMessage({event: VideoEvents_Enum.AD_END});
  currentAd = null;
  if (adsManager) {
    adsManager.destroy();
  }
  addHoverEventToElement(
    /** @type {!Element} */ (elements['video']),
    showControlsThrottled
  );
  playVideo();
}

/**
 * Called each time a new ad loads. Sets currentAd
 * @param {!Object} global
 * @visibleForTesting
 */
export function onAdLoad(global) {
  currentAd = global.getAd();
}

/**
 * Called intermittently as the ad plays, allowing us to display ad counter.
 * @param {!Object} unusedEvent
 * @visibleForTesting
 */
export function onAdProgress(unusedEvent) {
  const adPodInfo = currentAd.getAdPodInfo();
  const adPosition = adPodInfo.getAdPosition();
  const totalAds = adPodInfo.getTotalAds();
  const remainingTime = adsManager.getRemainingTime();
  const remainingMinutes = Math.floor(remainingTime / 60);
  let remainingSeconds = Math.floor(remainingTime % 60);
  if (remainingSeconds.toString().length < 2) {
    remainingSeconds = '0' + remainingSeconds;
  }
  const label = adLabel.replace('%s', adPosition).replace('%s', totalAds);
  const {'countdown': countdown} = elements;
  countdown.textContent = `${label}: ${remainingMinutes}:${remainingSeconds}`;
}

/**
 * Called by the IMA SDK. Pauses the content and readies the player for ads.
 * @param {!Object} global
 * @visibleForTesting
 */
export function onContentPauseRequested(global) {
  if (adsManagerWidthOnLoad) {
    adsManager.resize(
      adsManagerWidthOnLoad,
      adsManagerHeightOnLoad,
      global.google.ima.ViewMode.NORMAL
    );
    adsManagerWidthOnLoad = null;
    adsManagerHeightOnLoad = null;
  }
  adsActive = true;
  playerState = PlayerStates.PLAYING;
  postMessage({event: VideoEvents_Enum.AD_START});
  toggle(elements['adContainer'], true);
  showAdControls();

  const {'video': video} = elements;
  video.removeEventListener('ended', onContentEnded);
  video.pause();
  removeHoverEventFromElement(
    /** @type {!Element} */ (video),
    showControlsThrottled
  );
}

/**
 * Called by the IMA SDK. Resumes content after an ad break.
 *
 * @visibleForTesting
 */
export function onContentResumeRequested() {
  const {'overlayButton': overlayButton, 'video': video} = elements;
  adsActive = false;
  addHoverEventToElement(
    /** @type {!Element} */ (video),
    showControlsThrottled
  );
  postMessage({event: VideoEvents_Enum.AD_END});
  resetControlsAfterAd();
  if (!contentComplete) {
    // CONTENT_RESUME will fire after post-rolls as well, and we don't want to
    // resume content in that case.
    playVideo();
  } else {
    toggle(overlayButton, true);
  }

  video.addEventListener('ended', onContentEnded);
}

/**
 * Called when the IMA SDK emmitts the event: AdEvent.Type.PAUSED.
 * Sets the (ads) controls to reflect a paused state.
 * Does not need to set the big play pause since that is handled
 * by the SDK generally.
 * @visibleForTesting
 */
export function onAdPaused() {
  toggleRootDataAttribute('playing', false);
  playerState = PlayerStates.PAUSE;
}

/**
 * Called when the IMA SDK emmitts the event: AdEvent.Type.RESUMED.
 * Sets the (ads) controls to reflect a paused state.
 * Does not need to set the big play pause since that is handled
 * by the SDK generally.
 * @visibleForTesting
 */
export function onAdResumed() {
  toggleRootDataAttribute('playing', true);
  playerState = PlayerStates.PLAYING;
}

/**
 * Called by the IMA SDK. Signifies all ads have been played for the video.
 *
 * @visibleForTesting
 */
export function onAllAdsCompleted() {
  currentAd = null;
  allAdsCompleted = true;
}

/**
 * Called when our ui timer goes off. Updates the player UI.
 */
function uiTickerClick() {
  const {currentTime, duration} = elements['video'];
  updateTime(currentTime, duration);
}

/**
 *  Called when our player data timer goes off. Sends a message to the parent
 *  iframe to update the player data.
 */
function playerDataTick() {
  // Skip while ads are active in case of custom playback. No harm done for
  // non-custom playback because content won't be progressing while ads are
  // playing.
  const {'video': video} = elements;
  if (video && !adsActive) {
    playerData.update(video);
    postMessage({
      event: ImaPlayerData.IMA_PLAYER_DATA,
      data: playerData,
    });
  }
}

/**
 * Updates the time and progress.
 * @param {number} currentTime
 * @param {number} duration
 * @visibleForTesting
 */
export function updateTime(currentTime, duration) {
  const {
    'progress': progress,
    'progressLine': progressLine,
    'progressMarker': progressMarker,
    'time': time,
  } = elements;

  // https://developer.mozilla.org/en-US/docs/Web/API/HTMLMediaElement/duration
  const isLivestream = duration === Infinity;

  // Progress bar should not be displayed on livestreams.
  // TODO(alanorozco): This is likely handled by native controls, so we wouldn't
  // need this clause if we switch. https://go.amp.dev/issue/8841
  if (progress.hasAttribute('hidden') !== isLivestream) {
    toggle(progress, !isLivestream);
    progress.setAttribute('aria-hidden', String(isLivestream));
  }

  // TODO(alanorozco): Consider adding a label for livestreams to display next
  // to the current time.
  const currentTimeFormatted = formatTime(currentTime);
  time.textContent = isLivestream
    ? currentTimeFormatted
    : `${currentTimeFormatted} / ${formatTime(duration)}`;

  if (!isLivestream) {
    const progressPercent = Math.floor((currentTime / duration) * 100);
    setStyle(progressLine, 'width', progressPercent + '%');
    setStyle(progressMarker, 'left', progressPercent - 1 + '%');
  }
}

/**
 * Formats an int in seconds into a string of the format X:XX:XX. Omits the
 * hour if the content is less than one hour.
 * @param {number} time
 * @return {*} TODO(#23582): Specify return type
 * @visibleForTesting
 */
export function formatTime(time) {
  if (isNaN(time)) {
    return '0:00';
  }
  let timeString = '';
  const hours = Math.floor(time / 3600);
  if (hours > 0) {
    timeString += hours + ':';
  }
  const minutes = Math.floor((time % 3600) / 60);
  if (hours > 0) {
    timeString += zeroPad(minutes) + ':';
  } else {
    timeString += minutes + ':';
  }
  const seconds = Math.floor(time - (hours * 3600 + minutes * 60));
  timeString += zeroPad(seconds);
  return timeString;
}

/**
 * Zero-pads the provided int and returns a string of length 2.
 * @param {string|number} input
 * @return {*} TODO(#23582): Specify return type
 * @visibleForTesting
 */
export function zeroPad(input) {
  input = String(input);
  return input.length == 1 ? '0' + input : input;
}

/**
 * Detects clicks on the progress bar.
 * @param {!Event} event
 */
function onProgressClick(event) {
  // Call this logic once to make sure we still seek if the user just clicks
  // instead of clicking and dragging.
  clearTimeout(hideControlsTimeout);
  onProgressMove(event);
  event.preventDefault();
  event.stopPropagation();
  clearInterval(uiTicker);
  document.addEventListener(mouseMoveEvent, onProgressMove);
  document.addEventListener(mouseUpEvent, onProgressClickEnd);
}

/**
 * Detects the end of interaction on the progress bar.
 */
function onProgressClickEnd() {
  document.removeEventListener(mouseMoveEvent, onProgressMove);
  document.removeEventListener(mouseUpEvent, onProgressClickEnd);
  uiTicker = setInterval(uiTickerClick, 500);
  const {'video': video} = elements;
  video.currentTime = video.duration * seekPercent;
  // Reset hide controls timeout.
  showControls();
}

/**
 * Detects when the user clicks and drags on the progress bar.
 * @param {!Event} event
 */
function onProgressMove(event) {
  const {'progress': progress, 'video': video} = elements;
  const progressWrapperPosition = getPagePosition(progress);
  const progressListStart = progressWrapperPosition.x;
  const progressListWidth = progress./*OK*/ offsetWidth;

  // Handle Android Chrome touch events.
  const eventX = event.clientX || event.touches[0].pageX;

  seekPercent = (eventX - progressListStart) / progressListWidth;
  if (seekPercent < 0) {
    seekPercent = 0;
  } else if (seekPercent > 1) {
    seekPercent = 1;
  }
  updateTime(video.duration * seekPercent, video.duration);
}

/**
 * Returns the x,y coordinates of the given element relative to the window.
 * @param {!Element} el
 * @return {{x: number, y: number}}
 */
function getPagePosition(el) {
  let lx, ly;
  for (
    lx = 0, ly = 0;
    el != null;
    lx += el./*OK*/ offsetLeft,
      ly += el./*OK*/ offsetTop,
      el = el./*OK*/ offsetParent
  ) {}
  return {x: lx, y: ly};
}

/**
 * Called when the user clicks on the play / pause button.
 *
 * @visibleForTesting
 */
export function onPlayPauseClick() {
  if (playerState == PlayerStates.PLAYING) {
    pauseVideo();
  } else {
    playVideo();
  }
}

/**
 * Plays the content video.
 *
 * @visibleForTesting
 */
export function playVideo() {
  const {'adContainer': adContainer, 'video': video} = elements;
  if (adsActive) {
    adsManager.resume();
  } else {
    toggle(adContainer, false);
    // Kick off the hide controls timer.
    showControls();
    video.play();
  }
  playerState = PlayerStates.PLAYING;
  postMessage({event: VideoEvents_Enum.PLAYING});
  toggleRootDataAttribute('playing', true);
}

/**
 * Pauses the video player.
 * @param {?Event} event
 * @visibleForTesting
 */
export function pauseVideo(event = null) {
  if (adsActive) {
    adsManager.pause();
  } else {
    const {'video': video} = elements;
    video.pause();
    // Show controls and keep them there because we're paused.
    clearTimeout(hideControlsTimeout);
    showControls();
    if (event && event.type == 'webkitendfullscreen') {
      // Video was paused because we exited fullscreen.
      video.removeEventListener('webkitendfullscreen', pauseVideo);
      fullscreen = false;
    }
  }
  playerState = PlayerStates.PAUSED;
  postMessage({event: VideoEvents_Enum.PAUSE});
  toggleRootDataAttribute('playing', false);
}

/**
 * Handler when the mute/unmute button is clicked
 */
export function onMuteUnmuteClick() {
  if (elements['video'].muted) {
    unmuteVideo();
  } else {
    muteVideo();
  }
}

/**
 * Function to mute the video
 */
export function muteVideo() {
  toggleMuted(elements['video'], true);
}

/**
 * Function to unmute the video
 */
export function unmuteVideo() {
  toggleMuted(elements['video'], false);
}

/**
 * Mutes or unmutes the video.
 * @param {!HTMLMediaElement} video
 * @param {boolean} muted
 */
export function toggleMuted(video, muted) {
  if (video.muted == muted) {
    return;
  }
  const volume = muted ? 0 : 1;
  video.volume = volume;
  video.muted = muted;
  if (adsManager) {
    adsManager.setVolume(volume);
  } else {
    muteAdsManagerOnLoaded = muted;
  }
  toggleRootDataAttribute('muted', muted);
  postMessage({
    event: muted ? VideoEvents_Enum.MUTED : VideoEvents_Enum.UNMUTED,
  });
}

/**
 * @param {object} global
 */
function exitFullscreen(global) {
  // The video is currently in fullscreen mode
  const cancelFullscreen =
    global.document.exitFullscreen ||
    global.document.exitFullScreen ||
    global.document.webkitCancelFullScreen ||
    global.document.mozCancelFullScreen;
  if (cancelFullscreen) {
    cancelFullscreen.call(document);
  }
}

/**
 * @param {object} global
 */
function enterFullscreen(global) {
  // Try to enter fullscreen mode in the browser
  const requestFullscreen =
    global.document.documentElement.requestFullscreen ||
    global.document.documentElement.webkitRequestFullscreen ||
    global.document.documentElement.mozRequestFullscreen ||
    global.document.documentElement.requestFullScreen ||
    global.document.documentElement.webkitRequestFullScreen ||
    global.document.documentElement.mozRequestFullScreen;
  if (requestFullscreen) {
    fullscreenWidth = window.screen.width;
    fullscreenHeight = window.screen.height;
    requestFullscreen.call(global.document.documentElement);
  } else {
    const {'video': video} = elements;
    // Use native fullscreen (iPhone)
    video.webkitEnterFullscreen();
    // Pause the video when we leave fullscreen. iPhone does this
    // automatically, but we still use pauseVideo as an event handler to
    // sync the UI.
    video.addEventListener('webkitendfullscreen', pauseVideo);
    nativeFullscreen = true;
    onFullscreenChange(global);
  }
}

/**
 * @param {object} global
 */
function toggleFullscreen(global) {
  if (fullscreen) {
    exitFullscreen(global);
    return;
  }
  enterFullscreen(global);
}

/**
 * Called when the fullscreen mode of the browser or content player changes.
 * @param {object} global
 */
function onFullscreenChange(global) {
  if (fullscreen) {
    if (adsManager) {
      // Resize the ad container
      adsManager.resize(
        videoWidth,
        videoHeight,
        global.google.ima.ViewMode.NORMAL
      );
      adsManagerWidthOnLoad = null;
      adsManagerHeightOnLoad = null;
    }
    fullscreen = false;
  } else {
    // The user just entered fullscreen
    if (!nativeFullscreen) {
      if (adsManager) {
        // Resize the ad container
        adsManager.resize(
          fullscreenWidth,
          fullscreenHeight,
          global.google.ima.ViewMode.FULLSCREEN
        );
        adsManagerWidthOnLoad = null;
        adsManagerHeightOnLoad = null;
      }
      hideControls();
    }
    fullscreen = true;
  }
  postMessage({event: 'fullscreenchange', isFullscreen: fullscreen});
}

/**
 * Show a subset of controls when ads are playing.
 * See CSS for selectors affected by -controls-ads and -controls-ads-mini
 *
 * @visibleForTesting
 */
export function showAdControls() {
  showControls(true);
  toggleRootDataAttribute('playing', true);
  toggleRootDataAttribute('ad', true);
  toggleRootDataAttribute(
    'skippable',
    currentAd ? currentAd?.getSkipTimeOffset() !== -1 : false
  );
}

/**
 * Reinstate access to all controls when ads have ended.
 *
 * @visibleForTesting
 */
export function resetControlsAfterAd() {
  toggleRootDataAttribute('ad', false);
  toggleRootDataAttribute('skippable', false);
}

/**
 * Show video controls and reset hide controls timeout.
 * @param {boolean} opt_adsForce
 * @visibleForTesting
 */
export function showControls(opt_adsForce) {
  showControlsFirstCalled = true;
  if (!controlsVisible) {
    // Bail out if hideControls signal was queued before
    // showControls (does not matter for ads case)
    if (hideControlsQueued && !opt_adsForce) {
      hideControlsQueued = false;
      return;
    }
    toggle(elements['controls'], true);
    controlsVisible = true;
  }

  // Hide controls after 3 seconds
  if (playerState == PlayerStates.PLAYING) {
    // Reset hide controls timer.
    // Be sure to keep the timer greater than showControlsThrottled.
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = setTimeout(hideControls, 3000);
  }
}

/**
 * Hide video controls, except when ads are active.
 *
 * @visibleForTesting
 */
export function hideControls() {
  if (controlsVisible && !adsActive) {
    toggle(elements['controls'], false);
    controlsVisible = false;
  } else if (!showControlsFirstCalled) {
    // showControls has not been called yet,
    // so set flag to indicate first showControls
    // should not take precedence.
    hideControlsQueued = true;
  }
}

/**
 * Handles messages from the top window.
 * @param {!Object} global
 * @param {!Event} event
 */
function onMessage(global, event) {
  const eventData = getData(event);
  if (!eventData) {
    return;
  }
  const msg = isObject(eventData) ? eventData : tryParseJson(eventData);
  if (!msg) {
    return; // We only process valid JSON.
  }
  if (!msg['event'] || !msg['func']) {
    return;
  }
  switch (msg['func']) {
    case 'play':
      if (adsActive || playbackStarted) {
        playVideo();
      } else {
        // Auto-play support
        onOverlayButtonInteract(global);
      }
      break;
    case 'pause':
      pauseVideo();
      break;
    case 'mute':
      muteVideo();
      break;
    case 'unmute':
      unmuteVideo();
      break;
    case 'hideControls':
      if (!adsActive) {
        hideControls();
      }
      break;
    case 'showControls':
      if (!adsActive) {
        showControls();
      }
      break;
    case 'resize':
      const args = msg['args'];
      if (args && args.width && args.height) {
        if (adsActive && !fullscreen) {
          adsManager.resize(
            args.width,
            args.height,
            global.google.ima.ViewMode.NORMAL
          );
        } else {
          adsManagerWidthOnLoad = args.width;
          adsManagerHeightOnLoad = args.height;
        }
      }
      break;
    case 'onFirstScroll':
    case 'onAdRequestDelayTimeout':
      if (!adsRequested && imaLoadAllowed) {
        requestAds();
      }
      break;
    case 'requestFullscreen':
      if (fullscreen) {
        return;
      }
      enterFullscreen(global);
      break;
    case 'exitFullscreen':
      if (!fullscreen) {
        return;
      }
      exitFullscreen(global);
      break;
  }
}

/**
 * @param {!Object} data
 */
function postMessage(data) {
  window.parent./*OK*/ postMessage(data, '*');
}

/**
 * Returns the properties we need to access for testing.
 *
 * @return {*} TODO(#23582): Specify return type
 * @visibleForTesting
 */
export function getPropertiesForTesting() {
  return {
    allAdsCompleted,
    adRequestFailed,
    adsActive,
    adsManagerWidthOnLoad,
    adsManagerHeightOnLoad,
    adsRequest,
    contentComplete,
    controlsVisible,
    hideControlsTimeout,
    imaLoadAllowed,
    interactEvent,
    playbackStarted,
    playerState,
    PlayerStates,
    uiTicker,
    hideControlsQueued,
    icons,
    // TODO(alanorozco): Update names on test's end to pass `elements` instead.
    elements,
    videoPlayer: elements['video'],
    adContainerDiv: elements['adContainer'],
    controlsDiv: elements['controls'],
    playPauseDiv: elements['playButton'],
    countdownDiv: elements['countdown'],
    timeDiv: elements['time'],
    muteUnmuteDiv: elements['muteButton'],
    fullscreenDiv: elements['fullscreenButton'],
    bigPlayDiv: elements['overlayButton'],
  };
}

/**
 * Gets the throttled show controls
 * @return {Function}
 * @visibleForTesting
 */
export function getShowControlsThrottledForTesting() {
  return showControlsThrottled;
}

/**
 * Sets the overlay button.
 * @param {!Element} div
 * @visibleForTesting
 */
export function setBigPlayDivForTesting(div) {
  elements['overlayButton'] = div;
}

/**
 * Sets the ad display container.
 * @param {!Element} adc
 * @visibleForTesting
 */
export function setAdDisplayContainerForTesting(adc) {
  adDisplayContainer = adc;
}

/**
 * Sets the video width and height.
 * @param {number} width
 * @param {number} height
 * @visibleForTesting
 */
export function setVideoWidthAndHeightForTesting(width, height) {
  videoWidth = width;
  videoHeight = height;
}

/**
 * Sets the video muted state
 * @param {boolean} shouldMute
 * @visibleForTesting
 */
export function setVideoPlayerMutedForTesting(shouldMute) {
  elements['video'].muted = shouldMute;
}

/**
 * Sets the allAdsCompleted flag.
 * @param {boolean} newValue
 * @visibleForTesting
 */
export function setAllAdsCompletedForTesting(newValue) {
  allAdsCompleted = newValue;
}

/**
 * Sets the ad request failed flag.
 * @param {boolean} newValue
 * @visibleForTesting
 */
export function setAdRequestFailedForTesting(newValue) {
  adRequestFailed = newValue;
}

/**
 * Sets the ads loader.
 * @param {*} newAdsLoader
 * @visibleForTesting
 */
export function setAdsLoaderForTesting(newAdsLoader) {
  adsLoader = newAdsLoader;
}

/**
 * Sets the ads request.
 * @param {*} newAdsRequest
 * @visibleForTesting
 */
export function setAdsRequestForTesting(newAdsRequest) {
  adsRequest = newAdsRequest;
}

/**
 * Sets the flag to mute the ads manager when it loads.
 * @param {boolean} shouldMute
 * @visibleForTesting
 */
export function setMuteAdsManagerOnLoadedForTesting(shouldMute) {
  muteAdsManagerOnLoaded = shouldMute;
}

/**
 * Sets the ads manager.
 * @param {*} newAdsManager
 * @visibleForTesting
 */
export function setAdsManagerForTesting(newAdsManager) {
  adsManager = newAdsManager;
}

/**
 * Sets the ads manager dimensions on load.
 * @param {number} width
 * @param {number} height
 * @visibleForTesting
 */
export function setAdsManagerDimensionsOnLoadForTesting(width, height) {
  adsManagerWidthOnLoad = width;
  adsManagerHeightOnLoad = height;
}

/**
 * Sets the content complete flag.
 * @param {*} newContentComplete
 * @visibleForTesting
 */
export function setContentCompleteForTesting(newContentComplete) {
  contentComplete = newContentComplete;
}

/**
 * Sets the video player.
 * @param {*} newPlayer
 * @visibleForTesting
 */
export function setVideoPlayerForTesting(newPlayer) {
  elements['video'] = newPlayer;
}

/**
 * Sets the player state.
 * @param {*} newState
 * @visibleForTesting
 */
export function setPlayerStateForTesting(newState) {
  playerState = newState;
}

/**
 * Sets the hideControlsTimeout
 * @param {number} newTimeout
 * @visibleForTesting
 */
export function setHideControlsTimeoutForTesting(newTimeout) {
  hideControlsTimeout = newTimeout;
}

/**
 * @param {object} newContext
 * @visibleForTesting
 */
export function setContextForTesting(newContext) {
  for (const k in newContext) {
    context[k] = newContext[k];
  }
}

/**
 * Events
 *
 * Copied from src/video-interface.js.
 *
 * @enum {string}
 */
// TODO(aghassemi, #9216): Use video-interface.js
const VideoEvents_Enum = {
  /**
   * load
   *
   * Fired when the video player is loaded and calls to methods such as `play()`
   * are allowed.
   *
   * @event load
   */
  LOAD: 'load',

  /**
   * play
   *
   * Fired when the video plays.
   *
   * @event play
   */
  PLAYING: 'playing',

  /**
   * pause
   *
   * Fired when the video pauses.
   *
   * @event pause
   */
  PAUSE: 'pause',

  /**
   * ended
   *
   * Fired when the video ends.
   *
   * This event should be fired in addition to `pause` when video ends.
   *
   * @event ended
   */
  ENDED: 'ended',

  /**
   * muted
   *
   * Fired when the video is muted.
   *
   * @event play
   */
  MUTED: 'muted',

  /**
   * unmuted
   *
   * Fired when the video is unmuted.
   *
   * @event unmuted
   */
  UNMUTED: 'unmuted',

  /**
   * amp:video:visibility
   *
   * Fired when the video's visibility changes.
   *
   * @event amp:video:visibility
   * @property {boolean} visible Whether the video player is visible or not.
   */
  VISIBILITY: 'amp:video:visibility',

  /**
   * reload
   *
   * Fired when the video's src changes.
   *
   * @event reload
   */
  RELOAD: 'reloaded',
  /**
   * pre/mid/post Ad start
   *
   * Fired when an Ad starts playing.
   *
   * This is used to remove any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_start
   */
  AD_START: 'ad_start',

  /**
   * pre/mid/post Ad ends
   *
   * Fired when an Ad ends playing.
   *
   * This is used to restore any overlay shims during Ad play during autoplay
   * or minimized-to-corner version of the player.
   *
   * @event ad_end
   */
  AD_END: 'ad_end',
};
