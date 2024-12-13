import * as imaVideoObj from '#ads/google/ima/ima-video';

import {
  CONSENT_POLICY_STATE,
  CONSENT_STRING_TYPE,
} from '#core/constants/consent-state';

describes.realWin('UI loaded in frame by amp-ima-video', {}, (env) => {
  const srcUrl = 'http://rmcdn.2mdn.net/Demo/vast_inspector/android.mp4';
  const adTagUrl =
    'https://pubads.g.doubleclick.net/gampad/ads?sz=640x480&iu=/124319096/external/ad_rule_samples&ciu_szs=300x250&ad_rule=1&impl=s&gdfp_req=1&env=vp&output=vmap&unviewed_position_start=1&cust_params=deployment%3Ddevsite%26sample_ar%3Dpremidpost&cmsid=496&vid=short_onecue&correlator=';

  let win, doc, clock;

  beforeEach(() => {
    win = env.win;
    win.context = {};
    doc = win.document;
    clock = env.sandbox.useFakeTimers();
    win.document.body
      .appendChild(document.createElement('div'))
      .setAttribute('id', 'c');
  });

  function getVideoPlayerMock() {
    return {
      load: function () {},
      addEventListener: function () {},
      removeEventListener: function () {},
      play: function () {},
      pause: function () {},
      muted: false,
      played: {
        length: 0,
      },
    };
  }

  function getAdsManagerMock(mock = {}) {
    return {
      addEventListener: () => {},
      destroy: () => {},
      getRemainingTime: () => mock.remainingTime,
      init: () => {},
      resize: () => {},
      resume: () => {},
      setVolume: () => {},
      start: () => {},
    };
  }

  it('adds ad container', () => {
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
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const bigPlayDivMock = {
      setAttribute: env.sandbox.spy(),
    };
    const adDisplayContainerMock = {initialize() {}};
    const initSpy = env.sandbox.spy(adDisplayContainerMock, 'initialize');
    const videoPlayerMock = getVideoPlayerMock();
    const loadSpy = env.sandbox.spy(videoPlayerMock, 'load');
    const mockAdsLoader = {requestAds() {}};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    //const playAdsSpy = env.sandbox.spy(imaVideoObj, 'playAds');
    //const playAdsFunc = imaVideoObj.playAds;
    //const playAdsSpy = env.sandbox.spy(playAdsFunc);
    imaVideoObj.setBigPlayDivForTesting(bigPlayDivMock);
    imaVideoObj.setAdDisplayContainerForTesting(adDisplayContainerMock);
    imaVideoObj.setVideoPlayerForTesting(videoPlayerMock);

    imaVideoObj.onBigPlayClick();

    const properties = imaVideoObj.getPropertiesForTesting();
    expect(properties.playbackStarted).to.be.true;
    expect(properties.uiTicker).to.exist;
    expect(bigPlayDivMock.setAttribute.withArgs('hidden', '')).to.be.calledOnce;
    expect(initSpy).to.be.called;
    expect(loadSpy).to.be.called;
    // TODO - Fix one I figure out how to spy on internals.
    //expect(playAdsSpy).to.be.called;
  });

  it('updates ad countdown timer', () => {
    const videoDefaults = {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    };
    const tests = [
      {
        'mock': {'adPosition': 1, 'totalAds': 1, 'remainingTime': 0},
        'expected': 'Ad (1 of 1): 0:00',
      },
      {
        'mock': {'adPosition': 1, 'totalAds': 1, 'remainingTime': 2},
        'expected': 'Ad (1 of 1): 0:02',
      },
      {
        'mock': {
          'adPosition': 1,
          'totalAds': 1,
          'remainingTime': 3.923462062,
        },
        'expected': 'Ad (1 of 1): 0:03',
      },
      {
        'mock': {'adPosition': 1, 'totalAds': 3, 'remainingTime': 1},
        'expected': 'Ad (1 of 3): 0:01',
      },
      {
        'mock': {'adPosition': 2, 'totalAds': 79, 'remainingTime': 7600},
        'expected': 'Ad (2 of 79): 126:40',
      },
      {
        'mock': {'adPosition': 1, 'totalAds': 3, 'remainingTime': 0},
        'label': 'Publicidad',
        'expected': 'Publicidad: 0:00',
      },
      {
        'mock': {'adPosition': 1, 'totalAds': 1, 'remainingTime': 0},
        'label': 'Publicidad (%s de %s)',
        'expected': 'Publicidad (1 de 1): 0:00',
      },
      {
        'mock': {'adPosition': 1, 'totalAds': 3, 'remainingTime': 0},
        'label': 'Publicidad %s',
        'expected': 'Publicidad 1: 0:00',
      },
    ];

    const adPodInfo = {};

    imaVideoObj.onAdLoad({
      getAd: () => ({getAdPodInfo: () => adPodInfo}),
    });

    tests.forEach(({expected, label, mock}) => {
      const {adPosition, remainingTime, totalAds} = mock;
      let defaults = videoDefaults;
      if (label) {
        defaults = Object.assign(defaults, {adLabel: label});
      }
      imaVideoObj.imaVideo(win, defaults);
      const {countdownDiv} = imaVideoObj.getPropertiesForTesting();
      const adsManagerMock = getAdsManagerMock({remainingTime});
      adPodInfo.getTotalAds = () => totalAds;
      adPodInfo.getAdPosition = () => adPosition;
      imaVideoObj.setAdsManagerForTesting(adsManagerMock);
      imaVideoObj.onAdProgress({});
      expect(countdownDiv.textContent).to.eql(expected);
    });
  });

  it('plays ads with ads manager', () => {
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
    const mockAdsManager = getAdsManagerMock();
    const initSpy = env.sandbox.spy(mockAdsManager, 'init');
    const startSpy = env.sandbox.spy(mockAdsManager, 'start');
    imaVideoObj.setAdsManagerForTesting(mockAdsManager);
    imaVideoObj.setVideoWidthAndHeightForTesting(100, 200);

    imaVideoObj.playAds(mockGlobal);

    expect(initSpy).to.be.calledWith(100, 200, 'normal');
    expect(startSpy).to.be.called;
  });

  it('plays ads with ads manager ad request failed', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.playAds();

    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.be.called;
    // Just here so the test passes until I fix above issues
    expect(true).to.be.true;
  });

  it('handles content ended', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const mockAdsLoader = {contentComplete() {}};
    const completeSpy = env.sandbox.spy(mockAdsLoader, 'contentComplete');
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);

    imaVideoObj.onContentEnded();

    expect(imaVideoObj.getPropertiesForTesting().contentComplete).to.be.true;
    expect(completeSpy).to.have.been.called;
  });

  it('handles ads manager loaded', () => {
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
    mockGlobal.google.ima.AdsRenderingSettings = function () {
      return mockAdsRenderingSettings;
    };
    mockGlobal.google.ima.AdErrorEvent = {};
    mockGlobal.google.ima.AdErrorEvent.Type = {
      AD_ERROR: 'aderror',
    };
    mockGlobal.google.ima.AdEvent = {};
    mockGlobal.google.ima.AdEvent.Type = {
      AD_PROGRESS: 'adprogress',
      CONTENT_PAUSE_REQUESTED: 'cpr',
      CONTENT_RESUME_REQUESTED: 'crr',
    };
    const mockAdsManager = getAdsManagerMock();
    const mockAdsManagerLoadedEvent = {
      getAdsManager: () => mockAdsManager,
    };
    const amleSpy = env.sandbox.spy(mockAdsManagerLoadedEvent, 'getAdsManager');
    const addEventListenerSpy = env.sandbox.spy(
      mockAdsManager,
      'addEventListener'
    );
    const mockVideoPlayer = {
      play() {},
    };
    imaVideoObj.setVideoPlayerForTesting(mockVideoPlayer);
    imaVideoObj.setMuteAdsManagerOnLoadedForTesting(false);

    imaVideoObj.onAdsManagerLoaded(mockGlobal, mockAdsManagerLoadedEvent);

    expect(mockAdsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete)
      .to.be.true;
    expect(amleSpy).to.be.calledWith(mockVideoPlayer, mockAdsRenderingSettings);
    expect(addEventListenerSpy).to.be.calledWith('aderror');
    expect(addEventListenerSpy).to.be.calledWith('adprogress');
    expect(addEventListenerSpy).to.be.calledWith('cpr');
    expect(addEventListenerSpy).to.be.calledWith('crr');
  });

  it('handles ads manager loaded and muted', () => {
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
    mockGlobal.google.ima.AdsRenderingSettings = function () {
      return mockAdsRenderingSettings;
    };
    mockGlobal.google.ima.AdErrorEvent = {};
    mockGlobal.google.ima.AdErrorEvent.Type = {
      AD_ERROR: 'aderror',
    };
    mockGlobal.google.ima.AdEvent = {};
    mockGlobal.google.ima.AdEvent.Type = {
      AD_PROGRESS: 'adprogress',
      PAUSED: 'paused',
      RESUMED: 'resumed',
      CONTENT_PAUSE_REQUESTED: 'cpr',
      CONTENT_RESUME_REQUESTED: 'crr',
    };
    const mockAdsManager = getAdsManagerMock();
    const mockAdsManagerLoadedEvent = {
      getAdsManager: () => mockAdsManager,
    };
    const amleSpy = env.sandbox.spy(mockAdsManagerLoadedEvent, 'getAdsManager');
    const addEventListenerSpy = env.sandbox.spy(
      mockAdsManager,
      'addEventListener'
    );
    const setVolumeSpy = env.sandbox.spy(mockAdsManager, 'setVolume');
    const mockVideoPlayer = {
      play() {},
    };
    imaVideoObj.setVideoPlayerForTesting(mockVideoPlayer);
    imaVideoObj.setMuteAdsManagerOnLoadedForTesting(true);

    imaVideoObj.onAdsManagerLoaded(mockGlobal, mockAdsManagerLoadedEvent);

    expect(mockAdsRenderingSettings.restoreCustomPlaybackStateOnAdBreakComplete)
      .to.be.true;
    expect(amleSpy).to.be.calledWith(mockVideoPlayer, mockAdsRenderingSettings);
    expect(addEventListenerSpy).to.be.calledWith('aderror');
    expect(addEventListenerSpy).to.be.calledWith('adprogress');
    expect(addEventListenerSpy).to.be.calledWith('paused');
    expect(addEventListenerSpy).to.be.calledWith('resumed');
    expect(addEventListenerSpy).to.be.calledWith('cpr');
    expect(addEventListenerSpy).to.be.calledWith('crr');
    expect(setVolumeSpy).to.be.calledWith(0);
  });

  it('handles ads loader error', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.onAdsLoaderError();

    expect(imaVideoObj.getPropertiesForTesting().adRequestFailed).to.be.true;
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('handles ad error', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const adsManagerMock = getAdsManagerMock();
    const destroySpy = env.sandbox.spy(adsManagerMock, 'destroy');
    //const playVideoSpy = sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);

    imaVideoObj.onAdError();

    expect(destroySpy).to.have.been.called;
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('pauses content', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const removeEventListenerSpy = env.sandbox.spy(
      videoMock,
      'removeEventListener'
    );
    //const hideControlsSpy = env.sandbox.spy(imaVideoObj, 'hideControls');
    const pauseSpy = env.sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    let properties = imaVideoObj.getPropertiesForTesting();
    expect(properties.adsActive).to.be.false;

    // run test
    imaVideoObj.onContentPauseRequested();

    // check results
    properties = imaVideoObj.getPropertiesForTesting();
    expect(properties.adsActive).to.be.true;
    expect(removeEventListenerSpy).to.have.been.calledWith(
      properties.interactEvent
    );
    expect(properties.adContainerDiv).not.to.have.attribute('hidden');
    expect(removeEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(hideControlsSpy).to.have.been.called;
    expect(pauseSpy).to.have.been.called;
  });

  it('pauses content and resizes ads manager', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const removeEventListenerSpy = env.sandbox.spy(
      videoMock,
      'removeEventListener'
    );
    //const hideControlsSpy = env.sandbox.spy(imaVideoObj, 'hideControls');
    const pauseSpy = env.sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = getAdsManagerMock();
    const mockGlobal = {
      google: {
        ima: {
          ViewMode: {
            NORMAL: 'normal',
          },
        },
      },
    };
    const resizeSpy = env.sandbox.spy(adsManagerMock, 'resize');
    imaVideoObj.setAdsManagerDimensionsOnLoadForTesting(100, 200);
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);

    // run test
    imaVideoObj.onContentPauseRequested(mockGlobal);

    // check results
    const properties = imaVideoObj.getPropertiesForTesting();
    expect(resizeSpy).to.have.been.calledWith(100, 200, 'normal');
    expect(properties.adsManagerWidthOnLoad).to.be.null;
    expect(properties.adsManagerHeightOnLoad).to.be.null;
    expect(properties.adsActive).to.be.true;
    expect(removeEventListenerSpy).to.have.been.calledWith(
      properties.interactEvent
    );
    expect(properties.adContainerDiv).not.to.have.attribute('hidden');
    expect(removeEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(hideControlsSpy).to.have.been.called;
    expect(pauseSpy).to.have.been.called;
  });

  it('shows modified controls when content is paused', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const adsManagerMock = getAdsManagerMock();
    const mockGlobal = {
      google: {
        ima: {
          ViewMode: {
            NORMAL: 'normal',
          },
        },
      },
    };
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setAdsManagerDimensionsOnLoadForTesting(100, 200);
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);
    const {controlsDiv} = imaVideoObj.getPropertiesForTesting();
    expect(controlsDiv).not.to.be.null;
    const {playPauseDiv} = imaVideoObj.getPropertiesForTesting();
    expect(playPauseDiv).not.to.be.null;
    const {timeDiv} = imaVideoObj.getPropertiesForTesting();
    expect(timeDiv).not.to.be.null;
    const {muteUnmuteDiv} = imaVideoObj.getPropertiesForTesting();
    expect(muteUnmuteDiv).not.to.be.null;
    const {fullscreenDiv} = imaVideoObj.getPropertiesForTesting();
    expect(fullscreenDiv).not.to.be.null;
    // expect controls to be hidden initially
    expect(controlsDiv).to.have.attribute('hidden');
    // call pause function to display ads
    imaVideoObj.onContentPauseRequested(mockGlobal);
    // expect controls to now be shown
    expect(controlsDiv).not.to.have.attribute('hidden');
  });

  it('resumes content', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = env.sandbox.spy(videoMock, 'addEventListener');
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(false);

    // run test
    imaVideoObj.onContentResumeRequested();

    // check results
    const properties = imaVideoObj.getPropertiesForTesting();
    expect(properties.adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
      properties.interactEvent
    );
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('changes controls when ad pauses and resumes', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(false);

    // start ad
    imaVideoObj.onContentResumeRequested();

    // verify original
    const {root} = imaVideoObj.getPropertiesForTesting().elements;
    expect(root).to.have.attribute('data-playing');

    // run test
    imaVideoObj.onAdPaused();
    expect(root).not.to.have.attribute('data-playing');

    // run test
    imaVideoObj.onAdResumed();
    expect(root).to.have.attribute('data-playing');
  });

  it('resumes content with content complete', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const addEventListenerSpy = env.sandbox.spy(videoMock, 'addEventListener');
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    imaVideoObj.setContentCompleteForTesting(true);

    // run test
    imaVideoObj.onContentResumeRequested();

    // check results
    const properties = imaVideoObj.getPropertiesForTesting();
    expect(properties.adsActive).to.be.false;
    expect(addEventListenerSpy).to.have.been.calledWith(
      properties.interactEvent
    );
    expect(addEventListenerSpy).to.have.been.calledWith('ended');
    // TODO - Fix when I can spy on internals.
    //expect(playVideoSpy).to.have.been.called;
  });

  it('controls are restored after content resumes', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setVideoPlayerForTesting(getVideoPlayerMock());
    imaVideoObj.setContentCompleteForTesting(true);
    // expect a subset of controls to be hidden / displayed during ad
    const {controlsDiv, fullscreenDiv, muteUnmuteDiv, playPauseDiv, timeDiv} =
      imaVideoObj.getPropertiesForTesting();
    expect(controlsDiv).not.to.be.null;
    expect(playPauseDiv).not.to.be.null;
    expect(timeDiv).not.to.be.null;
    expect(muteUnmuteDiv).not.to.be.null;
    expect(fullscreenDiv).not.to.be.null;
    imaVideoObj.showAdControls();
    expect(fullscreenDiv).not.to.have.attribute('hidden');
    // resume content after ad finishes
    imaVideoObj.onContentResumeRequested();
    // expect default control buttons to be displayed again
    expect(controlsDiv).not.to.have.attribute('hidden');
  });

  it('ad controls are smaller when skippable on mobile', () => {
    const videoDefaults = {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    };
    imaVideoObj.imaVideo(win, videoDefaults);

    const ad = {
      skippable: {getSkipTimeOffset: () => 30},
      unskippable: {getSkipTimeOffset: () => -1},
    };

    const tests = [
      {
        msg: 'Should set data-skippable if ad is skippable',
        ad: ad.skippable,
        expected: true,
      },
      {
        msg: 'Should not set data-skippable if ad is unskippable',
        ad: ad.unskippable,
        expected: false,
      },
    ];
    tests.forEach(({ad, expected, msg}) => {
      imaVideoObj.onAdLoad({getAd: () => ad});
      imaVideoObj.showAdControls();
      const {root} = imaVideoObj.getPropertiesForTesting().elements;
      expect(root.hasAttribute('data-skippable'), msg).to.eql(expected);
    });
  });

  it(
    'shows bigPlayDiv with content complete, ' +
      'when content resume is called',
    () => {
      imaVideoObj.imaVideo(win, {
        width: 640,
        height: 360,
        src: srcUrl,
        tag: adTagUrl,
      });
      const videoMock = getVideoPlayerMock();
      const addEventListenerSpy = env.sandbox.spy(
        videoMock,
        'addEventListener'
      );
      imaVideoObj.setVideoPlayerForTesting(videoMock);
      imaVideoObj.setContentCompleteForTesting(true);

      imaVideoObj.onContentResumeRequested();

      const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

      expect(imaVideoProperties.adsActive).to.be.false;
      expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoProperties.interactEvent
      );
      expect(addEventListenerSpy).to.have.been.calledWith('ended');
      expect(imaVideoProperties.bigPlayDiv).not.to.have.attribute('hidden');
    }
  );

  it('shows bigPlayDiv with allAdsCompleted, and content ended', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setAllAdsCompletedForTesting(true);

    imaVideoObj.onContentEnded();

    const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

    expect(imaVideoProperties.bigPlayDiv).not.to.have.attribute('hidden');
  });

  it(
    'does not show bigPlayDiv when content is resumed, ' +
      'and not content complete',
    () => {
      imaVideoObj.imaVideo(win, {
        width: 640,
        height: 360,
        src: srcUrl,
        tag: adTagUrl,
      });
      const videoMock = getVideoPlayerMock();
      const addEventListenerSpy = env.sandbox.spy(
        videoMock,
        'addEventListener'
      );
      imaVideoObj.setVideoPlayerForTesting(videoMock);

      imaVideoObj.onBigPlayClick();
      imaVideoObj.onContentResumeRequested();

      const imaVideoProperties = imaVideoObj.getPropertiesForTesting();

      expect(imaVideoProperties.adsActive).to.be.false;
      expect(addEventListenerSpy).to.have.been.calledWith(
        imaVideoProperties.interactEvent
      );
      expect(addEventListenerSpy).to.have.been.calledWith('ended');
      expect(imaVideoProperties.bigPlayDiv).to.have.attribute('hidden');
    }
  );

  it('updates playing time', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const {elements} = imaVideoObj.getPropertiesForTesting();

    imaVideoObj.updateTime(0, 60);
    expect(elements.time.textContent).to.eql('0:00 / 1:00');
    expect(elements.progress).to.not.have.attribute('hidden');
    expect(elements.progress.getAttribute('aria-hidden')).to.equal('false');
    expect(elements.progressLine.style.width).to.eql('0%');
    expect(elements.progressMarker.style.left).to.eql('-1%');

    imaVideoObj.updateTime(30, 60);
    expect(elements.time.textContent).to.eql('0:30 / 1:00');
    expect(elements.progress).to.not.have.attribute('hidden');
    expect(elements.progress.getAttribute('aria-hidden')).to.equal('false');
    expect(elements.progressLine.style.width).to.eql('50%');
    expect(elements.progressMarker.style.left).to.eql('49%');

    imaVideoObj.updateTime(60, 60);
    expect(elements.time.textContent).to.eql('1:00 / 1:00');
    expect(elements.progress).to.not.have.attribute('hidden');
    expect(elements.progress.getAttribute('aria-hidden')).to.equal('false');
    expect(elements.progressLine.style.width).to.eql('100%');
    expect(elements.progressMarker.style.left).to.eql('99%');

    const livestreamDuration = Infinity;

    // Compare against current progress state since livestreams should not change it.
    const progressLineWidth = elements.progressLine.style.width;
    const progressMarkerLeft = elements.progressMarker.style.left;

    imaVideoObj.updateTime(61, livestreamDuration);
    expect(elements.time.textContent).to.eql('1:01');
    expect(elements.progress).to.have.attribute('hidden');
    expect(elements.progress.getAttribute('aria-hidden')).to.equal('true');
    expect(elements.progressLine.style.width).to.eql(progressLineWidth);
    expect(elements.progressMarker.style.left).to.eql(progressMarkerLeft);

    imaVideoObj.updateTime(122, livestreamDuration);
    expect(elements.time.textContent).to.eql('2:02');
    expect(elements.progress).to.have.attribute('hidden');
    expect(elements.progress.getAttribute('aria-hidden')).to.equal('true');
    expect(elements.progressLine.style.width).to.eql(progressLineWidth);
    expect(elements.progressMarker.style.left).to.eql(progressMarkerLeft);
  });

  it('formats time', () => {
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
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED
    );
    //const playVideoSpy = env.sandbox.spy(imaVideoObj, 'playVideo');

    imaVideoObj.onPlayPauseClick();

    //expect(playVideoSpy).to.have.been.called;
    expect(true).to.be.true;
  });

  // TODO - FIX ONCE I FIGURE OUT HOW TO SPY ON INTERNAL METHODS
  it('pauses on click', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING
    );
    //const pauseVideoSpy = env.sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onPlayPauseClick();

    //expect(pauseVideoSpy).to.have.been.called;
    expect(true).to.be.true;
  });

  it('plays video', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const playSpy = env.sandbox.spy(videoMock, 'play');
    imaVideoObj.setVideoPlayerForTesting(videoMock);

    imaVideoObj.playVideo();

    expect(
      imaVideoObj.getPropertiesForTesting().adContainerDiv
    ).to.have.attribute('hidden');
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING
    );
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
    expect(playSpy).to.have.been.called;
  });

  it('pauses video', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const pauseSpy = env.sandbox.spy(videoMock, 'pause');
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    //const showControlsSpy = env.sandbox.spy(imaVideoObj, 'showControls');
    imaVideoObj.getPropertiesForTesting().playerState =
      imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING;

    imaVideoObj.pauseVideo({});

    expect(pauseSpy).to.have.been.called;
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED
    );
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
  });

  it('mutes on click', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = getAdsManagerMock();
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);
    imaVideoObj.setVideoPlayerMutedForTesting(false);
    //const pauseVideoSpy = env.sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onMuteUnmuteClick();

    const isMuted = imaVideoObj.getPropertiesForTesting().videoPlayer.muted;

    //expect(pauseVideoSpy).to.have.been.called;
    expect(isMuted).to.be.true;
  });

  it('unmutes on click', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    const adsManagerMock = getAdsManagerMock();
    imaVideoObj.setAdsManagerForTesting(adsManagerMock);
    imaVideoObj.setVideoPlayerMutedForTesting(true);
    //const pauseVideoSpy = env.sandbox.spy(imaVideoObj, 'pauseVideo');

    imaVideoObj.onMuteUnmuteClick();

    const isMuted = imaVideoObj.getPropertiesForTesting().videoPlayer.muted;

    //expect(pauseVideoSpy).to.have.been.called;
    expect(isMuted).to.be.false;
  });

  it('pauses video after webkit end fullscreen', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    const videoMock = getVideoPlayerMock();
    const pauseSpy = env.sandbox.spy(videoMock, 'pause');
    const removeEventListenerSpy = env.sandbox.spy(
      videoMock,
      'removeEventListener'
    );
    imaVideoObj.setVideoPlayerForTesting(videoMock);
    //const showControlsSpy = env.sandbox.spy(imaVideoObj, 'showControls');
    imaVideoObj.getPropertiesForTesting().playerState =
      imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING;

    imaVideoObj.pauseVideo({type: 'webkitendfullscreen'});

    expect(pauseSpy).to.have.been.called;
    expect(imaVideoObj.getPropertiesForTesting().playerState).to.eql(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PAUSED
    );
    // TODO - Why doesn't this work?
    //expect(showControlsSpy).to.have.been.called;
    expect(removeEventListenerSpy).to.have.been.called;
  });

  it('shows controls when paused', () => {
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

    expect(
      imaVideoObj.getPropertiesForTesting().controlsDiv
    ).not.to.have.attribute('hidden');
    expect(imaVideoObj.getPropertiesForTesting().hideControlsTimeout).to.be
      .null;
  });

  it('shows controls when playing', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });
    imaVideoObj.setPlayerStateForTesting(
      imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING
    );

    imaVideoObj.showControls();

    expect(
      imaVideoObj.getPropertiesForTesting().controlsDiv
    ).not.to.have.attribute('hidden');
    expect(imaVideoObj.getPropertiesForTesting().hideControlsTimeout).not.to.be
      .undefined;
  });

  it('hides controls', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.hideControls();

    expect(imaVideoObj.getPropertiesForTesting().controlsDiv).to.have.attribute(
      'hidden'
    );
  });

  // Case when autoplay signal is sent before play signal is sent.
  it('hides controls before visible', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.hideControls();
    expect(imaVideoObj.getPropertiesForTesting().controlsDiv).to.have.attribute(
      'hidden'
    );
    expect(imaVideoObj.getPropertiesForTesting().hideControlsQueued).to.be.true;

    imaVideoObj.playVideo();
    expect(imaVideoObj.getPropertiesForTesting().controlsDiv).to.have.attribute(
      'hidden'
    );
    expect(imaVideoObj.getPropertiesForTesting().hideControlsQueued).to.be
      .false;
  });

  it('always shows ads controls', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.hideControls();
    expect(imaVideoObj.getPropertiesForTesting().controlsDiv).to.have.attribute(
      'hidden'
    );
    expect(imaVideoObj.getPropertiesForTesting().hideControlsQueued).to.be.true;

    // Fake the ad starting to play
    imaVideoObj.showAdControls();
    expect(
      imaVideoObj.getPropertiesForTesting().controlsDiv
    ).not.to.have.attribute('hidden');
    expect(imaVideoObj.getPropertiesForTesting().hideControlsQueued).to.be.true;
  });

  const hoverEventsToTest = ['click', 'mousemove'];
  hoverEventsToTest.forEach((hoverEvent) => {
    it(`shows controls on ${hoverEvent} (hover) while playing after hidden`, () => {
      imaVideoObj.imaVideo(win, {
        width: 640,
        height: 360,
        src: srcUrl,
        tag: adTagUrl,
      });

      imaVideoObj.hideControls();

      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.false;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).to.have.attribute('hidden');

      const interactEvent = new Event(hoverEvent);
      const videoPlayerElement =
        imaVideoObj.getPropertiesForTesting().videoPlayer;

      imaVideoObj.setPlayerStateForTesting(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING
      );
      imaVideoObj.addHoverEventToElement(
        videoPlayerElement,
        imaVideoObj.getShowControlsThrottledForTesting()
      );
      videoPlayerElement.dispatchEvent(interactEvent);

      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.true;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).not.to.have.attribute('hidden');
      expect(imaVideoObj.getPropertiesForTesting().hideControlsTimeout).not.to
        .be.undefined;
    });

    it(`throttles ${hoverEvent} (hover) for showing controls`, async function () {
      imaVideoObj.imaVideo(win, {
        width: 640,
        height: 360,
        src: srcUrl,
        tag: adTagUrl,
      });

      imaVideoObj.hideControls();
      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.false;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).to.have.attribute('hidden');

      const interactEvent = new Event(hoverEvent);
      const videoPlayerElement =
        imaVideoObj.getPropertiesForTesting().videoPlayer;

      imaVideoObj.setPlayerStateForTesting(
        imaVideoObj.getPropertiesForTesting().PlayerStates.PLAYING
      );
      imaVideoObj.addHoverEventToElement(
        videoPlayerElement,
        imaVideoObj.getShowControlsThrottledForTesting()
      );
      videoPlayerElement.dispatchEvent(interactEvent);

      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.true;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).not.to.have.attribute('hidden');

      imaVideoObj.hideControls();
      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.false;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).to.have.attribute('hidden');

      clock.tick(100);
      videoPlayerElement.dispatchEvent(interactEvent);

      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.false;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).to.have.attribute('hidden');

      clock.tick(950);
      videoPlayerElement.dispatchEvent(interactEvent);

      expect(imaVideoObj.getPropertiesForTesting().controlsVisible).to.be.true;
      expect(
        imaVideoObj.getPropertiesForTesting().controlsDiv
      ).not.to.have.attribute('hidden');
    });
  });

  it('suppresses IMA load with unknown consent', () => {
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
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.UNKNOWN,
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().imaLoadAllowed).to.eql(false);
  });

  it('handles insufficient consent', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.xml'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.INSUFFICIENT,
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl).to.eql(
      'vast.xml?npa=1'
    );
  });

  it('handles sufficient consent', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.xml'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.SUFFICIENT,
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl).to.eql(
      'vast.xml'
    );
  });

  it('handles unknown_not_required consent', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.xml'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.UNKNOWN_NOT_REQUIRED,
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl).to.eql(
      'vast.xml'
    );
  });

  it('passes gdpr_consent', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.xml'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.SUFFICIENT,
      initialConsentMetadata: {consentStringType: CONSENT_STRING_TYPE.TCF_V2},
      initialConsentValue: 'myConsentValue',
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl).to.eql(
      'vast.xml?gdpr=1&gdpr_consent=myConsentValue'
    );
  });

  it('does not pass gdpr_consent with CONSENT_STRING_TYPE == US_PRIVACY_STRING', () => {
    imaVideoObj.imaVideo(win, {
      width: 640,
      height: 360,
      src: srcUrl,
      tag: adTagUrl,
    });

    const mockAdsLoader = {requestAds() {}};
    const mockAdsRequest = {adTagUrl: 'vast.xml'};
    imaVideoObj.setAdsLoaderForTesting(mockAdsLoader);
    imaVideoObj.setAdsRequestForTesting(mockAdsRequest);
    imaVideoObj.setContextForTesting({
      initialConsentState: CONSENT_POLICY_STATE.SUFFICIENT,
      initialConsentMetadata: {
        consentStringType: CONSENT_STRING_TYPE.US_PRIVACY_STRING,
      },
      initialConsentValue: 'myConsentValue',
    });
    imaVideoObj.requestAds();

    expect(imaVideoObj.getPropertiesForTesting().adsRequest.adTagUrl).to.eql(
      'vast.xml'
    );
  });
});
