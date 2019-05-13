/**
 * Copyright 2017 The AMP HTML Authors. All Rights Reserved.
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

import {CONSENT_POLICY_STATE} from '../../src/consent-state';
import {ImaPlayerData} from './ima-player-data';
import {camelCaseToTitleCase, px, setStyle, setStyles} from '../../src/style';
import {getData} from '../../src/event-helper';
import {isObject} from '../../src/types';
import {loadScript} from '../../3p/3p';
import {throttle} from '../../src/utils/rate-limit';
import {tryParseJson} from '../../src/json';


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
/*eslint-disable*/
const icons = {
  'play':
    `<path d="M8 5v14l11-7z"></path>
     <path d="M0 0h24v24H0z" fill="none"></path>`,
  'pause':
    `<path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"></path>
     <path d="M0 0h24v24H0z" fill="none"></path>`,
  'fullscreen':
    `<path d="M0 0h24v24H0z" fill="none"/>
     <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z"/>`,
  'mute':
    `<path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"></path>
     <path d="M0 0h24v24H0z" fill="none"></path>`,
  'volume_max':
    `<path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"></path>
     <path d="M0 0h24v24H0z" fill="none"></path>`,
  'seek':
  `<circle cx="12" cy="12" r="12" />`
};

/*eslint-enable */

const bigPlayDivDisplayStyle = 'table-cell';

// Div wrapping our entire DOM.
let wrapperDiv;

// Div containing big play button. Rendered before player starts.
let bigPlayDiv;

// Div contianing play button. Double-nested for alignment.
let playButtonDiv;

// Div containing player controls.
let controlsDiv;

// Wrapper for ad countdown element.
let countdownWrapperDiv;

// Div containing ad countdown timer.
let countdownDiv;

// Div containing play or pause button.
let playPauseDiv;

// Div containing player time.
let timeDiv;

// Node containing the player time text.
let timeNode;

// Wrapper for progress bar DOM elements.
let progressBarWrapperDiv;

// Line for progress bar.
let progressLine;

// Line for total time in progress bar.
let totalTimeLine;

// Div containing the marker for the progress.
let progressMarkerDiv;

// Div for fullscreen icon.
let fullscreenDiv;

// Div for mute/unmute icon.
let muteUnmuteDiv;

// Div for ad container.
let adContainerDiv;

// Div for content player.
let contentDiv;

// Content player.
let videoPlayer;

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

// Flag that tracks if the user tapped and dragged on the big play button.
let userTappedAndDragged;

// User consent state.
let consentState;

// Throttle for the showControls() function
let showControlsThrottled = throttle(window, showControls, 1000);

/**
 * @param {!Object} global
 * @param {!Object} data
 */
