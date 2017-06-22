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

// Time to wait before hiding the fullscreen button when the video returns from
// ad playback.
const hideControlsAfterAdTime = 500;

// Div wrapping our entire DOM.
let wrapperDiv;

// Div for our custom fullscreen button.
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

// Timeout used to hide controls after user action.
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

// Bound on click listener. Stored so we can remove it after first click.
let boundOnClickListener;

// Tracks whether or not we're allowing fullscreen.
let fullscreenEnabled;

// The amount of time, in ms, we should wait before hiding controls after the
// user taps on the video player on mobile.
let hideControlsTimes = {
  'afterPreroll': null,
  'onInteract': null,
  'afterExitFullscreen': null,
  'afterMidRoll': null
};

// Whether we are on a mobile device.
let onMobile;

// Wether or not the most recently played ad was the pre-roll ad.
let lastAdWasPreroll;

// Bound showControls method used for show controls on desktop fullscreen.
let boundShowControlsForFullscreen;

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
  // Trying to hide fullscreen button on iOS
  var css = 
      'video::-webkit-media-controls-fullscreen-button,' +
      'video::-webkit-media-controls-wireless-playback-picker-button' +
      '{' +
      '  display: none !important;' +
      '}',
    head = document.head || document.getElementsByTagName('head')[0],
    style = document.createElement('style');

  style.type = 'text/css';
  if (style.styleSheet){
    style.styleSheet.cssText = css;
  } else {
    style.appendChild(document.createTextNode(css));
  }

  head.appendChild(style);

  videoWidth = global./*OK*/innerWidth;
  videoHeight = global./*OK*/innerHeight;

  // Wraps *everything*.
  wrapperDiv = global.document.createElement('div');
  wrapperDiv.id = 'ima-wrapper';
  setStyle(wrapperDiv, 'width', videoWidth + 'px');
  setStyle(wrapperDiv, 'height', videoHeight + 'px');
  setStyle(wrapperDiv, 'background-color', 'black');

  fullscreenDiv = global.document.createElement('div');
  fullscreenDiv.id = 'fullscreen';
  setStyle(fullscreenDiv, 'display', 'none');
  setStyle(fullscreenDiv, 'width', '50px');
  setStyle(fullscreenDiv, 'height', '50px');
  setStyle(fullscreenDiv, 'background-color', 'red');
  setStyle(fullscreenDiv, 'position', 'absolute');
  setStyle(fullscreenDiv, 'top', '5px');
  setStyle(fullscreenDiv, 'left', '5px');

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
  videoPlayer.setAttribute('controls', true);

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

  contentDiv.appendChild(videoPlayer);
  wrapperDiv.appendChild(contentDiv);
  wrapperDiv.appendChild(fullscreenDiv);
  wrapperDiv.appendChild(adContainerDiv);
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

    buildDeviceProfile();
    boundOnClickListener = onClick.bind(null, global);
    wrapperDiv.addEventListener(interactEvent, boundOnClickListener);
    fullscreenDiv.addEventListener(interactEvent, onFullscreenClick);

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


/**
 * Sets platform-specific events and timeout durations based on the current
 * platform.
 */
