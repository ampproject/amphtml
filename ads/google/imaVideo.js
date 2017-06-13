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

import {isObject} from '../../src/types';
import {loadScript} from '../../3p/3p';
import {setStyle} from '../../src/style';
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

// Character used for play icon.
const playChar = '\u25b6\ufe0e';

// Character used for pause icons.
const pauseChars = '\u258c\ufe0e\u258c\ufe0e';

// Character used for seek dot on progress bar.
const seekDot = '\u25cf\ufe0e';

// Characters used for fullscreen icon.
const fullscreenChars = '\u25ad\ufe0e';

// Div wrapping our entire DOM.
let wrapperDiv;

// Div containing big play button. Rendered before player starts.
let bigPlayDiv;

// Div contianing play button. Double-nested for alignment.
let playButtonDiv;

// Node containing play button characters.
let bigPlayButtonNode;

// Div containing player controls.
let controlsDiv;

// Div containing play or pause button.
let playPauseDiv;

// Node contianing play or pause characters.
let playPauseNode;

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

// Flag tracking if an ad request has failed.
let adRequestFailed;

// IMA SDK AdDisplayContainer object.
let adDisplayContainer;

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

// Flag tracking if ads are currently active.
let adsActive;

// Flag tracking if playback has started.
let playbackStarted;

// Timer used to hide controls after user action.
let hideControlsTimeout;

// Flag tracking if we need to mute the ads manager once it loads. Used for
// autoplay.
let muteAdsManagerOnLoaded;

// Flag tracking if we are in native fullscreen mode. Used for iPhone.
let nativeFullscreen;

// Used if the adsManager needs to be resized on load.
let adsManagerWidthOnLoad, adsManagerHeightOnLoad;

// Initial video dimensions.
let videoWidth, videoHeight;

/**
 * Loads the IMA SDK library.
 */
function getIma(global, cb) {
  loadScript(global, 'https://imasdk.googleapis.com/js/sdkloader/ima3.js', cb);
  //loadScript(global, 'https://storage.googleapis.com/gvabox/sbusolits/h5/debug/ima3.js', cb);
}

/**
 * The business.
 */