export function imaVideo(global, data) {

  videoWidth = global./*OK*/innerWidth;
  videoHeight = global./*OK*/innerHeight;
  adLabel = data.adLabel || 'Ad (%s of %s)';

  // Wraps *everything*.
  wrapperDiv = global.document.createElement('div');
  wrapperDiv.id = 'ima-wrapper';
  setStyle(wrapperDiv, 'width', px(videoWidth));
  setStyle(wrapperDiv, 'height', px(videoHeight));
  setStyle(wrapperDiv, 'background-color', 'black');

  // Wraps the big play button we show before video start.
  bigPlayDiv = global.document.createElement('div');
  bigPlayDiv.id = 'ima-big-play';
  setStyles(bigPlayDiv, {
    'position': 'relative',
    'width': px(videoWidth),
    'height': px(videoHeight),
    'display': bigPlayDivDisplayStyle,
    'vertical-align': 'middle',
    'text-align': 'center',
    'cursor': 'pointer',
  });
  // Inner div so we can v and h align.
  playButtonDiv = createIcon(global, 'play');
  playButtonDiv.id = 'ima-play-button';
  setStyles(playButtonDiv, {
    'display': 'inline-block',
    'max-width': '120px',
    'max-height': '120px',
  });
  bigPlayDiv.appendChild(playButtonDiv);

  // Video controls.
  controlsDiv = global.document.createElement('div');
  controlsDiv.id = 'ima-controls';
  setStyles(controlsDiv, {
    'position': 'absolute',
    'bottom': '0px',
    'width': '100%',
    'height': '100px',
    'background-color': 'rgba(7, 20, 30, .7)',
    'background':
      'linear-gradient(0, rgba(7, 20, 30, .7) 0%, rgba(7, 20, 30, 0) 100%)',
    'box-sizing': 'border-box',
    'padding': '10px',
    'padding-top': '60px',
    'color': 'white',
    'display': 'none',
    'font-family': 'Helvetica, Arial, Sans-serif',
    'justify-content': 'center',
    'align-items': 'center',
    'user-select': 'none',
    'z-index': '1',
  });
  controlsVisible = false;

  // Ad progress
  countdownWrapperDiv = global.document.createElement('div');
  countdownWrapperDiv.id = 'ima-countdown';
  setStyles(countdownWrapperDiv, {
    'align-items': 'center',
    'box-sizing': 'border-box',
    'display': 'none',
    'flex-grow': '1',
    'font-size': '12px',
    'height': '20px',
    'overflow': 'hidden',
    'padding': '5px',
    'text-shadow': '0px 0px 10px black',
    'white-space': 'nowrap',
  });
  countdownDiv = global.document.createElement('div');
  countdownWrapperDiv.appendChild(countdownDiv);
  controlsDiv.appendChild(countdownWrapperDiv);
  // Play button
  playPauseDiv = createIcon(global, 'play');
  playPauseDiv.id = 'ima-play-pause';
  setStyles(playPauseDiv, {
    'width': '30px',
    'height': '30px',
    'margin-right': '20px',
    'font-size': '1.25em',
    'cursor': 'pointer',
  });
  controlsDiv.appendChild(playPauseDiv);
  // Current time and duration.
  timeDiv = global.document.createElement('div');
  timeDiv.id = 'ima-time';
  setStyles(timeDiv, {
    'margin-right': '20px',
    'text-align': 'center',
    'font-size': '14px',
    'text-shadow': '0px 0px 10px black',
  });
  timeNode = global.document.createTextNode('-:- / 0:00');
  timeDiv.appendChild(timeNode);
  controlsDiv.appendChild(timeDiv);
  // Progress bar.
  progressBarWrapperDiv = global.document.createElement('div');
  progressBarWrapperDiv.id = 'ima-progress-wrapper';
  setStyles(progressBarWrapperDiv, {
    'height': '30px',
    'flex-grow': '1',
    'position': 'relative',
    'margin-right': '20px',
  });
  progressLine = global.document.createElement('div');
  progressLine.id = 'progress-line';
  setStyles(progressLine, {
    'background-color': 'rgb(255, 255, 255)',
    'height': '2px',
    'margin-top': '14px',
    'width': '0%',
    'float': 'left',
  });
  totalTimeLine = global.document.createElement('div');
  totalTimeLine.id = 'total-time-line';
  setStyles(totalTimeLine, {
    'background-color': 'rgba(255, 255, 255, 0.45)',
    'height': '2px',
    'width': '100%',
    'margin-top': '14px',
  });
  progressMarkerDiv = global.document.createElement('div');
  progressMarkerDiv.id = 'ima-progress-marker';
  setStyles(progressMarkerDiv, {
    'height': '14px',
    'width': '14px',
    'position': 'absolute',
    'left': '0%',
    'top': '50%',
    'margin-top': '-7px',
    'cursor': 'pointer',
  });
  progressMarkerDiv.appendChild(createIcon(global, 'seek'));
  progressBarWrapperDiv.appendChild(progressLine);
  progressBarWrapperDiv.appendChild(progressMarkerDiv);
  progressBarWrapperDiv.appendChild(totalTimeLine);
  controlsDiv.appendChild(progressBarWrapperDiv);

  // Mute/Unmute button
  muteUnmuteDiv = createIcon(global, 'volume_max');
  muteUnmuteDiv.id = 'ima-mute-unmute';
  setStyles(muteUnmuteDiv, {
    'width': '30px',
    'height': '30px',
    'flex-shrink': '0',
    'margin-right': '20px',
    'font-size': '1.25em',
    'cursor': 'pointer',
  });
  controlsDiv.appendChild(muteUnmuteDiv);

  // Fullscreen button
  fullscreenDiv = createIcon(global, 'fullscreen');
  fullscreenDiv.id = 'ima-fullscreen';
  setStyles(fullscreenDiv, {
    'width': '30px',
    'height': '30px',
    'flex-shrink': '0',
    'font-size': '1.25em',
    'cursor': 'pointer',
    'text-align': 'center',
    'font-weight': 'bold',
    'line-height': '1.4em',
  });
  controlsDiv.appendChild(fullscreenDiv);

  // Ad container.
  adContainerDiv = global.document.createElement('div');
  adContainerDiv.id = 'ima-ad-container';
  setStyles(adContainerDiv, {
    'position': 'absolute',
    'top': '0px',
    'left': '0px',
    'width': '100%',
    'height': '100%',
  });

  // Wraps our content video.
  contentDiv = global.document.createElement('div');
  contentDiv.id = 'ima-content';
  setStyles(contentDiv, {
    'position': 'absolute',
    'top': '0px',
    'left': '0px',
    'width': '100%',
    'height': '100%',
  });
  // The video player
  videoPlayer = global.document.createElement('video');
  videoPlayer.id = 'ima-content-player';
  setStyles(videoPlayer, {
    'width': '100%',
    'height': '100%',
    'background-color': 'black',
  });
  videoPlayer.setAttribute('poster', data.poster);
  if (data['crossorigin'] != null) {
    videoPlayer.setAttribute('crossorigin', data['crossorigin']);
  }
  videoPlayer.setAttribute('playsinline', true);
  videoPlayer.setAttribute(
      'controlsList', 'nodownload nofullscreen noremoteplayback');
  if (data.src) {
    const sourceElement = document.createElement('source');
    sourceElement.setAttribute('src', data.src);
    videoPlayer.appendChild(sourceElement);
  }
  if (data.childElements) {
    const children = JSON.parse(data.childElements);
    children.forEach(child => {
      videoPlayer.appendChild(htmlToElement(child));
    });
  }
  if (data.imaSettings) {
    imaSettings = tryParseJson(data.imaSettings);
  }

  contentDiv.appendChild(videoPlayer);
  wrapperDiv.appendChild(contentDiv);
  wrapperDiv.appendChild(adContainerDiv);
  wrapperDiv.appendChild(controlsDiv);
  wrapperDiv.appendChild(bigPlayDiv);
  global.document.getElementById('c').appendChild(wrapperDiv);

  window.addEventListener('message', onMessage.bind(null, global));

  contentComplete = false;
  adsActive = false;
  allAdsCompleted = false;
  playbackStarted = false;
  nativeFullscreen = false;
  imaLoadAllowed = true;

  let mobileBrowser = false;
  interactEvent = 'click';
  mouseDownEvent = 'mousedown';
  mouseMoveEvent = 'mousemove';
  mouseUpEvent = 'mouseup';
  if (navigator.userAgent.match(/iPhone/i) ||
      navigator.userAgent.match(/iPad/i) ||
      navigator.userAgent.match(/Android/i)) {
    mobileBrowser = true;
    interactEvent = 'touchend';
    mouseDownEvent = 'touchstart';
    mouseMoveEvent = 'touchmove';
    mouseUpEvent = 'touchend';
  }
  if (mobileBrowser) {
    // Create our own tap listener that ignores tap and drag.
    bigPlayDiv.addEventListener(mouseMoveEvent, onBigPlayTouchMove);
    bigPlayDiv.addEventListener(mouseUpEvent, onBigPlayTouchEnd);
    bigPlayDiv.addEventListener(
        'tapwithoutdrag',
        onBigPlayClick.bind(null, global));
  } else {
    bigPlayDiv.addEventListener(
        interactEvent,
        onBigPlayClick.bind(null, global));
  }
  playPauseDiv.addEventListener(interactEvent, onPlayPauseClick);
  progressBarWrapperDiv.addEventListener(mouseDownEvent, onProgressClick);
  muteUnmuteDiv.addEventListener(interactEvent, onMuteUnmuteClick);
  fullscreenDiv.addEventListener(interactEvent,
      toggleFullscreen.bind(null, global));

  // Timeout is 1s, because showControls will hide after 3s
  showControlsThrottled = throttle(window, showControls, 1000);

  const fullScreenEvents = [
    'fullscreenchange',
    'mozfullscreenchange',
    'webkitfullscreenchange'];
  fullScreenEvents.forEach(fsEvent => {
    global.document.addEventListener(fsEvent,
        onFullscreenChange.bind(null, global),
        false);
  });

  consentState = global.context.initialConsentState;

  if (consentState == 4) { // UNKNOWN
    // On unknown consent state, do not load IMA. Treat this the same as if IMA
    // failed to load.
    onImaLoadFail();
  } else {
    // Set-up code that can't run until the IMA lib loads.
    loadScript(
        /** @type {!Window} */ (global),
        'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
        () => onImaLoadSuccess(global, data), onImaLoadFail);
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

  adDisplayContainer =
      new global.google.ima.AdDisplayContainer(adContainerDiv, videoPlayer);

  adsLoader = new global.google.ima.AdsLoader(adDisplayContainer);
  adsLoader.getSettings().setPlayerType('amp-ima');
  adsLoader.getSettings().setPlayerVersion('0.1');
  // Propogate settings provided via child script tag.
  // locale and vpaidMode are set above, as they must be set before we create
  // an AdDisplayContainer.
  // playerType and playerVersion are used by the developers to track usage,
  // so we do not want to allow users to overwrite those values.
  const skippedSettings =
      ['locale', 'vpaidMode', 'playerType', 'playerVersion'];
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
      false);
  adsLoader.addEventListener(
      global.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdsLoaderError,
      false);

  videoPlayer.addEventListener('ended', onContentEnded);

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
    postMessage({event: VideoEvents.LOAD});
  }
}

