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

import {CSS} from '../../../build/amp-moviads-player-0.1.css';
import {Deferred} from '../../../src/utils/promise';
import {ImaPlayerData} from './ima-player-data';
import {Services} from '../../../src/services';
import {
  VideoEvents,
  changeMinVisibilityRatioForAutoplay,
} from './moviads-interface';
import {addUnsafeAllowAutoplay} from '../../../src/iframe-video';
import {assertHttpsUrl} from '../../../src/url';
import {
  childElementsByTag,
  isJsonScriptTag,
  removeElement,
} from '../../../src/dom';
import {dict} from '../../../src/utils/object';
import {getConsentPolicyState} from '../../../src/consent';
import {getData, listen} from '../../../src/event-helper';
import {getIframe, preloadBootstrap} from '../../../src/3p-frame';
import {installVideoManagerForDoc} from '../../../src/service/video-manager-impl';
import {isEnumValue, isObject, toArray} from '../../../src/types';
import {isLayoutSizeDefined} from '../../../src/layout';
import {px, setStyle, setStyles} from '../../../src/style';

/** @const */
const EXPERIMENT = 'amp-moviads-player';

/** @const */
const TAG = 'amp-moviads-player';

/**
 * @implements {../../../src/video-interface.VideoInterface}
 */
class AmpMoviadsPlayer extends AMP.BaseElement {
  /** @param {!AmpElement} element */
  constructor(element) {
    super(element);

    /** @private {?Element} */
    this.iframe_ = null;

    /** @private {?../../../src/service/viewport/viewport-interface.ViewportInterface} */
    this.viewport_ = null;

    /** @private {?Promise} */
    this.playerReadyPromise_ = null;

    /** @private {?Function} */
    this.playerReadyResolver_ = null;

    /** @private {?Function} */
    this.unlistenMessage_ = null;

    /** @private {?string} */
    this.preconnectSource_ = null;

    /** @private {?string} */
    this.preconnectTrack_ = null;

    /** @private {boolean} */
    this.isFullscreen_ = false;

    /** @private {array} */
    this.configLocal_ = [];

    /** @private {array} */
    this.configMap_ = [];

    /** @private {array} */
    this.config_ = [];

    /** @private {boolean} */
    this.isAdStart_ = false;

    /** @private {boolean} */
    this.showLogoMovie_ = false;

    /** @private {boolean} */
    this.isClickUnmute_ = false;

    /** @private {boolean} */
    this.isAmpCloseClick_ = false;

    /**
     * Maps events to their unlisteners.
     * @private {!Object<string, function()>}
     */
    this.unlisteners_ = {};

    /** @private {!ImaPlayerData} */
    this.playerData_ = new ImaPlayerData();

    /** @private {?string} */
    this.recommendedSrc_ = '';

    /** @private {?string} */
    this.recommendedPoster_ = '';

    /** @private {string} */
    this.gaUser_ = 'user';

    /** @private {string} */
    this.gaMoviads_ = 'moviads';

    /** @private {?string} */
    this.gaUserUA_ = null;

    /** @private {?string} */
    this.gaMoviadsUA_ = null;

    /** @private {?boolean} */
    this.adblockDetected_ = false;

    /** @private {?integer} */
    this.playerResizeWidth_ = null;

    /** @private {?integer} */
    this.playerResizeHeight_ = null;

    /** @private {boolean} */
    this.closeActive_ = false;
  }