export function imaVideo(global, data) {

  videoWidth = global./*OK*/innerWidth;
  videoHeight = global./*OK*/innerHeight;

  // Wraps *everything*.
  wrapperDiv = global.document.createElement('div');
  wrapperDiv.id = 'ima-wrapper';
  setStyle(wrapperDiv, 'width', videoWidth + 'px');
  setStyle(wrapperDiv, 'height', videoHeight + 'px');
  setStyle(wrapperDiv, 'background-color', 'black');

  // Wraps the big play button we show before video start.
  bigPlayDiv = global.document.createElement('div');
  bigPlayDiv.id = 'ima-big-play';
  setStyle(bigPlayDiv, 'position', 'relative');
  setStyle(bigPlayDiv, 'width', videoWidth + 'px');
  setStyle(bigPlayDiv, 'height', videoHeight + 'px');
  setStyle(bigPlayDiv, 'display', 'table-cell');
  setStyle(bigPlayDiv, 'vertical-align', 'middle');
  setStyle(bigPlayDiv, 'text-align', 'center');
  setStyle(bigPlayDiv, 'cursor', 'pointer');
  // Inner div so we can v and h align.
  playButtonDiv = global.document.createElement('div');
  playButtonDiv.id = 'ima-play-button';
  setStyle(playButtonDiv, 'font-size', '10em');
  setStyle(playButtonDiv, 'color', 'white');
  setStyle(playButtonDiv, 'display', 'inline-block');
  setStyle(playButtonDiv, 'line-height', '0.5');
  // Play button text node.
  bigPlayButtonNode = global.document.createTextNode(playChar);
  playButtonDiv.appendChild(bigPlayButtonNode);
  bigPlayDiv.appendChild(playButtonDiv);

  // Video controls.
  controlsDiv = global.document.createElement('div');
  controlsDiv.id = 'ima-controls';
  setStyle(controlsDiv, 'position', 'absolute');
  setStyle(controlsDiv, 'bottom', '0px');
  setStyle(controlsDiv, 'width', '100%');
  setStyle(controlsDiv, 'height', '30px');
  setStyle(controlsDiv, 'background-color', '#EEEEEE');
  setStyle(controlsDiv, 'color', '#333333');
  setStyle(controlsDiv, 'display', 'none');
  setStyle(controlsDiv, '-webkit-touch-callout', 'none');
  setStyle(controlsDiv, '-webkit-user-select', 'none');
  setStyle(controlsDiv, '-khtml-user-select', 'none');
  setStyle(controlsDiv, '-moz-user-select', 'none');
  setStyle(controlsDiv, '-ms-user-select', 'none');
  setStyle(controlsDiv, 'user-select', 'none');
  // Play button
  playPauseDiv = global.document.createElement('div');
  playPauseDiv.id = 'ima-play-pause';
  setStyle(playPauseDiv, 'width', '30px');
  setStyle(playPauseDiv, 'height', '30px');
  setStyle(playPauseDiv, 'margin-left', '10px');
  setStyle(playPauseDiv, 'font-size', '1.25em');
  setStyle(playPauseDiv, 'float', 'left');
  setStyle(playPauseDiv, 'cursor', 'pointer');
  playPauseNode = global.document.createTextNode(playChar);
  playPauseDiv.appendChild(playPauseNode);
  controlsDiv.appendChild(playPauseDiv);
  // Current time and duration.
  timeDiv = global.document.createElement('div');
  timeDiv.id = 'ima-time';
  setStyle(timeDiv, 'width', '120px');
  setStyle(timeDiv, 'height', '30px');
  setStyle(timeDiv, 'line-height', '30px');
  setStyle(timeDiv, 'float', 'left');
  setStyle(timeDiv, 'text-align', 'center');
  timeNode = global.document.createTextNode('00:00 / 00:00');
  timeDiv.appendChild(timeNode);
  controlsDiv.appendChild(timeDiv);
  // Progress bar.
  progressBarWrapperDiv = global.document.createElement('div');
  progressBarWrapperDiv.id = 'ima-progress-wrapper';
  setStyle(progressBarWrapperDiv, 'height', '30px');
  setStyle(progressBarWrapperDiv, 'position', 'absolute');
  setStyle(progressBarWrapperDiv, 'left', '160px');
  setStyle(progressBarWrapperDiv, 'right', '50px');
  progressLine = global.document.createElement('div');
  progressLine.id = 'progress-line';
  setStyle(progressLine, 'background-color', '#00BBFF');
  setStyle(progressLine, 'height', '2px');
  setStyle(progressLine, 'margin-top', '14px');
  setStyle(progressLine, 'width', '0%');
  setStyle(progressLine, 'float', 'left');
  totalTimeLine = global.document.createElement('div');
  totalTimeLine.id = 'total-time-line';
  setStyle(totalTimeLine, 'background-color', '#333333');
  setStyle(totalTimeLine, 'height', '2px');
  setStyle(totalTimeLine, 'width', '100%');
  setStyle(totalTimeLine, 'margin-top', '14px');
  progressMarkerDiv = global.document.createElement('div');
  progressMarkerDiv.id = 'ima-progress-marker';
  setStyle(progressMarkerDiv, 'color', '#00BBFF');
  setStyle(progressMarkerDiv, 'height', '30px');
  setStyle(progressMarkerDiv, 'position', 'absolute');
  setStyle(progressMarkerDiv, 'font-size', '2em');
  setStyle(progressMarkerDiv, 'margin-top', '-5px');
  setStyle(progressMarkerDiv, 'left', '-1%');
  setStyle(progressMarkerDiv, 'cursor', 'default');
  progressMarkerDiv.appendChild(global.document.createTextNode(seekDot));
  progressBarWrapperDiv.appendChild(progressLine);
  progressBarWrapperDiv.appendChild(progressMarkerDiv);
  progressBarWrapperDiv.appendChild(totalTimeLine);
  controlsDiv.appendChild(progressBarWrapperDiv);
  // Fullscreen button
  fullscreenDiv = global.document.createElement('div');
  fullscreenDiv.id = 'ima-fullscreen';
  setStyle(fullscreenDiv, 'position', 'absolute');
  setStyle(fullscreenDiv, 'bottom', '0px');
  setStyle(fullscreenDiv, 'right', '10px');
  setStyle(fullscreenDiv, 'width', '30px');
  setStyle(fullscreenDiv, 'height', '30px');
  setStyle(fullscreenDiv, 'font-size', '1.25em');
  setStyle(fullscreenDiv, 'cursor', 'pointer');
  setStyle(fullscreenDiv, 'text-align', 'center');
  setStyle(fullscreenDiv, 'font-weight', 'bold');
  setStyle(fullscreenDiv, 'line-height', '1.4em');
  fullscreenDiv.appendChild(global.document.createTextNode(fullscreenChars));
  controlsDiv.appendChild(fullscreenDiv);

  // Ad container.
  adContainerDiv = global.document.createElement('div');
  adContainerDiv.id = 'ima-ad-container';
  setStyle(adContainerDiv, 'position', 'absolute');
  setStyle(adContainerDiv, 'top', '0px');
  setStyle(adContainerDiv, 'left', '0px');
  setStyle(adContainerDiv, 'width', '100%');
  setStyle(adContainerDiv, 'height', '100%');

  // Wraps our content video.
  contentDiv = global.document.createElement('div');
  contentDiv.id = 'ima-content';
  setStyle(contentDiv, 'position', 'absolute');
  setStyle(contentDiv, 'top', '0px');
  setStyle(contentDiv, 'left', '0px');
  setStyle(contentDiv, 'width', '100%');
  setStyle(contentDiv, 'height', '100%');
  // The video player
  videoPlayer = global.document.createElement('video');
  videoPlayer.id = 'ima-content-player';
  setStyle(videoPlayer, 'width', '100%');
  setStyle(videoPlayer, 'height', '100%');
  setStyle(videoPlayer, 'background-color', 'black');
  videoPlayer.setAttribute('poster', data.poster);
  videoPlayer.setAttribute('playsinline', true);
  // Set video player source, first based on data-src then on source child
  // elements.
  if (data.src) {
    const sourceElement = document.createElement('source');
    sourceElement.setAttribute('src', data.src);
    videoPlayer.appendChild(sourceElement);
  }
  if (data.sources) {
    const sources = JSON.parse(data.sources);
    sources.forEach(source => {
      videoPlayer.appendChild(htmlToElement(source));
    });
  }


  contentDiv.appendChild(videoPlayer);
  wrapperDiv.appendChild(contentDiv);
  wrapperDiv.appendChild(adContainerDiv);
  wrapperDiv.appendChild(controlsDiv);
  wrapperDiv.appendChild(bigPlayDiv);
  global.document.getElementById('c').appendChild(wrapperDiv);

  window.addEventListener('message', onMessage.bind(null, global));

  /**
   * Set-up code that can't run until the IMA lib loads.
   */
  getIma(global, function() {
    // This is the first place where we have access to any IMA objects.
    contentComplete = false;
    adsActive = false;
    playbackStarted = false;
    nativeFullscreen = false;

    interactEvent = 'click';
    mouseDownEvent = 'mousedown';
    mouseMoveEvent = 'mousemove';
    mouseUpEvent = 'mouseup';
    if (navigator.userAgent.match(/iPhone/i) ||
        navigator.userAgent.match(/iPad/i) ||
        navigator.userAgent.match(/Android/i)) {
      interactEvent = 'touchend';
      mouseDownEvent = 'touchstart';
      mouseMoveEvent = 'touchmove';
      mouseUpEvent = 'touchend';
    }
    bigPlayDiv.addEventListener(interactEvent, onClick.bind(null, global));
    playPauseDiv.addEventListener(interactEvent, onPlayPauseClick);
    progressBarWrapperDiv.addEventListener(mouseDownEvent, onProgressClick);
    fullscreenDiv.addEventListener(interactEvent,
        onFullscreenClick.bind(null, global));

    const fullScreenEvents = [
      'fullscreenchange',
      'mozfullscreenchange',
      'webkitfullscreenchange'];
    fullScreenEvents.forEach(fsEvent => {
      global.document.addEventListener(fsEvent,
        onFullscreenChange.bind(null, global),
        false);
    });

    adDisplayContainer =
        new global.google.ima.AdDisplayContainer(adContainerDiv, videoPlayer);

    adsLoader = new global.google.ima.AdsLoader(adDisplayContainer);
    adsLoader.getSettings().setPlayerType('amp-ima');
    adsLoader.getSettings().setPlayerVersion('0.1');
    adsLoader.addEventListener(
        global.google.ima.AdsManagerLoadedEvent.Type.ADS_MANAGER_LOADED,
        onAdsManagerLoaded.bind(null, global),
        false);
    adsLoader.addEventListener(
        global.google.ima.AdErrorEvent.Type.AD_ERROR,
        onAdsLoaderError,
        false);

    videoPlayer.addEventListener('ended', onContentEnded);

    const adsRequest = new global.google.ima.AdsRequest();
    adsRequest.adTagUrl = data.tag;
    adsRequest.linearAdSlotWidth = videoWidth;
    adsRequest.linearAdSlotHeight = videoHeight;
    adsRequest.nonLinearAdSlotWidth = videoWidth;
    adsRequest.nonLinearAdSlotHeight = videoHeight / 3;

    adRequestFailed = false;
    adsLoader.requestAds(adsRequest);
  });
}