/**
 * Handler for on fail.
 */
function onImaLoadFail() {
  // Something blocked ima3.js from loading - ignore all IMA stuff and just play
  // content.
  addHoverEventToElement(/** @type {!Element} */(videoPlayer), showControlsThrottled);
  imaLoadAllowed = false;
  postMessage({event: VideoEvents.LOAD});
}

/**
 * @param {string} html
 * @return {!Element}
 */
function htmlToElement(html) {
  const template = document.createElement('template');
  template./*OK*/innerHTML = html;
  return template.content.firstChild;
}

/**
 * @param {!Object} global
 * @param {string} name
 * @param {string} [fill='#FFFFFF']
 * @return {!Element}
 */
function createIcon(global, name, fill = '#FFFFFF') {
  const doc = global.document;
  const icon = doc.createElementNS('http://www.w3.org/2000/svg', 'svg');
  icon.setAttributeNS(null, 'fill', fill);
  icon.setAttributeNS(null, 'height', '100%');
  icon.setAttributeNS(null, 'width', '100%');
  icon.setAttributeNS(null, 'viewBox', '0 0 24 24');
  setStyle(icon, 'filter', 'drop-shadow(0px 0px 14px rgba(0,0,0,0.4))');
  icon./*OK*/innerHTML = icons[name];
  return icon;
}