  /** @override */
  buildCallback() {
    this.detectedAdBlock();
    if (typeof mapConfig !== 'undefined') {
      this.configMap_ = mapConfig;
    }
    if (this.element.getAttribute('data-conf')) {
      this.config_ = new Function(
        'return (' + this.element.getAttribute('data-conf') + ')'
      )();
    }
    this.mapConfig();
    const script = document.createElement('script');
    script.src =
      this.config_.masterDomain +
      '/config/' +
      this.config_.playerIdConf +
      '_conf.js?' +
      Math.floor(Date.now() / 1000);
    document.head.appendChild(script);
    const _this = this;
    script.onload = function() {
      if (typeof mapLocalConfig !== 'undefined') {
        _this.configLocal_ = mapLocalConfig;
        _this.ampImaPlayerDebug(mapLocalConfig);
        _this.ampImaPlayerDebug('Load config.js');
      }
      if (_this.configLocal_.keyPrivate !== _this.config_.playerIdConf) {
        return;
      }
      _this.element.setAttribute('data-tag', _this.configLocal_.vastUrl);
      _this.viewport_ = _this.getViewport();
      _this.mapExternalConfig();
      let viewabilityProc = 0.5;
      if (_this.configLocal_.viewabilityProc !== undefined) {
        viewabilityProc = _this.configLocal_.viewabilityProc;
      }
      changeMinVisibilityRatioForAutoplay(viewabilityProc);
      if (_this.element.getAttribute('data-delay-ad-request') === 'true') {
        _this.unlisteners_['onFirstScroll'] = _this.viewport_.onScroll(() => {
          _this.sendCommand_('onFirstScroll');
        });
        // Request ads after 3 seconds, if something else doesn't trigger an ad
        // request before that.
        Services.timerFor(_this.win).delay(() => {
          _this.sendCommand_('onAdRequestDelayTimeout');
        }, 3000);
      }
      //Handle <source> and <track> children
      const sourceElements = childElementsByTag(_this.element, 'SOURCE');
      const trackElements = childElementsByTag(_this.element, 'TRACK');
      const childElements = toArray(sourceElements).concat(
        toArray(trackElements)
      );
      if (childElements.length > 0) {
        const children = [];
        childElements.forEach(child => {
          // Save the first source and first track to preconnect.
          if (child.tagName == 'SOURCE' && !this.preconnectSource_) {
            this.preconnectSource_ = child.src;
          } else if (child.tagName == 'TRACK' && !this.preconnectTrack_) {
            this.preconnectTrack_ = child.src;
          }
          children.push(child./*OK*/ outerHTML);
        });
        _this.element.setAttribute(
          'data-child-elements',
          JSON.stringify(children)
        );
      }
      // Handle IMASetting JSON
      const scriptElement = childElementsByTag(_this.element, 'SCRIPT')[0];
      if (scriptElement && isJsonScriptTag(scriptElement)) {
        _this.element.setAttribute(
          'data-ima-settings',
          scriptElement./*OK*/ innerHTML
        );
      }
      _this.loadMethod();
      _this.mute();
    };
  }

  /** @override */
  preconnectAds() {
    const {element, preconnect} = this;
    if (typeof preconnect !== 'undefined') {
      preconnect.preload(
        'https://imasdk.googleapis.com/js/sdkloader/ima3.js',
        'script'
      );
      const source = this.configLocal_.vastUrl;
      if (source) {
        preconnect.url(source);
      }
      if (this.preconnectSource_) {
        preconnect.url(this.preconnectSource_);
      }
      if (this.preconnectTrack_) {
        preconnect.url(this.preconnectTrack_);
      }

      preloadBootstrap(this.win, preconnect);
    }
  }

  /** @override */
  isLayoutSupported(layout) {
    return isLayoutSizeDefined(layout);
  }

  /** @override */
  getConsentPolicy() {
    return null;
  }