function htmlToElement(html) {
  const template = document.createElement('template');
  template./*OK*/innerHTML = html;
  return template.content.firstChild;
}

/**
 * Triggered when the user clicks on the big play button div.
 *
 * @visibleForTesting
 */
export function onClick(global) {
  playbackStarted = true;
  uiTicker = setInterval(uiTickerClick, 500);
  bigPlayDiv.removeEventListener(interactEvent, onClick);
  setStyle(bigPlayDiv, 'display', 'none');
  adDisplayContainer.initialize();
  videoPlayer.load();
  playAds(global);
}

/**
 * Starts ad playback. If the ad request has not yte resolved, calls itself
 * again after 250ms.
 *
 * @visibleForTesting
 */
export function playAds(global) {
  if (adsManager) {
    // Ad request resolved.
    try {
      adsManager.init(
          videoWidth, videoHeight, global.google.ima.ViewMode.NORMAL);
      window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
      adsManager.start();
    } catch (adError) {
      window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
      playVideo();
    }
  } else if (!adRequestFailed) {
    // Ad request did not yet resolve but also did not yet fail.
    setTimeout(playAds.bind(null, global), 250);
  } else {
    // Ad request failed.
    window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
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
  adsLoader.contentComplete();
}

/**
 * Called when the IMA SDK has an AdsManager ready for us.
 *
 * @visibleForTesting
 */
export function onAdsManagerLoaded(global, adsManagerLoadedEvent) {
  const adsRenderingSettings = new global.google.ima.AdsRenderingSettings();
  adsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete = true;
  adsRenderingSettings.uiElements =
  [global.google.ima.UiElements.AD_ATTRIBUTION,
    global.google.ima.UiElements.COUNTDOWN];
  adsManager = adsManagerLoadedEvent.getAdsManager(videoPlayer,
      adsRenderingSettings);
  adsManager.addEventListener(global.google.ima.AdErrorEvent.Type.AD_ERROR,
      onAdError);
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.CONTENT_PAUSE_REQUESTED,
      onContentPauseRequested.bind(null, global));
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.CONTENT_RESUME_REQUESTED,
      onContentResumeRequested);
  if (muteAdsManagerOnLoaded) {
    adsManager.setVolume(0);
  }
  window.parent./*OK*/postMessage({event: VideoEvents.LOAD}, '*');
}