/**
 * @param {!Element} element
 * @param {string} name
 * @param {string} [fill='#FFFFFF']
 */
function changeIcon(element, name, fill = '#FFFFFF') {
  element./*OK*/innerHTML = icons[name];
  if (fill != element.getAttributeNS(null, 'fill')) {
    element.setAttributeNS(null, 'fill', fill);
  }
}

/**
 * Triggered when the user clicks on the big play button div.
 * @param {!Object} global
 * @visibleForTesting
 */
export function onBigPlayClick(global) {
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
    videoPlayer.load();
    playAds(global);
  }

  setStyle(bigPlayDiv, 'display', 'none');
}

/**
 * Triggered when the user ends a tap on the big play button.
 */
function onBigPlayTouchEnd() {
  if (userTappedAndDragged) {
    // Reset state and ignore this tap.
    userTappedAndDragged = false;
  } else {
    const tapWithoutDragEvent = new Event('tapwithoutdrag');
    bigPlayDiv.dispatchEvent(tapWithoutDragEvent);
  }
}

/**
 * Triggered when the user moves a tap on the big play button.
 */
function onBigPlayTouchMove() {
  userTappedAndDragged = true;
}

/**
 * Requests ads.
 */
export function requestAds() {
  adsRequested = true;
  adRequestFailed = false;
  if (consentState == CONSENT_POLICY_STATE.UNKNOWN) {
    // We're unaware of the user's consent state - do not request ads.
    imaLoadAllowed = false;
    return;
  } else if (consentState == CONSENT_POLICY_STATE.INSUFFICIENT) {
    // User has provided consent state but has not consented to personalized
    // ads.
    adsRequest.adTagUrl += '&npa=1';
  }
  adsLoader.requestAds(adsRequest);
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
          videoWidth, videoHeight, global.google.ima.ViewMode.NORMAL);
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
  // onContentResume will show the bigPlayDiv
  if (allAdsCompleted) {
    setStyle(bigPlayDiv, 'display', bigPlayDivDisplayStyle);
  }

  postMessage({event: VideoEvents.PAUSE});
  postMessage({event: VideoEvents.ENDED});
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
  adsManager = adsManagerLoadedEvent.getAdsManager(videoPlayer,
      adsRenderingSettings);
  adsManager.addEventListener(global.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.LOADED,
      onAdLoad);
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.AD_PROGRESS,
      onAdProgress);
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested.bind(null, global));
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.ALL_ADS_COMPLETED,
      onAllAdsCompleted);
  if (muteAdsManagerOnLoaded) {
    adsManager.setVolume(0);
  }
  postMessage({event: VideoEvents.LOAD});
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
  postMessage({event: VideoEvents.LOAD});
  addHoverEventToElement(/** @type {!Element} */(videoPlayer), showControlsThrottled);
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
  postMessage({event: VideoEvents.AD_END});
  currentAd = null;
  if (adsManager) {
    adsManager.destroy();
  }
  addHoverEventToElement(/** @type {!Element} */(videoPlayer), showControlsThrottled);
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
 * @param {!Object} global
 * @visibleForTesting
 */