  /** @override */
  layoutLoad() {
    const {element, win} = this;
    const consentPolicyId = super.getConsentPolicy();
    const consentPromise = consentPolicyId
      ? getConsentPolicyState(element, consentPolicyId)
      : Promise.resolve(null);

    element.setAttribute('data-tag', this.configLocal_.vastUrl);
    element.setAttribute(
      'data-poster',
      this.recommendedPoster_ !== ''
        ? this.recommendedPoster_
        : this.config_.moviePosterSrc
    );
    element.setAttribute(
      'data-src',
      this.recommendedSrc_ !== '' ? this.recommendedSrc_ : this.config_.dataSrc
    );
    element.setAttribute(
      'data-ad-label',
      this.config_['langText']['advertisement'] + ' (%s / %s)'
    );

    this.resizeContainerPlayer();

    if (true === this.config_.autoplay) {
      element.setAttribute('autoplay', true);
    }

    return consentPromise.then(initialConsentState => {
      const iframe = getIframe(
        win,
        element,
        'ima-moviads-player',
        {initialConsentState},
        {allowFullscreen: true}
      );

      this.applyFillContent(iframe);

      // This is temporary until M74 launches.
      // TODO(aghassemi, #21247)
      addUnsafeAllowAutoplay(iframe);

      this.iframe_ = iframe;

      const deferred = new Deferred();
      this.playerReadyPromise_ = deferred.promise;
      this.playerReadyResolver_ = deferred.resolve;

      this.unlistenMessage_ = listen(this.win, 'message', e =>
        this.handlePlayerMessage_(/** @type {!Event} */ (e))
      );

      element.appendChild(iframe);

      installVideoManagerForDoc(element);
      Services.videoManagerForDoc(element).register(this);

      return this.loadPromise(iframe).then(() => this.playerReadyPromise_);
    });
  }

  /** @override */
  viewportCallback(visible) {
    this.element.dispatchCustomEvent(VideoEvents.VISIBILITY, {visible});
  }

  /** @override */
  unlayoutCallback() {
    if (this.iframe_) {
      removeElement(this.iframe_);
      this.iframe_ = null;
    }
    if (this.unlistenMessage_) {
      this.unlistenMessage_();
    }

    const deferred = new Deferred();
    this.playerReadyPromise_ = deferred.promise;
    this.playerReadyResolver_ = deferred.resolve;
    return true;
  }

  /** @override */
  onLayoutMeasure() {
    if (!this.iframe_) {
      return;
    }
    const {width, height} = this.getLayoutBox();
    this.sendCommand_('resize', {'width': width, 'height': height});
  }

  /**
   * Sends a command to the player through postMessage. NOTE: All commands sent
   * before imaVideo fires VideoEvents.LOAD will be queued until that event
   * fires.
   * @param {string} command
   * @param {Object=} opt_args
   * @private
   */
  sendCommand_(command, opt_args) {
    if (this.iframe_ && this.iframe_.contentWindow) {
      this.playerReadyPromise_.then(() => {
        this.iframe_.contentWindow./*OK*/ postMessage(
          JSON.stringify(
            dict({
              'event': 'command',
              'func': command,
              'args': opt_args || '',
            })
          ),
          '*'
        );
      });
    }
    // If we have an unlistener for this command, call it.
    if (this.unlisteners_[command]) {
      this.unlisteners_[command]();
    }
  }