/**
 * Called when we encounter an error trying to load ads.
 *
 * @visibleForTesting
 */
export function onAdsLoaderError() {
  adRequestFailed = true;
  playVideo();
}

/**
 * Called when we encounter an error trying to play ads.
 *
 * @visibleForTesting
 */
export function onAdError() {
  if (adsManager) {
    adsManager.destroy();
  }
  playVideo();
}

/**
 * Called by the IMA SDK. Pauses the content and readies the player for ads.
 *
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
  videoPlayer.removeEventListener(interactEvent, showControls);
  setStyle(adContainerDiv, 'display', 'block');
  videoPlayer.removeEventListener('ended', onContentEnded);
  hideControls();
  videoPlayer.pause();
}

/**
 * Called by the IMA SDK. Resumes content after an ad break.
 *
 * @visibleForTesting
 */
export function onContentResumeRequested() {
  adsActive = false;
  videoPlayer.addEventListener(interactEvent, showControls);
  if (!contentComplete) {
    // CONTENT_RESUME will fire after post-rolls as well, and we don't want to
    // resume content in that case.
    videoPlayer.addEventListener('ended', onContentEnded);
    playVideo();
  }
}

/**
 * Called when our ui timer goes off. Updates the player UI.
 */
function uiTickerClick() {
  updateUi(videoPlayer.currentTime, videoPlayer.duration);
}