export function onAdProgress(global) {
  const {adPosition, totalAds} = global.getAdData();
  const remainingTime = adsManager.getRemainingTime();
  const remainingMinutes = Math.floor(remainingTime / 60);
  let remainingSeconds = Math.floor(remainingTime % 60);
  if (remainingSeconds.toString().length < 2) {
    remainingSeconds = '0' + remainingSeconds;
  }
  const label = adLabel.replace('%s', adPosition).replace('%s', totalAds);
  countdownDiv.textContent
    = `${label}: ${remainingMinutes}:${remainingSeconds}`;
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
        global.google.ima.ViewMode.NORMAL);
    adsManagerWidthOnLoad = null;
    adsManagerHeightOnLoad = null;
  }
  adsActive = true;
  postMessage({event: VideoEvents.AD_START});
  removeHoverEventFromElement(/** @type {!Element} */(videoPlayer), showControlsThrottled);
  setStyle(adContainerDiv, 'display', 'block');
  videoPlayer.removeEventListener('ended', onContentEnded);
  showAdControls();
  videoPlayer.pause();
}

/**
 * Called by the IMA SDK. Resumes content after an ad break.
 *
 * @visibleForTesting
 */
export function onContentResumeRequested() {
  adsActive = false;
  addHoverEventToElement(/** @type {!Element} */(videoPlayer), showControlsThrottled);
  postMessage({event: VideoEvents.AD_END});
  resetControlsAfterAd();
  if (!contentComplete) {
    // CONTENT_RESUME will fire after post-rolls as well, and we don't want to
    // resume content in that case.
    playVideo();
  } else {
    setStyle(bigPlayDiv, 'display', bigPlayDivDisplayStyle);
  }

  videoPlayer.addEventListener('ended', onContentEnded);
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
  updateUi(videoPlayer.currentTime, videoPlayer.duration);
}