  /**
   * @param {!Event} event
   * @private
   */
  handlePlayerMessage_(event) {
    if (event.source != this.iframe_.contentWindow) {
      return;
    }
    const eventData = getData(event);
    if (!isObject(eventData)) {
      return;
    }

    const videoEvent = eventData['event'];

    if (videoEvent === VideoEvents.AD_START) {
      this.sendCommand_('debug', this.config_.debug);
      this.ampImaPlayerDebug('AD_START');
      this.sendCommand_('gaParams', {
        UA: this.gaUserUA_,
        name: this.gaUser_,
        id: this.config_.movieContenerId,
      });
      this.setCssPublisher();
      this.isAdStart_ = true;
      this.eventGA('AD_START', this.gaUser_, this.gaUserUA_);
      this.eventGA('AD_START', this.gaMoviads_, this.gaMoviadsUA_);
    }
    if (videoEvent === VideoEvents.UNMUTED) {
      this.ampImaPlayerDebug('UNMUTED');
      this.isClickUnmute_ = true;
      this.setVolume(this.config_.volume);
      this.eventGA('UNMUTED', this.gaUser_, this.gaUserUA_);
    }
    if (videoEvent === VideoEvents.MUTED) {
      this.ampImaPlayerDebug('MUTED');
      this.eventGA('MUTED', this.gaUser_, this.gaUserUA_);
    }

    if (videoEvent === VideoEvents.PLAYING) {
      this.ampImaPlayerDebug('PLAYING VIDEO');
      if (document.getElementById('amp-ima-player-recommended') !== null) {
        document.getElementById('amp-ima-player-recommended').remove();
      }
    }

    if (videoEvent === VideoEvents.PAUSE) {
      this.ampImaPlayerDebug('PAUSE VIDEO');
    }

    if (videoEvent === VideoEvents.PLAYING && this.isAdStart_ === false) {
      this.showLogoMovie_ = true;
      this.ampImaPlayerDebug('AD_EMPTY');
      this.setCssPublisher();
      this.eventGA('AD_EMPTY', this.gaUser_, this.gaUserUA_);
      this.hideWhenNoAd();
    }
    if (videoEvent === VideoEvents.AD_END) {
      this.ampImaPlayerDebug('AD_END');
      this.showLogoMovie_ = true;
      this.eventGA('AD_END', this.gaUser_, this.gaUserUA_);
      this.eventGA('AD_END', this.gaMoviads_, this.gaMoviadsUA_);
    }
    if (videoEvent === VideoEvents.ENDED) {
      this.eventGA('ENDED', this.gaUser_, this.gaUserUA_);
      this.LoadRecommendedVideo();
      this.hideWhenEnd();
      this.ampImaPlayerDebug('ENDED');
      this.functionAfterEnded();
      this.config_.functionAfterEnded = null;
    }

    if (isEnumValue(VideoEvents, videoEvent)) {
      if (videoEvent === VideoEvents.LOAD) {
        this.playerReadyResolver_(this.iframe_);
      }
      this.element.dispatchCustomEvent(videoEvent);
      return;
    }

    if (videoEvent == ImaPlayerData.IMA_PLAYER_DATA) {
      this.playerData_ = /** @type {!ImaPlayerData} */ (eventData['data']);
      return;
    }
    if (videoEvent == 'fullscreenchange') {
      this.ampImaPlayerDebug('FULLSCREEN MODE');
      this.resizeContainerPlayer();
      this.isFullscreen_ = !!eventData['isFullscreen'];
      return;
    }
  }

  // VideoInterface Implementation. See ../src/video-interface.VideoInterface

  /** @override */
  supportsPlatform() {
    return true;
  }

  /** @override */
  isInteractive() {
    return true;
  }

  /** @override */
  play(unusedIsAutoplay) {
    this.sendCommand_('playVideo');
    if (document.getElementById('amp-ima-player-recommended') !== null) {
      document.getElementById('amp-ima-player-recommended').remove();
    }
  }

  /** @override */
  pause() {
    this.sendCommand_('pauseVideo');
  }

  /** @override */
  mute() {
    this.sendCommand_('mute');
  }

  /** @override */
  unmute() {
    this.sendCommand_('unMute');
    this.isClickUnmute_ = true;
    this.ampImaPlayerDebug('unMute');
    this.setVolume(this.config_.volume);
  }

  /** @override */
  showControls() {
    this.sendCommand_('showControls');
  }

  /** @override */
  hideControls() {
    this.sendCommand_('hideControls');
  }

  /** @override */
  fullscreenEnter() {
    this.sendCommand_('enterFullscreen');
  }

  /** @override */
  fullscreenExit() {
    this.sendCommand_('exitFullscreen');
  }

  /** @override */
  isFullscreen() {
    return this.isFullscreen_;
  }

  /** @override */
  getMetadata() {
    // Not implemented
  }

  /** @override */
  preimplementsMediaSessionAPI() {
    return false;
  }

  /** @override */
  preimplementsAutoFullscreen() {
    return false;
  }

  /** @override */
  getCurrentTime() {
    return this.playerData_.currentTime;
  }

  /** @override */
  getDuration() {
    return this.playerData_.duration;
  }

  /** @override */
  getPlayedRanges() {
    return this.playerData_.playedRanges;
  }

  /** @override */
  seekTo(unusedTimeSeconds) {
    this.user().error(TAG, '`seekTo` not supported.');
  }