function buildDeviceProfile() {
  if (navigator.userAgent.match(/iPhone/i)) {
    interactEvent = 'touchend';
    controlsEvent = 'touchend';
    mouseDownEvent = 'touchstart';
    mouseMoveEvent = 'touchmove';
    mouseUpEvent = 'touchend';
    onMobile = true;
    hideControlsTimes.afterPreroll = 500;
    hideControlsTimes.onInteract = 4000;
    hideControlsTimes.afterExitFullscreen = 4000;
    hideControlsTimes.afterMidRoll = 0;
  } else if (navigator.userAgent.match(/iPad/i)) {
    interactEvent = 'touchend';
    controlsEvent = 'touchend';
    mouseDownEvent = 'touchstart';
    mouseMoveEvent = 'touchmove';
    mouseUpEvent = 'touchend';
    onMobile = true;
    hideControlsTimes.afterPreroll = 4000;
    hideControlsTimes.onInteract = 4000;
    hideControlsTimes.afterExitFullscreen = 4000;
    hideControlsTimes.afterMidRoll = 0;
  } else if (navigator.userAgent.match(/Android/i)) {
    interactEvent = 'touchend';
    controlsEvent = 'touchend';
    mouseDownEvent = 'touchstart';
    mouseMoveEvent = 'touchmove';
    mouseUpEvent = 'touchend';
    onMobile = true;
    hideControlsTimes.afterPreroll = 500;
    hideControlsTimes.onInteract = 3000;
    hideControlsTimes.afterExitFullscreen = 500;
    hideControlsTimes.afterMidRoll = 500;
    videoPlayer.setAttribute(
        'controlsList', 'nodownload nofullscreen noremoteplayback');
  } else {
    interactEvent = 'click';
    controlsEvent = 'mouseover';
    mouseDownEvent = 'mousedown';
    mouseMoveEvent = 'mousemove';
    mouseUpEvent = 'mouseup';
    onMobile = false;
    hideControlsTimes.afterPreroll = 500;
    hideControlsTimes.onInteract = null;
    hideControlsTimes.afterExitFullscreen = 3000;
    hideControlsTimes.afterMidRoll = 500;
    videoPlayer.setAttribute('controlsList', 'nofullscreen');
    boundShowControlsForFullscreen = showControls.bind(null, 3000);
  }
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
  wrapperDiv.removeEventListener(interactEvent, boundOnClickListener);
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
      adsManager.start();
      onPlaybackStarted();
    } catch (adError) {
      playVideo();
      onPlaybackStarted();
    }
  } else if (!adRequestFailed) {
    // Ad request did not yet resolve but also did not yet fail.
    setTimeout(playAds.bind(null, global), 250);
  } else {
    // Ad request failed.
    playVideo();
    onPlaybackStarted();
  }
}

/**
 * Called when playback of ads or content has started.
 */
function onPlaybackStarted() {
  window.parent./*OK*/postMessage({event: VideoEvents.PLAY}, '*');
  wrapperDiv.addEventListener(controlsEvent, onInteractForControls);
  if (!onMobile) {
    wrapperDiv.addEventListener(
        'mouseout', () => { setTimeout(hideControls, 500) });
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
  adsManager.addEventListener(
      global.google.ima.AdEvent.Type.STARTED,
      onAdStarted);
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
  videoPlayer.removeAttribute('controls');
  setStyle(adContainerDiv, 'display', 'block');
  videoPlayer.removeEventListener('ended', onContentEnded);
  videoPlayer.pause();
  hideControls();
}

/**
 * Called by the IMA SDK. Resumes content after an ad break.
 *
 * @visibleForTesting
 */
export function onContentResumeRequested() {
  adsActive = false;
  videoPlayer.setAttribute('controls', true);
  if (!contentComplete) {
    // CONTENT_RESUME will fire after post-rolls as well, and we don't want to
    // resume content in that case.
    videoPlayer.addEventListener('ended', onContentEnded);
    playVideo();
    // Show fullscreen control temporarily, to align with native controls.
    let controlsTimeout;
    if (lastAdWasPreroll) {
      controlsTimeout = hideControlsTimes.afterPreroll;
      lastAdWasPreroll = false; 
    } else {
      controlsTimeout = hideControlsTimes.afterMidRoll;
    }
    showControls(controlsTimeout);
  }
}

/**
 * Called each time a new ad starts.
 */
function onAdStarted(adEvent) {
  if (adEvent.getAd().getAdPodInfo().getTimeOffset() == 0) {
    lastAdWasPreroll = true;
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
  window.parent./*OK*/postMessage({event: VideoEvents.PAUSE}, '*');
}

/**
 * Handles clicks on the wrapper div to show the fullscreen button.
 */
function onInteractForControls() {
  if (!adsActive && !nativeFullscreen) {
    showControls(hideControlsTimes.onInteract);
  }
}

/**
 * Shows the controls and sets a timeout for hiding them. Passing a timeout of
 * 0 will hide the controls.
 *
 * @param {opt_number} timeout If provided, how long to wait before hiding the
 *     controls. If 0, controls will be hidden instead of shown.If not provided,
 *     controls will show and will not auto-hide based on a timeout.
 */
function showControls(timeout) {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = null;
  }
  if (timeout == 0) {
    hideControls();
    return;
  }
  fullscreenDiv.style.display = 'block';
  if (timeout) {
    hideControlsTimeout = setTimeout(hideControls, timeout);
  }
}

/**
 * Hides the fullscreen button.
 */
function hideControls() {
  if (hideControlsTimeout) {
    clearTimeout(hideControlsTimeout);
    hideControlsTimeout = null;
  }
  fullscreenDiv.style.display = 'none';
}

/**
 * Called when the user clicks the fullscreen button.
 */
function onFullscreenClick() {
  if (fullscreen) {
    window.parent./*OK*/postMessage(
      {event: IMAVideoEvents.CANCEL_FULLSCREEN, confirm: true}, '*');
  } else {
    window.parent./*OK*/postMessage(
      {event: IMAVideoEvents.REQUEST_FULLSCREEN, confirm: true}, '*');
  }
}

/**
 * Called when the user clicks on the fullscreen button. Makes the video player
 * fullscreen
 */
function toggleFullscreen(global) {
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
      nativeFullscreen = true;
      videoPlayer.addEventListener(
        'webkitendfullscreen', onEndNativeFullscreen);
      videoPlayer.webkitEnterFullscreen();
      onFullscreenChange(global);
    }
  }
}