/**
 *  Called when our player data timer goes off. Sends a message to the parent
 *  iframe to update the player data.
 */
function playerDataTick() {
  // Skip while ads are active in case of custom playback. No harm done for
  // non-custom playback because content won't be progressing while ads are
  // playing.
  if (videoPlayer && !adsActive) {
    playerData.update(videoPlayer);
    postMessage({
      event: ImaPlayerData.IMA_PLAYER_DATA,
      data: playerData,
    });
  }
}

/**
 * Updates the video player UI.
 * @param {number} currentTime
 * @param {number} duration
 * @visibleForTesting
 */
export function updateUi(currentTime, duration) {
  timeNode.textContent =
      formatTime(currentTime) + ' / ' + formatTime(duration);
  const progressPercent =
      Math.floor((currentTime / duration) * 100);
  setStyle(progressLine, 'width', progressPercent + '%');
  setStyle(progressMarkerDiv, 'left', (progressPercent - 1) + '%');
}

/**
 * Formats an int in seconds into a string of the format X:XX:XX. Omits the
 * hour if the content is less than one hour.
 * @param {number} time
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
  const seconds = Math.floor(time - ((hours * 3600) + (minutes * 60)));
  timeString += zeroPad(seconds);
  return timeString;
}

/**
 * Zero-pads the provided int and returns a string of length 2.
 * @param {string|number} input
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
  clearInterval(hideControlsTimeout);
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
  videoPlayer.currentTime = videoPlayer.duration * seekPercent;
  // Reset hide controls timeout.
  showControls();
}

/**
 * Detects when the user clicks and drags on the progress bar.
 * @param {!Event} event
 */
function onProgressMove(event) {
  const progressWrapperPosition = getPagePosition(progressBarWrapperDiv);
  const progressListStart = progressWrapperPosition.x;
  const progressListWidth = progressBarWrapperDiv./*OK*/offsetWidth;

  // Handle Android Chrome touch events.
  const eventX = event.clientX || event.touches[0].pageX;

  seekPercent = (eventX - progressListStart) / progressListWidth;
  if (seekPercent < 0) {
    seekPercent = 0;
  } else if (seekPercent > 1) {
    seekPercent = 1;
  }
  updateUi(videoPlayer.duration * seekPercent, videoPlayer.duration);
}

/**
 * Returns the x,y coordinates of the given element relative to the window.
 * @param {!Element} el
 * @return {{x: number, y: number}}
 */
function getPagePosition(el) {
  let lx, ly;
  for (lx = 0, ly = 0;
    el != null;
    lx += el./*OK*/offsetLeft, ly += el./*OK*/offsetTop,
    el = el./*OK*/offsetParent)
  {}
  return {x: lx,y: ly};
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
  setStyle(adContainerDiv, 'display', 'none');
  playerState = PlayerStates.PLAYING;
  // Kick off the hide controls timer.
  showControls();
  changeIcon(playPauseDiv, 'pause');
  postMessage({event: VideoEvents.PLAYING});
  videoPlayer.play();
}

/**
 * Pauses the video player.
 * @param {?Event} event
 * @visibleForTesting
 */
export function pauseVideo(event = null) {
  videoPlayer.pause();
  playerState = PlayerStates.PAUSED;
  // Show controls and keep them there because we're paused.
  clearInterval(hideControlsTimeout);
  if (!adsActive) {
    showControls();
  }
  changeIcon(playPauseDiv, 'play');
  postMessage({event: VideoEvents.PAUSE});
  if (event && event.type == 'webkitendfullscreen') {
    // Video was paused because we exited fullscreen.
    videoPlayer.removeEventListener('webkitendfullscreen', pauseVideo);
    fullscreen = false;
  }
}

/**
 * Handler when the mute/unmute button is clicked
 */
