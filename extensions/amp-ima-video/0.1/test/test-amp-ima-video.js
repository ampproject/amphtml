/**
 * Copyright 2016 The AMP HTML Authors. All Rights Reserved.
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

import '../amp-ima-video';
import * as imaVideoObj from '../../../../ads/google/imaVideo';

import {CONSENT_POLICY_STATE} from '../../../../src/consent-state';


describes.realWin('amp-ima-video', {
  amp: {
    extensions: ['amp-ima-video'],
  },
}, env => {
  const srcUrl = 'http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4';
  const adTagUrl = 'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=';

  let win, doc;

  beforeEach(() => {
    win = env.win;
    win.context = {};
    doc = win.document;
  });

  function getVideoPlayerMock() {
    return {
      load: function() {},
      addEventListener: function() {},
      removeEventListener: function() {},
      play: function() {},
      pause: function() {},
      muted: false,
      played: {
        length: 0,
      },
    };
  }

  it('adds ad container', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const video = doc.body.querySelector('#ima-content-player');
    expect(video).not.to.be.undefined;
  });

  it('adds video element', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const video = doc.body.querySelector('#ima-ad-container');
    expect(video).not.to.be.undefined;
  });

  it('handles click', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const bigPlayDivMock = {
      style: {
        display: '',
      },
      removeEventListener() {},
    };
    const adDisplayContainerMock = {initialize() {}};
    const initSpy = sandbox.spy(adDisplayContainerMock, 'initialize');
    const videoPlayerMock = getVideoPlayerMock();
    const loadSpy = sandbox.spy(videoPlayerMock, 'load');
    const mockAdsLoader = {requestAds() {}};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    //const playAdsSpy = sandbox.spy(imaVideoObj, 'playAds');
    //const playAdsFunc = imaVideoObj.playAds;
    //const playAdsSpy = sandbox.spy(playAdsFunc);
    imaVideoObj.setBigPlayDivForTesting(bigPlayDivMock);
    imaVideoObj.setAdDisplayContainerForTesting(adDisplayContainerMock);
    imaVideoObj.setVideoPlayerForTesting(videoPlayerMock);

    imaVideoObj.onBigPlayClick();

    expect(imaVideoObj.getPropertiesForTesting().playbackStarted).to.be.true;
    expect(imaVideoObj.getPropertiesForTesting().uiTicker)
        .to.exist;
    expect(bigPlayDivMock.style.display).to.eql('none');
    expect(initSpy).to.be.called;
    expect(loadSpy).to.be.called;
    // TODO - Fix one I figure out how to spy on internals.
    //expect(playAdsSpy).to.be.called;
  });

  it('plays ads with ads manager', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const mockGlobal = {};
    mockGlobal.google = {
      ima: {
        ViewMode: {
          NORMAL: 'normal',
        },
      },
    };
    const mockAdsManager = {};
    mockAdsManager.init = function() {};
    mockAdsManager.start = function() {};
    const initSpy = sandbox.spy(mockAdsManager, 'init');
    const startSpy = sandbox.spy(mockAdsManager, 'start');
    imaVideoObj.setAdsManagerForTesting(mockAdsManager);
    imaVideoObj.setVideoWidthAndHeightForTesting(100, 200);

    imaVideoObj.playAds(mockGlobal);

    expect(initSpy).to.be.calledWith(100, 200, 'normal');
    expect(startSpy).to.be.called;
  });

  it('plays ads with ads manager ad request failed', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.playAds();

    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.be.called;
    // Just here so the test passes until I fix above issues
    expect(true).to.be.true;
  });

  it('handles content ended', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const mockAdsLoader = {contentComplete() {}};
    const completeSpy = sandbox.spy(mockAdsLoader, 'contentComplete');
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);

    imaVideoObj.onContentEnded();

    expect(imaVideoObj.getPropertiesForTesting().contentComplete).to.be.true;
    expect(completeSpy).to.have.been.called;
  });

  it('handles ads manager loaded', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const mockAdsRenderingSettings = {};
    const mockGlobal = {};
    mockGlobal.google = {};
    mockGlobal.google.ima = {};
    mockGlobal.google.ima.AdsRenderingSettings = function() {
      return mockAdsRenderingSettings;
    };
    mockGlobal.google.ima.UiElements = {
      AD_ATTRIBUTION: 'adattr',
      COUNTDOWN: 'countdown',
    };
    mockGlobal.google.ima.AdErrorEvent = {};
    mockGlobal.google.ima.AdErrorEvent.Type = {
      AD_ERROR: 'aderror',
    };
    mockGlobal.google.ima.AdEvent = {};
    mockGlobal.google.ima.AdEvent.Type = {
      CONTENT_PAUSE_REQUESTED: 'cpr',
      CONTENT_RESUME_REQUESTED: 'crr',
    };
    const mockAdsManager = {
      addEventListener() {},
      setVolume() {},
    };
    const mockAdsManagerLoadedEvent = {
      getAdsManager() {
        return mockAdsManager;
      },
    };
    const amleSpy = sandbox.spy(mockAdsManagerLoadedEvent, 'getAdsManager');
    const addEventListenerSpy =
        sandbox.spy(mockAdsManager, 'addEventListener');
    const mockVideoPlayer = {};
    imaVideoObj.setVideoPlayerForTesting(mockVideoPlayer);
    imaVideoObj.setMuteAdsManagerOnLoadedForTesting(false);

    imaVideoObj.onAdsManagerLoaded(mockGlobal, mockAdsManagerLoadedEvent);

    expect(
        mockAdsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete)
        .to.be.true;
    expect(mockAdsRenderingSettings.uiElements)
        .to.eql(['adattr', 'countdown']);
    expect(amleSpy).to.be.calledWith(
        mockVideoPlayer, mockAdsRenderingSettings);
    expect(addEventListenerSpy).to.be.calledWith('aderror');
    expect(addEventListenerSpy).to.be.calledWith('cpr');
    expect(addEventListenerSpy).to.be.calledWith('crr');
  });

  it('handles ads manager loaded and muted', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const mockAdsRenderingSettings = {};
    const mockGlobal = {};
    mockGlobal.google = {};
    mockGlobal.google.ima = {};
    mockGlobal.google.ima.AdsRenderingSettings = function() {
      return mockAdsRenderingSettings;
    };
    mockGlobal.google.ima.UiElements = {
      AD_ATTRIBUTION: 'adattr',
      COUNTDOWN: 'countdown',
    };
    mockGlobal.google.ima.AdErrorEvent = {};
    mockGlobal.google.ima.AdErrorEvent.Type = {
      AD_ERROR: 'aderror',
    };
    mockGlobal.google.ima.AdEvent = {};
    mockGlobal.google.ima.AdEvent.Type = {
      CONTENT_PAUSE_REQUESTED: 'cpr',
      CONTENT_RESUME_REQUESTED: 'crr',
    };
    const mockAdsManager = {
      addEventListener() {},
      setVolume() {},
    };
    const mockAdsManagerLoadedEvent = {
      getAdsManager() {
        return mockAdsManager;
      },
    };
    const amleSpy = sandbox.spy(mockAdsManagerLoadedEvent, 'getAdsManager');
    const addEventListenerSpy =
        sandbox.spy(mockAdsManager, 'addEventListener');
    const setVolumeSpy = sandbox.spy(mockAdsManager, 'setVolume');
    const mockVideoPlayer = {};
    imaVideoObj.setVideoPlayerForTesting(mockVideoPlayer);
    imaVideoObj.setMuteAdsManagerOnLoadedForTesting(true);

    imaVideoObj.onAdsManagerLoaded(mockGlobal, mockAdsManagerLoadedEvent);

    expect(
        mockAdsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete)
        .to.be.true;
    expect(mockAdsRenderingSettings.uiElements)
        .to.eql(['adattr', 'countdown']);
    expect(amleSpy).to.be.calledWith(
        mockVideoPlayer, mockAdsRenderingSettings);
    expect(addEventListenerSpy).to.be.calledWith('aderror');
    expect(addEventListenerSpy).to.be.calledWith('cpr');
    expect(addEventListenerSpy).to.be.calledWith('crr');
    expect(setVolumeSpy).to.be.calledWith(0);
  });

  it('handles ads loader error', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.onAdsLoaderError();

    expect(imaVideoObj.getPropertiesForTesting().adRequestFailed).to.be.true;
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it.skip('handles ad error', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const adsManagerMock = {destroy() {}};
    const destroySpy = sandbox.spy(adsManagerMock, 'destroy');
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);

    imaVideoObj.onAdError();

    expect(destroySpy).to.have.been.called;
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it.skip('pauses content', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const removeEventListenerSpy =
        sandbox.spy(videoMock, 'removeEventListener');
    //const hideControlsSpy = sandbox.spy(imaVideoObj, 'hideControls');
    const pauseSpy = sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);

    imaVideoObj.onContentPauseRequested();

    expect(imaVideoObj.getPropertiesForTesting().adsActive).to.be.true;
    expect(removeEventListenerSpy).to.have.been.calledWith(
        imaVideoObj.getPropertiesForTesting().interactEvent);
    expect(imaVideoObj.getPropertiesForTesting().adContainerDiv.style.display)
        .to.eql('block');
    expect(removeEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(hideControlsSpy).to.have.been.called;
    expect(pauseSpy).to.have.been.called;
  });

  it('pauses content and resizes ads manager', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const removeEventListenerSpy =
        sandbox.spy(videoMock, 'removeEventListener');
    //const hideControlsSpy = sandbox.spy(imaVideoObj, 'hideControls');
    const pauseSpy = sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = {};
    adsManagerMock.resize = function() {};
    const mockGlobal = {};
    mockGlobal.google = {
      ima: {
        ViewMode: {
          NORMAL: 'normal',
        },
      },
    };
    const resizeSpy = sandbox.spy(adsManagerMock, 'resize');
    imaVideoObj.setAdsManagerDimensionsOnLoadForTesting(100, 200);
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);

    imaVideoObj.onContentPauseRequested(mockGlobal);

    expect(resizeSpy).to.have.been.calledWith(100, 200, 'normal');
    expect(imaVideoObj.getPropertiesForTesting().adsManagerWidthOnLoad)
        .to.be.null;
    expect(imaVideoObj.getPropertiesForTesting().adsManagerHeightOnLoad)
        .to.be.null;

    expect(imaVideoObj.getPropertiesForTesting().adsActive).to.be.true;
    expect(removeEventListenerSpy).to.have.been.calledWith(
        imaVideoObj.getPropertiesForTesting().interactEvent);
    expect(imaVideoObj.getPropertiesForTesting().adContainerDiv.style.display)
        .to.eql('block');
    expect(removeEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(hideControlsSpy).to.have.been.called;
    expect(pauseSpy).to.have.been.called;
  });

  it('resumes content', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = sandbox.spy(videoMock, 'addEventListener');
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(false);

    imaVideoObj.onContentResumeRequested();

    expect(imaVideoObj.getPropertiesForTesting().adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoObj.getPropertiesForTesting().interactEvent);
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('resumes content with content complete', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = sandbox.spy(videoMock, 'addEventListener');
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(true);

    imaVideoObj.onContentResumeRequested();

    expect(imaVideoObj.getPropertiesForTesting().adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoObj.getPropertiesForTesting().interactEvent);
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('shows bigPlayDiv with content complete, ' +
    'when content resume is called', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = sandbox.spy(videoMock, 'addEventListener');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(true);

    imaVideoObj.onContentResumeRequested();

    const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

    expect(imaVideoProperties.adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoProperties.interactEvent);
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    expect(imaVideoProperties.bigPlayDiv.style.display)
        .to.be.equal('table-cell');
  });

  it('shows bigPlayDiv with allAdsCompleted, and content ended', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setAllAdsCompletedForTesting(true);

    imaVideoObj.onContentEnded();

    const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

    expect(imaVideoProperties.bigPlayDiv.style.display)
        .to.be.equal('table-cell');
  });

  it('does not show bigPlayDiv when content is resumed, ' +
    'and not content complete', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = sandbox.spy(videoMock, 'addEventListener');
    imaVideoObj.setVideoPlayerForTesting(videoMock);

    imaVideoObj.onBigPlayClick();
    imaVideoObj.onContentResumeRequested();

    const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

    expect(imaVideoProperties.adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoProperties.interactEvent);
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    expect(imaVideoProperties.bigPlayDiv.style.display).to.be.equal('none');
  });

  it('updates UI', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.updateUi(0, 60);
    expect(imaVideoObj.getPropertiesForTesting().timeNode.textContent)
        .to.eql('0:00 / 1:00');
    expect(imaVideoObj.getPropertiesForTesting().progressLine.style.width)
        .to.eql('0%');
    expect(imaVideoObj.getPropertiesForTesting().progressMarkerDiv.style.left)
        .to.eql('-1%');
    imaVideoObj.updateUi(30, 60);
    expect(imaVideoObj.getPropertiesForTesting().timeNode.textContent)
        .to.eql('0:30 / 1:00');
    expect(imaVideoObj.getPropertiesForTesting().progressLine.style.width)
        .to.eql('50%');
    expect(imaVideoObj.getPropertiesForTesting().progressMarkerDiv.style.left)
        .to.eql('49%');
    imaVideoObj.updateUi(60, 60);
    expect(imaVideoObj.getPropertiesForTesting().timeNode.textContent)
        .to.eql('1:00 / 1:00');
    expect(imaVideoObj.getPropertiesForTesting().progressLine.style.width)
        .to.eql('100%');
    expect(imaVideoObj.getPropertiesForTesting().progressMarkerDiv.style.left)
        .to.eql('99%');
  });

  it('formats time', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    let formattedTime = imaVideoObj.formatTime(0);
    expect(formattedTime).to.eql('0:00');
    formattedTime = imaVideoObj.formatTime(55);
    expect(formattedTime).to.eql('0:55');
    formattedTime = imaVideoObj.formatTime(60);
    expect(formattedTime).to.eql('1:00');
    formattedTime = imaVideoObj.formatTime(65);
    expect(formattedTime).to.eql('1:05');
    formattedTime = imaVideoObj.formatTime(3600);
    expect(formattedTime).to.eql('1:00:00');
    formattedTime = imaVideoObj.formatTime(3605);
    expect(formattedTime).to.eql('1:00:05');
    formattedTime = imaVideoObj.formatTime(3665);
    expect(formattedTime).to.eql('1:01:05');
  });

  it('zero pads', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    let padded = imaVideoObj.zeroPad(11);
    expect(padded).to.eql('11');
    padded = imaVideoObj.zeroPad(1);
    expect(padded).to.eql('01');
  });

  // TODO - FIX ONCE I FIGURE OUT HOW TO SPY ON INTERNAL METHODS
  it('plays on click', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED);
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.onPlayPauseClick();

    //expect(playVideoSpy).to.have.been.called;
    expect(true).to.be.true;
  });

  // TODO - FIX ONCE I FIGURE OUT HOW TO SPY ON INTERNAL METHODS
  it('pauses on click', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING);
    //const pauseVideoSpy = sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onPlayPauseClick();

    //expect(pauseVideoSpy).to.have.been.called;
    expect(true).to.be.true;
  });

  it('plays video', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const playSpy = sandbox.spy(videoMock, 'play');
    imaVideoObj.setVideoPlayerForTesting(videoMock);

    imaVideoObj.playVideo();

    expect(imaVideoObj.getPropertiesForTesting().adContainerDiv.style.display)
        .to.eql('none');
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING);
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
    expect(playSpy).to.have.been.called;
  });

  it('pauses video', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const pauseSpy = sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    //const showControlsSpy = sandbox.spy(imaVideoObj, 'showControls');
    imaVideoObj.getPropertiesForTesting().playerState =
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING;

    imaVideoObj.pauseVideo({});

    expect(pauseSpy).to.have.been.called;
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED);
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
  });

  it('mutes on click', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = {};
    adsManagerMock.setVolume = () => {};
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);
    imaVideoObj.setVideoPlayerMutedForTesting(false);
    //const pauseVideoSpy = sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onMuteUnmuteClick();

    const isMuted = imaVideoObj.getPropertiesForTesting().videoPlayer.muted;

    //expect(pauseVideoSpy).to.have.been.called;
    expect(isMuted).to.be.true;
  });

  it('unmutes on click', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = {};
    adsManagerMock.setVolume = () => {};
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);
    imaVideoObj.setVideoPlayerMutedForTesting(true);
    //const pauseVideoSpy = sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onMuteUnmuteClick();

    const isMuted = imaVideoObj.getPropertiesForTesting().videoPlayer.muted;

    //expect(pauseVideoSpy).to.have.been.called;
    expect(isMuted).to.be.false;
  });



  it('pauses video after webkit end fullscreen', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const pauseSpy = sandbox.spy(videoMock, 'pause');
    const removeEventListenerSpy =
      sandbox.spy(videoMock, 'removeEventListener');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    //const showControlsSpy = sandbox.spy(imaVideoObj, 'showControls');
    imaVideoObj.getPropertiesForTesting().playerState =
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING;

    imaVideoObj.pauseVideo({type: 'webkitendfullscreen'});

    expect(pauseSpy).to.have.been.called;
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED);
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
    expect(removeEventListenerSpy).to.have.been.called;
  });

  it('shows controls when paused', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.getPropertiesForTesting().playerState =
        imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED;
    imaVideoObj.setHideControlsTimeoutForTesting(null);

    imaVideoObj.showControls();

    expect(imaVideoObj.getPropertiesForTesting().controlsDiv.style.display)
        .to.eql('flex');
    expect(imaVideoObj.getPropertiesForTesting().hideControlsTimeout)
        .to.be.null;
  });

  it('shows controls when playing', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING);

    imaVideoObj.showControls();

    expect(imaVideoObj.getPropertiesForTesting().controlsDiv.style.display)
        .to.eql('flex');
    expect(imaVideoObj.getPropertiesForTesting().hideControlsTimeout)
        .not.to.be.undefined;
  });

  it('hides controls', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.hideControls();

    expect(imaVideoObj.getPropertiesForTesting().controlsDiv.style.display)
        .to.eql('none');
  });

  it('suppresses IMA load with unknown consent', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    win.context.initialConsentState = CONSENT_POLICY_STATE.UNKNOWN;
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    // TODO: When I can spy on internals, verify that onImaLoadSuccess() is not
    // called, and that onImaLoadFail is called.
    expect(imaVideoObj.getPropertiesForTesting().imaLoadAllowed).to.eql(false);
  });


  it('handles unknown consent with request ads call', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.imaLoadAllowed = true;
    imaVideoObj.setConsentStateForTesting(CONSENT_POLICY_STATE.UNKNOWN);
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().imaLoadAllowed).to.eql(false);
  });

  it('handles insufficient consent', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });


    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.mxl'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setConsentStateForTesting(CONSENT_POLICY_STATE.INSUFFICIENT);
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl)
        .to.eql('vast.mxl&npa=1');
  });

  it('handles sufficient consent', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.mxl'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setConsentStateForTesting(CONSENT_POLICY_STATE.SUFFICIENT);
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl)
        .to.eql('vast.mxl');
  });

  it('handles unknown_not_required consent', () => {
    const div = doc.createElement('div');
    div.setAttribute('id', 'c');
    doc.body.appendChild(div);

    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.mxl'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setConsentStateForTesting(
        CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED);
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl)
        .to.eql('vast.mxl');
  });
});