  /** @override */
  setVolume(vol) {
    this.sendCommand_('volume', vol);
    this.ampImaPlayerDebug('change Volume:' + vol);
  }

  /** @override */
  mapConfig() {
    const mapConfIndex = {
      'movieContenerId': null,
      'movieSrcs': null,
      'movieSrc': null,
      'moviePosterSrc': null,
      'playerIdConf': null,
      'masterDomain': null,
      'maxWidth': null,
      'maxHeight': null,
      'watermark': null,
      'UA': null,
      'lang': 'pl',
      'autoplay': false,
      'scrollOnlyDownPlayer': null,
      'volume': 0,
      'volumeOnOver': 0.9,
      'hideWhenNoAd': false,
      'hideWhenEnd': false,
      'scrollPlayer': true,
      'debug': false,
      'responsive': true,
      'functionAfterEnded': null,
      'videoWall': null,
      'timeToSaveCloseChoice': 2,
      'adBlockInfo': false,
      'langText': {
        'advertisement': 'Reklama',
        'Seconds': 'sekund',
        'close': 'zamknij',
      },
      'fixedOnMobile': false,
    };
    Object.keys(mapConfIndex).forEach(key => {
      if (this.configMap_[key] !== undefined) {
        this.config_[key] = this.configMap_[key];
      } else if (this.config_[key] === undefined) {
        this.config_[key] = mapConfIndex[key];
      }
    });
    if (location.search.split('moviDebug=')[1]) {
      this.config_.debug = true;
    }
    if (this.config_.fixedOnMobile === false && this.isMobile() === true) {
      this.config_.scrollPlayer = false;
    }

    if (
      this.configMap_['UA'] !== undefined &&
      this.configMap_['UA'].length > 0
    ) {
      this.gaUserUA_ = this.configMap_['UA'];
    }
    this.setRandMovieSrc();
    this.ampImaPlayerDebug(this.config_);
  }

  /** @override */
  mapExternalConfig() {
    const mapConfIndex = {
      'cssPuiblisher': null,
      'apv': 100,
      'UA': null,
      'showLogo': false,
      'watermark': null,
      'vastUrl': null,
      'keyPrivate': null,
      'adBlockInfo': false,
    };
    Object.keys(mapConfIndex).forEach(key => {
      if (this.configLocal_[key] !== undefined) {
        this.config_[key] = this.configLocal_[key];
      }
    });

    if (
      this.configLocal_['UA'] !== undefined &&
      this.configLocal_['UA'].length > 0
    ) {
      this.gaMoviadsUA_ = this.configLocal_['UA'];
    }
    this.ampImaPlayerDebug(this.config_);
  }

  /** @override */
  setRandMovieSrc() {
    if (null !== this.config_.movieSrcs && this.config_.movieSrcs.length > 0) {
      this.config_['dataSrc'] = this.config_.movieSrcs[
        Math.floor(Math.random() * this.config_.movieSrcs.length)
        ];
    } else {
      this.config_['dataSrc'] = this.config_.movieSrc;
    }
    this.ampImaPlayerDebug('Load MovieSrc');
  }

  /** @override */
  setCssPublisher() {
    if (this.config_.cssPuiblisher) {
      this.sendCommand_('cssPublisher', this.config_.cssPuiblisher);
      this.ampImaPlayerDebug('Load CSS');
    }
  }

  /** @override */
  hideWhenEnd() {
    if (this.config_.hideWhenEnd === true) {
      this.element.remove();
      this.ampImaPlayerDebug('run hideWhenEnd');
    }
  }

  /** @override */
  hideWhenNoAd() {
    if (this.config_.hideWhenNoAd === true) {
      this.element.remove();
      this.ampImaPlayerDebug('run hideWhenNoAd');
    }
  }