export function onMuteUnmuteClick() {
  if (videoPlayer.muted) {
    unmuteVideo();
  } else {
    muteVideo();
  }
}

/**
 * Function to mute the video
 */
export function muteVideo() {
  if (!videoPlayer.muted) {
    videoPlayer.volume = 0;
    videoPlayer.muted = true;
    if (adsManager) {
      adsManager.setVolume(0);
    } else {
      muteAdsManagerOnLoaded = true;
    }
    changeIcon(muteUnmuteDiv, 'mute');
    postMessage({event: VideoEvents.MUTED});
  }
}

/**
 * Function to unmute the video
 */
export function unmuteVideo() {
  if (videoPlayer.muted) {
    videoPlayer.volume = 1;
    videoPlayer.muted = false;
    if (adsManager) {
      adsManager.setVolume(1);
    } else {
      muteAdsManagerOnLoaded = false;
    }
    changeIcon(muteUnmuteDiv, 'volume_max');
    postMessage({event: VideoEvents.UNMUTED});
  }
}


/**
 * @param {Object} global
 */
function exitFullscreen(global) {
  // The video is currently in fullscreen mode
  const cancelFullscreen = global.document.exitFullscreen ||
      global.document.exitFullScreen ||
      global.document.webkitCancelFullScreen ||
      global.document.mozCancelFullScreen;
  if (cancelFullscreen) {
    cancelFullscreen.call(document);
  }
}


/**
 * @param {Object} global
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
    // Use native fullscreen (iPhone)
    videoPlayer.webkitEnterFullscreen();
    // Pause the video when we leave fullscreen. iPhone does this
    // automatically, but we still use pauseVideo as an event handler to
    // sync the UI.
    videoPlayer.addEventListener('webkitendfullscreen', pauseVideo);
    nativeFullscreen = true;
    onFullscreenChange(global);
  }
}


/**
 * @param {Object} global
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
 * @param {Object} global
 */
function onFullscreenChange(global) {
  if (fullscreen) {
    if (adsManager) {
      // Resize the ad container
      adsManager.resize(
          videoWidth, videoHeight, global.google.ima.ViewMode.NORMAL);
      adsManagerWidthOnLoad = null;
      adsManagerHeightOnLoad = null;
    }
    // Return the video to its original size and position
    setStyle(wrapperDiv, 'width', px(videoWidth));
    setStyle(wrapperDiv, 'height', px(videoHeight));
    fullscreen = false;
  } else {
    // The user just entered fullscreen
    if (!nativeFullscreen) {
      if (adsManager) {
        // Resize the ad container
        adsManager.resize(
            fullscreenWidth, fullscreenHeight,
            global.google.ima.ViewMode.FULLSCREEN);
        adsManagerWidthOnLoad = null;
        adsManagerHeightOnLoad = null;
      }
      // Make the video take up the entire screen
      setStyle(wrapperDiv, 'width', px(fullscreenWidth));
      setStyle(wrapperDiv, 'height', px(fullscreenHeight));
      hideControls();
    }
    fullscreen = true;
  }
  postMessage({event: 'fullscreenchange', isFullscreen: fullscreen});
}

/**
 * Show a subset of controls when ads are playing.
 * Visible controls are countdownDiv, muteUnmuteDiv, and fullscreenDiv
 *
 * @visibleForTesting
 */
export function showAdControls() {
  const hasMobileStyles = videoWidth <= 400;
  const isSkippable = currentAd ? currentAd.getSkipTimeOffset() !== -1 : false;
  const miniControls = hasMobileStyles && isSkippable;
  // hide non-ad controls
  const hideElement = button => setStyle(button, 'display', 'none');
  [playPauseDiv, timeDiv, progressBarWrapperDiv].forEach(hideElement);
  // set ad control styles
  setStyles(controlsDiv, {
    'height': miniControls ? '20px' : '30px',
    'justify-content': 'flex-end',
    'padding': '10px',
  });
  const buttonDefaults = {
    'height': miniControls ? '18px' : '22px',
  };
  setStyles(fullscreenDiv, buttonDefaults);
  setStyles(muteUnmuteDiv, Object.assign(buttonDefaults, {
    'margin-right': '10px',
  }));
  // show ad controls
  setStyle(countdownWrapperDiv, 'display', 'flex');
  showControls();
}

