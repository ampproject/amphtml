import {Services} from '#service';
import {AutoFullscreenManager} from '#service/video-manager-impl';

import {PlayingStates_Enum} from '../../src/video-interface';

describes.fakeWin('Rotate-to-fullscreen', {amp: true}, (env) => {
  let ampdoc;
  let autoFullscreenManager;
  let ioCallback;

  function createVideo() {
    const element = env.win.document.createElement('div');
    const impl = {
      element,
      signals: () => ({whenSignal: () => ({then: () => {}})}),
    };
    element.getImpl = () => Promise.resolve(impl);
    return impl;
  }

  function mockCenteredVideo(element) {
    autoFullscreenManager.currentlyCentered_ = element;
  }

  function mockOrientation(orientation) {
    env.win.screen = env.win.screen || {orientation: {type: ''}};
    env.win.screen.orientation.type = orientation;
  }

  function fireIntersection({boundingClientRect, intersectionRatio, target}) {
    ioCallback([
      {
        target,
        boundingClientRect,
        rootBounds: {},
        intersectionRatio,
      },
    ]);
  }

  beforeEach(() => {
    ampdoc = env.ampdoc;
    autoFullscreenManager = new AutoFullscreenManager(ampdoc);
    env.sandbox.stub(autoFullscreenManager, 'canFullscreen_').returns(true);
    env.win.IntersectionObserver = (cb) => {
      ioCallback = cb;
      return {observe: () => {}, unobserve: () => {}, disconnect: () => {}};
    };
  });

  it('should enter fullscreen if a video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = env.sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(video.element);

    env.sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.have.been.calledOnce;
  });

  it('should not enter fullscreen if no video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = env.sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(null);

    env.sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.not.have.been.called;
  });

  it('should exit fullscreen on rotation', () => {
    const video = createVideo();
    const entry = {video};
    const exit = env.sandbox.stub(autoFullscreenManager, 'exit_');

    env.sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    autoFullscreenManager.currentlyInFullscreen_ = entry;
    mockOrientation('portrait');
    autoFullscreenManager.onRotation_();

    expect(exit).to.have.been.calledOnce;
  });

  it('should not exit on rotation if no video was in fullscreen', () => {
    const video = createVideo();
    const entry = {video};
    const exit = env.sandbox.stub(autoFullscreenManager, 'exit_');

    env.sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    autoFullscreenManager.currentlyInFullscreen_ = null;
    mockOrientation('portrait');
    autoFullscreenManager.onRotation_();

    expect(exit).to.not.have.been.called;
  });

  it('selects the only video playing manually amongst visible', async () => {
    const video1 = createVideo();
    const video2 = createVideo();
    const video3 = createVideo();

    env.sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 1000,
    });

    const video3Entry = {
      // Visible:
      target: video3.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 400,
        bottom: 600,
        width: 300,
        height: 200,
      },
    };

    const getPlayingState = env.sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates_Enum.PAUSED);
    getPlayingState.withArgs(video2).returns(PlayingStates_Enum.PLAYING_AUTO);
    getPlayingState.withArgs(video3).returns(PlayingStates_Enum.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});
    autoFullscreenManager.register({video: video3});

    const bestCenteredPromise =
      autoFullscreenManager.selectBestCenteredInPortrait_();
    fireIntersection(video3Entry);
    expect(await bestCenteredPromise).equal(video3);
  });

  it('selects center-most video among those visible and playing', async () => {
    const video1 = createVideo();
    const video2 = createVideo();
    const video3 = createVideo();

    env.sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 600,
    });

    const video1Entry = {
      // Visible:
      target: video1.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
      },
    };
    const video2Entry = {
      // Visible:
      target: video2.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    };
    const video3Entry = {
      // Visible:
      target: video3.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 400,
        bottom: 600,
        width: 300,
        height: 200,
      },
    };

    const getPlayingState = env.sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates_Enum.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates_Enum.PLAYING_MANUAL);
    getPlayingState.withArgs(video3).returns(PlayingStates_Enum.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});
    autoFullscreenManager.register({video: video3});

    const bestCenteredPromise =
      autoFullscreenManager.selectBestCenteredInPortrait_();
    [video1Entry, video2Entry, video3Entry].forEach(fireIntersection);
    expect(await bestCenteredPromise).to.equal(video2);
  });

  it('selects top-most video if two videos are equally centered', async () => {
    const video1 = createVideo();
    const video2 = createVideo();

    env.sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 400,
    });

    const video1Entry = {
      // Visible:
      target: video1.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
      },
    };
    const video2Entry = {
      // Visible:
      target: video2.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    };

    const getPlayingState = env.sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates_Enum.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates_Enum.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});

    const bestCenteredPromise =
      autoFullscreenManager.selectBestCenteredInPortrait_();
    [video1Entry, video2Entry].forEach(fireIntersection);
    expect(await bestCenteredPromise).to.equal(video1);
  });

  it('selects the highest intersection ratio if two videos are visible', async () => {
    const video1 = createVideo();
    const video2 = createVideo();

    env.sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 400,
    });

    const video1Entry = {
      target: video1.element,
      intersectionRatio: 0.9,
      boundingClientRect: {
        top: -30,
        bottom: 170,
        width: 300,
        height: 200,
      },
    };
    const video2Entry = {
      // Visible:
      target: video2.element,
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    };

    const getPlayingState = env.sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates_Enum.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates_Enum.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});

    const bestCenteredPromise =
      autoFullscreenManager.selectBestCenteredInPortrait_();
    [video1Entry, video2Entry].forEach(fireIntersection);
    expect(await bestCenteredPromise).to.equal(video2);
  });
});