/**
 * Updates the video player UI.
 *
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
 *
 * @visibleForTesting
 */
export function formatTime(time) {
  if (isNaN(time)) {
    return '00:00';
  }
  let timeString = '';
  const hours = Math.floor(time / 3600);
  if (hours > 0) {
    timeString += hours + ':';
  }
  const minutes = Math.floor((time % 3600) / 60);
  timeString += zeroPad(minutes) + ':';
  const seconds = Math.floor(time - ((hours * 3600) + (minutes * 60)));
  timeString += zeroPad(seconds);
  return timeString;
}

/**
 * Zero-pads the provided int and returns a string of length 2.
 *
 * @visibleForTesting
 */
export function zeroPad(input) {
  input = String(input);
  return input.length == 1 ? '0' + input : input;
}

/**
 * Detects clicks on the progress bar.
 */
function onProgressClick(event) {
  // Call this logic once to make sure we still seek if the user just clicks
  // instead of clicking and dragging.
  clearInterval(hideControlsTimeout);
  onProgressMove(event);
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
 */
function getPagePosition(el) {
  let lx, ly;
  for (lx = 0, ly = 0;
      el != null;
      lx += el./*OK*/offsetLeft, ly += el./*OK*/offsetTop,
          el = el./*OK*/offsetParent)
    {};
  return {x: lx,y: ly};
}

/**
 * Called when the user clicks on the play / pause button.
 *
 * @visibleForTesting
 */
export function onPlayPauseClick() {
  if (playerState == PlayerStates.PLAYING) {
    pauseVideo(null);
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
  setStyle(playPauseDiv, 'line-height', '1.4em');
  playPauseNode.textContent = pauseChars;
  window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
  videoPlayer.play();
}

/**
 * Pauses the video player.
 *
 * @visibleForTesting
 */
export function pauseVideo(event) {
  videoPlayer.pause();
  playerState = PlayerStates.PAUSED;
  // Show controls and keep them there because we're paused.
  clearInterval(hideControlsTimeout);
  if (!adsActive) {
    showControls();
  }
  playPauseNode.textContent = playChar;
  setStyle(playPauseDiv, 'line-height', '');;
  window.parent./*OK*/postMessage({event: VideoEvents.PAUSE}, '*');
  if (event && event.type == 'webkitendfullscreen') {
    // Video was paused because we exited fullscreen.
    videoPlayer.removeEventListener('webkitendfullscreen', pauseVideo);
  }
}

/**
 * Called when the user clicks on the fullscreen button. Makes the video player
 * fullscreen
 */
function onFullscreenClick(global) {
  if (fullscreen) {
    // The video is currently in fullscreen mode
    const cancelFullscreen = global.document.exitFullscreen ||
        global.document.exitFullScreen ||
        global.document.webkitCancelFullScreen ||
        global.document.mozCancelFullScreen;
    if (cancelFullscreen) {
      cancelFullscreen.call(document);
    }
  } else {
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
      // Figure out how to make iPhone fullscren work here - I've got nothing.
      videoPlayer.webkitEnterFullscreen();
      // Pause the video when we leave fullscreen. iPhone does this
      // automatically, but we still use pauseVideo as an event handler to
      // sync the UI.
      videoPlayer.addEventListener('webkitendfullscreen', pauseVideo);
      nativeFullscreen = true;
      onFullscreenChange(global);
    }
  }
}

/**
 * Called when the fullscreen mode of the browser or content player changes.
 */
function onFullscreenChange(global) {
  if (fullscreen) {
    // Resize the ad container
    adsManager.resize(
        videoWidth, videoHeight, global.google.ima.ViewMode.NORMAL);
    adsManagerWidthOnLoad = null;
    adsManagerHeightOnLoad = null;
    // Return the video to its original size and position
    setStyle(wrapperDiv, 'width', videoWidth + 'px');
    setStyle(wrapperDiv, 'height', videoHeight + 'px');
    fullscreen = false;
  } else {
    // The user just entered fullscreen
    if (!nativeFullscreen) {
      // Resize the ad container
      adsManager.resize(
          fullscreenWidth, fullscreenHeight,
          global.google.ima.ViewMode.FULLSCREEN);
      adsManagerWidthOnLoad = null;
      adsManagerHeightOnLoad = null;
      // Make the video take up the entire screen
      setStyle(wrapperDiv, 'width', fullscreenWidth + 'px');
      setStyle(wrapperDiv, 'height', fullscreenHeight + 'px');
      hideControls();
    }
    fullscreen = true;
  }
}

/**
 * Show video controls and reset hide controls timeout.
 *
 * @visibleForTesting
 */
export function showControls() {
  setStyle(controlsDiv, 'display', 'block');
  // Hide controls after 3 seconds
  if (playerState == PlayerStates.PLAYING) {
    // Reset hide controls timer.
    clearInterval(hideControlsTimeout);
    hideControlsTimeout = setTimeout(hideControls, 3000);
  }
}

/**
 * Hide video controls.
 *
 * @visibleForTesting
 */
export function hideControls() {
  setStyle(controlsDiv, 'display', 'none');
}

/**
 * Handles messages from the top window.
 */
function onMessage(global, event) {
  const msg = isObject(event.data) ? event.data : tryParseJson(event.data);
  if (msg === undefined) {
    return; // We only process valid JSON.
  }
  if (msg.event && msg.func) {
    switch (msg.func) {
      case 'playVideo':
        if (adsActive) {
          adsManager.resume();
          window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
        } else if (playbackStarted) {
          playVideo();
        } else {
          // Auto-play support
          onClick(global);
        }
        break;
      case 'pauseVideo':
        if (adsActive) {
          adsManager.pause();
          window.parent./*OK*/postMessage({event: VideoEvents.PAUSE}, '*');
        } else if (playbackStarted) {
          pauseVideo(null);
        }
        break;
      case 'mute':
        videoPlayer.volume = 0;
        videoPlayer.muted = true;
        if (adsManager) {
          adsManager.setVolume(0);
        } else {
          muteAdsManagerOnLoaded = true;
        }
        window.parent./*OK*/postMessage({event: VideoEvents.MUTED}, '*');
        break;
      case 'unMute':
        videoPlayer.volume = 1;
        videoPlayer.muted = false;
        if (adsManager) {
          adsManager.setVolume(1);
        } else {
          muteAdsManagerOnLoaded = false;
        }
        window.parent./*OK*/postMessage({event: VideoEvents.UNMUTED}, '*');
        break;
      case 'resize':
        if (msg.args && msg.args.width && msg.args.height) {
          setStyle(wrapperDiv, 'width', msg.args.width + 'px');
          setStyle(wrapperDiv, 'height', msg.args.height + 'px');
          setStyle(bigPlayDiv, 'width', msg.args.width + 'px');
          setStyle(bigPlayDiv, 'height', msg.args.height + 'px');
          if (adsActive) {
            adsManager.resize(
                msg.args.width, msg.args.height,
                global.google.ima.ViewMode.NORMAL);
          } else {
            adsManagerWidthOnLoad = msg.args.width;
            adsManagerHeightOnLoad = msg.args.height;
          }
        }
        break;
    }
  }
}

/**
 * Returns the properties we need to access for testing.
 *
 * @visibleForTesting
 */
export function getPropertiesForTesting() {
  return {adContainerDiv, adRequestFailed, adsActive, adsManagerWidthOnLoad,
    adsManagerHeightOnLoad, contentComplete, controlsDiv, hideControlsTimeout,
    interactEvent, pauseChars, playbackStarted, playChar, playerState,
    PlayerStates, playPauseDiv, playPauseNode, progressLine,
    progressMarkerDiv, timeNode, uiTicker, videoPlayer};
}

/**
 * Sets the big play button div.
 *
 * @visibleForTesting
 */
export function setBigPlayDivForTesting(div) {
  bigPlayDiv = div;
}

/**
 * Sets the ad display container.
 *
 * @visibleForTesting
 */
export function setAdDisplayContainerForTesting(adc) {
  adDisplayContainer = adc;
}

/**
 * Sets the video width and height.
 *
 * @visibleForTesting
 */
export function setVideoWidthAndHeightForTesting(width, height) {
  videoWidth = width;
  videoHeight = height;
}

/**
 * Sets the ad request failed flag.
 *
 * @visibleForTesting
 */
export function setAdRequestFailedForTesting(newValue) {
  adRequestFailed = newValue;
}

/**
 * Sets the ads loader.
 *
 * @visibleForTesting
 */
export function setAdsLoaderForTesting(newAdsLoader) {
  adsLoader = newAdsLoader;
}

/**
 * Sets the flag to mute the ads manager when it loads.
 *
 * @visibleForTesting
 */
export function setMuteAdsManagerOnLoadedForTesting(shouldMute) {
  muteAdsManagerOnLoaded = shouldMute;
}

/**
 * Sets the ads manager.
 *
 * @visibleForTesting
 */
export function setAdsManagerForTesting(newAdsManager) {
  adsManager = newAdsManager;
}

/**
 * Sets the ads manager dimensions on load.
 *
 * @visibleForTesting
 */
export function setAdsManagerDimensionsOnLoadForTesting(width, height) {
  adsManagerWidthOnLoad = width;
  adsManagerHeightOnLoad = height;
}

/**
 * Sets the content complete flag.
 *
 * @visibleForTesting
 */
export function setContentCompleteForTesting(newContentComplete) {
  contentComplete = newContentComplete;
}

/**
 * Sets the video player.
 *
 * @visibleForTesting
 */
export function setVideoPlayerForTesting(newPlayer) {
  videoPlayer = newPlayer;
}

/**
 * Sets the player state.
 *
 * @visibleForTesting
 */
export function setPlayerStateForTesting(newState) {
  playerState = newState;
}

/**
 * Sets the hideControlsTimeout
 *
 * @visibleForTesting
 */
export function setHideControlsTimeoutForTesting(newTimeout) {
  hideControlsTimeout = newTimeout;
}

/**
 * Events
 *
 * Copied from src/video-interface.js.
 *
 * @constant {!Object<string, string>}
 */
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
  PLAY: 'play',

  /**
   * pause
   *
   * Fired when the video pauses.
   *
   * @event pause
   */
  PAUSE: 'pause',

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
   * @event pause
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
};