  /** @override */
  resizeContainerPlayer() {
    this.ampImaPlayerDebug('resizeContainerPlayer');
    if (
      (this.element.parentElement &&
        parseInt(this.config_.maxHeight, 10) >
        this.element.parentElement.offsetHeight) ||
      this.config_.maxHeight === null
    ) {
      this.config_.maxHeight = this.element.parentElement.offsetHeight;
    }

    if (
      (this.element.parentElement &&
        parseInt(this.config_.maxWidth, 10) >
        this.element.parentElement.offsetWidth) ||
      this.config_.maxWidth === null
    ) {
      this.config_.maxWidth = this.element.parentElement.offsetWidth;
    }
    this.element.setAttribute('width', parseInt(this.config_.maxWidth, 10));
    this.element.setAttribute('height', parseInt(this.config_.maxHeight, 10));
  }

  /** @override */
  embedWatermark() {
    if (this.config_.watermark !== null) {
      const img = document.createElement('IMG');
      img.src = this.config_.watermark;
      img.className = 'amp-ima-player-watermark';
      this.element.appendChild(img);
      this.ampImaPlayerDebug('create watermark');
    }
  }

  /** @override */
  loadMethod() {
    const ampDivClose = document.createElement('a');
    const ampDivTextClose = document.createTextNode(
      this.config_.langText.close
    );
    ampDivClose.id = 'amp-close';
    ampDivClose.appendChild(ampDivTextClose);
    this.element.appendChild(ampDivClose);

    this.embedWatermark();
    this.layoutLoad();
    this.preconnectAds();
    const _this = this;
    document.addEventListener(
      'visibilitychange',
      function() {
        if (document.hidden) {
          _this.pause();
        } else {
          _this.play();
        }
      },
      false
    );
    if (this.gaMoviadsUA_) {
      this.initGA(this.gaMoviadsUA_, this.gaMoviads_);
    }

    if (this.gaUserUA_) {
      this.initGA(this.gaUserUA_, this.gaUser_);
    }

    this.element.addEventListener('mouseout', function() {
      if (_this.isClickUnmute_) {
        _this.setVolume(_this.config_.volumeOnOver);
      }
      _this.embedLogoMovieAds(false);
    });

    this.element.addEventListener('mouseover', function() {
      if (_this.isClickUnmute_) {
        _this.setVolume(_this.config_.volume);
      }
      _this.embedLogoMovieAds(true);
    });

    document.getElementById('amp-close').addEventListener('click', function() {
      if (_this.closeActive_) {
        _this.isAmpCloseClick_ = true;
        _this.element
          .getElementsByTagName('iframe')[0]
          .classList.remove('amp-ima-player-fixed');
        setStyles(ampDivClose, {'display': 'none'});
      }
    });

    document.addEventListener('scroll', function() {
      _this.isScrollDown();
      if (
        _this.isInViewport() === false &&
        _this.element
          .getElementsByTagName('iframe')[0]
          .classList.contains('amp-ima-player-fixed') === false &&
        _this.config_.scrollPlayer === true &&
        _this.isAmpCloseClick_ === false
      ) {
        if (
          (_this.config_.scrollOnlyDownPlayer === true &&
          _this.config_.isYDown === true) || (_this.config_.scrollPlayer === true && _this.config_.scrollOnlyDownPlayer === false)
        ) {
          _this.setPlayerResize();
          _this.timeClosePlayer();
          _this.sendCommand_('imaAdContainerStyle', 'fixed');
          _this.element
            .getElementsByTagName('iframe')[0]
            .classList.add('amp-ima-player-fixed');
          setStyles(ampDivClose, {'display': 'block'});
          _this.sendCommand_('resize', {'width': 300, 'height': 162});

          setStyle(_this.element, 'width', px(300));
          setStyle(_this.element, 'height', px(162));
          _this.play();
        }
      } else if (_this.isInViewport() === true) {
        setStyle(_this.element, 'width', px(_this.playerResizeWidth_));
        setStyle(_this.element, 'height', px(_this.playerResizeHeight_));
        _this.sendCommand_('resize', {
          'width': _this.playerResizeWidth_,
          'height': _this.playerResizeHeight_,
        });
        _this.sendCommand_('imaAdContainerStyle', 'none');
        _this.element
          .getElementsByTagName('iframe')[0]
          .classList.remove('amp-ima-player-fixed');
        setStyles(ampDivClose, {'display': 'none'});
      }
      _this.resizeContainerPlayer();
    });
  }