/**
 * Reinstate access to all controls when ads have ended.
 *
 * @visibleForTesting
 */
export function resetControlsAfterAd() {
  // hide ad controls
  setStyle(countdownWrapperDiv, 'display', 'none');
  // set non-ad control styles
  setStyles(controlsDiv, {
    'justify-content': 'center',
    'height': '100px',
    'padding': '60px 10px 10px',
  });
  const buttonDefaults = {'height': '30px'};
  setStyles(fullscreenDiv, buttonDefaults);
  setStyles(muteUnmuteDiv, Object.assign(buttonDefaults, {
    'margin-right': '20px',
  }));
  // show non-ad controls
  const showElement = button => setStyle(button, 'display', 'block');
  [playPauseDiv, timeDiv, progressBarWrapperDiv].forEach(showElement);
}

/**
 * Show video controls and reset hide controls timeout.
 *
 * @visibleForTesting
 */
export function showControls() {
  if (!controlsVisible) {
    setStyle(controlsDiv, 'display', 'flex');
    controlsVisible = true;
  }

  // Hide controls after 3 seconds
  if (playerState == PlayerStates.PLAYING) {
    // Reset hide controls timer.
    // Be sure to keep the timer greater than showControlsThrottled.
    clearInterval(hideControlsTimeout);
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
    setStyle(controlsDiv, 'display', 'none');
    controlsVisible = false;
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
    case 'playVideo':
      if (adsActive) {
        adsManager.resume();
        postMessage({event: VideoEvents.PLAYING});
      } else if (playbackStarted) {
        playVideo();
      } else {
        // Auto-play support
        onBigPlayClick(global);
      }
      break;
    case 'pauseVideo':
      if (adsActive) {
        adsManager.pause();
        postMessage({event: VideoEvents.PAUSE});
      } else if (playbackStarted) {
        pauseVideo();
      }
      break;
    case 'mute':
      muteVideo();
      break;
    case 'unMute':
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
        setStyles(wrapperDiv, {
          'width': px(args.width),
          'height': px(args.height),
        });
        setStyles(bigPlayDiv, {
          'width': px(args.width),
          'height': px(args.height),
        });
        if (adsActive && !fullscreen) {
          adsManager.resize(
              args.width, args.height,
              global.google.ima.ViewMode.NORMAL);
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
    case 'enterFullscreen':
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
  window.parent./*OK*/postMessage(data, '*');
}


/**
 * Returns the properties we need to access for testing.
 *
 * @visibleForTesting
 */
export function getPropertiesForTesting() {
  return {
    adContainerDiv,
    allAdsCompleted,
    adRequestFailed,
    adsActive,
    adsManagerWidthOnLoad,
    adsManagerHeightOnLoad,
    adsRequest,
    bigPlayDiv,
    contentComplete,
    controlsDiv,
    controlsVisible,
    hideControlsTimeout,
    imaLoadAllowed,
    interactEvent,
    playbackStarted,
    playerState,
    PlayerStates,
    playPauseDiv,
    progressLine,
    progressMarkerDiv,
    timeNode,
    uiTicker,
    videoPlayer,
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
 * Sets the big play button div.
 * @param {!Element} div
 * @visibleForTesting
 */
export function setBigPlayDivForTesting(div) {
  bigPlayDiv = div;
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
  videoPlayer.muted = shouldMute;
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
  videoPlayer = newPlayer;
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
 * Sets the consent state.
 * @param {*} newConsentState
 * @visibleForTesting
 */
export function setConsentStateForTesting(newConsentState) {
  consentState = newConsentState;
}

/**
 * Events
 *
 * Copied from src/video-interface.js.
 *
 * @constant {!Object<string, string>}
 */
// TODO(aghassemi, #9216): Use video-interface.js
const VideoEvents = {
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
   * Fired when the video's visibility changes. Normally fired
   * from `viewportCallback`.
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