/**
 * Called when the fullscreen mode of the browser changes.
 */
function onFullscreenChange(global) {
  if (fullscreen) {
    // The user just exited fullscreen.
    // Resize the ad container.
    adsManager.resize(
        videoWidth, videoHeight, global.google.ima.ViewMode.NORMAL);
    adsManagerWidthOnLoad = null;
    adsManagerHeightOnLoad = null;
    // Return the video to its original size and position
    setStyle(wrapperDiv, 'width', videoWidth + 'px');
    setStyle(wrapperDiv, 'height', videoHeight + 'px');
    fullscreen = false;
    window.parent./*OK*/postMessage(
      {event: IMAVideoEvents.CANCEL_FULLSCREEN, confirm: false}, '*');
    if (!onMobile) {
      // Remove any lingering control hiding timeouts from fullscreen mode.
      if (hideControlsTimeout) {
        clearTimeout(hideControlsTimeout);
        hideControlsTimeout = null;
      }
      wrapperDiv.removeEventListener('mousemove', boundShowControlsForFullscreen);
    }
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
      if (!onMobile) {
        wrapperDiv.addEventListener(
          'mousemove', boundShowControlsForFullscreen);
      }
    }
    fullscreen = true;
  }
}

/**
 * Called when we exit native fullscreen.
 */
function onEndNativeFullscreen() {
  if (videoPlayer.paused) {
    // Exited fullscreen via "Done" button, this keeps controls on the screen
    // because the player is now paused.
    showControls();
    // Hide the controls when the user clicks play to resume playback - this
    // doesn't trigger our onInteractForControls listener.
    videoPlayer.addEventListener('play', onPlayAfterDoneFullscreen);
  } else {
    // Exited fullscreen via exit fullcsreen button in player controls, the
    // video keeps playing in inline mode.
    showControls(hideControlsTimes.afterExitFullscreen);
  }
  fullscreen = false;
  nativeFullscreen = false;
}

function onPlayAfterDoneFullscreen() {
  showControls(hideControlsTimes.onInteract);
  event.source.removeEventListener(onPlayAfterDoneFullscreen);
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
      case 'toggleFullscreen':
        toggleFullscreen(global);
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

/**
 * IMA Video Events
 *
 * @constant {!Object<string, string>}
 */
export const IMAVideoEvents = {
  /**
   * requestFullscreen
   *
   * Fired to add the allowfullscreen attribute to the iframe.
   *
   * @event requestFullscreen
   */
  REQUEST_FULLSCREEN: 'requestFullscreen',

  /**
   * cancelFullscreen
   *
   * Fired to remove the allowfullscreen attribute from the iframe.
   *
   * @event cancelFullscreen
   */
  CANCEL_FULLSCREEN: 'cancelFullscreen',
};