  /** @override */
  LoadRecommendedVideo() {
    const div = document.createElement('div');
    div.className = 'amp-ima-player-recommended';
    div.id = 'amp-ima-player-recommended';
    if (this.config_.videoWall !== null) {
      this.ampImaPlayerDebug('create recommended box');
      this.config_.videoWall.forEach(function(entry) {
        const divContainer = document.createElement('div');
        const ahref = document.createElement('a');
        ahref.href = entry.uri;
        const img = document.createElement('IMG');
        img.src = entry.poster;
        img.setAttribute('data-src', entry.uri);
        ahref.appendChild(img);
        const divTxt = document.createElement('div');
        divTxt.className = 'title';
        const ahrefDiv = document.createElement('a');
        ahrefDiv.href = entry.uri;
        ahrefDiv.appendChild(document.createTextNode(entry.title));
        divTxt.appendChild(ahrefDiv);
        divContainer.appendChild(ahref);
        divContainer.appendChild(divTxt);
        div.appendChild(divContainer);
      });
      this.element.appendChild(div);
    }
  }
  /** @override */
  setPlayerResize() {
    if (this.playerResizeHeight_ === null) {
      this.playerResizeHeight_ = this.element.getBoundingClientRect().height;
      this.playerResizeWidth_ = this.element.getBoundingClientRect().width;
    }
  }
  /** @override */
  initGA(ua, name) {
    (function(i, s, o, g, r, a, m) {
      i['GoogleAnalyticsObject'] = r;
      (i[r] =
        i[r] ||
        function() {
          (i[r].q = i[r].q || []).push(arguments);
        }),
        (i[r].l = Number(new Date()));
      (a = s.createElement(o)), (m = s.getElementsByTagName(o)[0]);
      a.async = 1;
      a.src = g;
      m.parentNode.insertBefore(a, m);
    })(
      window,
      document,
      'script',
      'https://www.google-analytics.com/analytics.js',
      'ga'
    );
    ga('create', ua, 'auto', name);
    ga(name + '.send', 'pageview');
  }

  /** @override */
  eventGA(event, name, UA) {
    if (typeof ga !== 'undefined') {
      if (UA && event !== 'pause') {
        // eslint-disable-next-line no-undef
        ga(
          name + '.send',
          'event',
          'Videos',
          event,
          this.config_['movieContenerId'],
          {
            nonInteraction: true,
          }
        );
      }
    } else {
      this.ampImaPlayerDebug('GA not allowed');
    }
  }

  /** @override */
  functionAfterEnded() {
    if (
      this.config_.hideWhenEnd === false &&
      typeof this.config_.functionAfterEnded !== 'undefined' &&
      this.config_.functionAfterEnded !== null &&
      this.config_.functionAfterEnded.length > 0 &&
      typeof window[this.config_.functionAfterEnded] === 'function'
    ) {
      window[this.config_.functionAfterEnded]();
      this.ampImaPlayerDebug('load functionAfterEnded');
    }
  }

  /** @override */
  detectedAdBlock() {
    const _this = this;
    const testURLAdBlock = 'https://imasdk.googleapis.com/js/sdkloader/ima3.js';
    const myInitHead = {
      method: 'HEAD',
      mode: 'no-cors',
    };
    const myRequest = new Request(testURLAdBlock, myInitHead);
    fetch(myRequest)
      .then(function() {
        _this.adblockDetected_ = false;
      })
      .then(function() {
        _this.adblockDetected_ = false;
      })
      .catch(function() {
        _this.adblockDetected_ = true;
        _this.infoAdblock();
      });
  }

  /** @override */
  infoAdblock() {
    if (
      this.adblockDetected_ === true &&
      this.config_.adBlockInfo !== false &&
      this.config_.adBlockInfo !== ''
    ) {
      this.element.className = 'amp-ima-payer-adblock';
      const para = document.createElement('p');
      para.className = 'amp-ima-payer-p-adblock';
      const node = document.createTextNode(this.config_.adBlockInfo);
      para.appendChild(node);
      this.element.appendChild(para);
      this.ampImaPlayerDebug('Load adBlock method');
    }
  }

  /** @override */
  getDurationTime() {
    const _this = this;
    const period = 100;
    const endTime = 1500;
    let counter = 0;
    let adsDuration = 0;
    const sleepyAlert = setInterval(function() {
      adsDuration = _this.playerData_.duration;
      if (counter === endTime || adsDuration > 0) {
        clearInterval(sleepyAlert);
      }
      counter += period;
    }, period);
  }

  /** @override */
  isInViewport() {
    const el = this.element;
    const scroll = window.scrollY || window.pageYOffset;
    const boundsTop = el.getBoundingClientRect().top + scroll;
    const viewport = {
      top: scroll,
      bottom: scroll + window.innerHeight,
    };

    const bounds = {
      top: boundsTop,
      bottom: boundsTop + el.clientHeight,
    };

    return (
      (bounds.bottom >= viewport.top && bounds.bottom <= viewport.bottom) ||
      (bounds.top <= viewport.bottom && bounds.top >= viewport.top)
    );
  }
  /** @override */
  timeClosePlayer() {
    const _this = this;
    setTimeout(function() {
      _this.closeActive_ = true;
    }, 1000 * _this.config_.timeToSaveCloseChoice);
  }

  /** @override */
  isMobile() {
    let check = false;
    (function(a) {
      if (
        /(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino/i.test(
          a
        ) ||
        /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(
          a.substr(0, 4)
        )
      ) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);

    return check;
  }
  /** @override */
  embedLogoMovieAds(param) {
    const _this = this;
    if (
      this.config_.showLogo &&
      param === true &&
      document.getElementById('amp-ima-player-movie-ads') === null &&
      this.showLogoMovie_ === true
    ) {
      const embedLogoMovieAds = document.createElement('div');
      embedLogoMovieAds.className = 'amp-ima-player-movie-ads';
      embedLogoMovieAds.id = 'amp-ima-player-movie-ads';
      const embedLogoMovieAdsA = document.createElement('a');
      embedLogoMovieAdsA.href = 'https://moviads.pl/';
      embedLogoMovieAdsA.target = '_blank';
      const embedLogoMovieAdsImg = document.createElement('img');
      embedLogoMovieAdsImg.src =
        'https://player1.platform.moviads.pl/img/logoMoviads.png';
      embedLogoMovieAdsA.appendChild(embedLogoMovieAdsImg);
      embedLogoMovieAds.appendChild(embedLogoMovieAdsA);
      this.element.appendChild(embedLogoMovieAds);
      this.ampImaPlayerDebug('create logo MovieAds');

      document
        .getElementById('amp-ima-player-movie-ads')
        .addEventListener('mouseover', function() {
          _this.embedLogoMovieAds(true);
        });
    } else if (
      param === false &&
      this.showLogoMovie_ === true &&
      document.getElementById('amp-ima-player-movie-ads') !== null
    ) {
      document.getElementById('amp-ima-player-movie-ads').remove();
    }
  }

  /** @override */
  isScrollDown() {
    const percentVisible = 0.5;
    const elemBottom = this.element.getBoundingClientRect().bottom;
    const elemHeight = this.element.getBoundingClientRect().height;
    const overhang = elemHeight * (1 - percentVisible);
    if (elemBottom + overhang < this.element.getBoundingClientRect().height) {
      this.ampImaPlayerDebug('down SCROLL');
      this.config_.isYDown = true;
    } else {
      this.ampImaPlayerDebug('up SCROLL');
      this.config_.isYDown = false;
    }
  }

  /** @override */
  ampImaPlayerDebug(info) {
    if (this.config_.debug) {
      console.log(info);
    }
  }
}

AMP.extension(TAG, '0.1', AMP => {
  AMP.registerElement(TAG, AmpMoviadsPlayer, CSS);
});

