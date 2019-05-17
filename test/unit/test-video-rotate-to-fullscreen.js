/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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
import {AutoFullscreenManager} from '../../src/service/video-manager-impl';
import {PlayingStates} from '../../src/video-interface';
import {Services} from '../../src/services';

describes.fakeWin('Rotate-to-fullscreen', {amp: true}, env => {
  let ampdoc;
  let autoFullscreenManager;

  function createVideo() {
    const element = env.win.document.createElement('div');
    const noop = () => {};
    Object.assign(element, {
      getIntersectionChangeEntry: noop,
    });
    return {
      element,
      signals: () => ({whenSignal: () => ({then: noop})}),
    };
  }

  function mockCenteredVideo(element) {
    autoFullscreenManager.currentlyCentered_ = element;
  }

  function mockOrientation(orientation) {
    env.win.screen = env.win.screen || {orientation: {type: ''}};
    env.win.screen.orientation.type = orientation;
  }

  beforeEach(() => {
    ampdoc = env.ampdoc;
    autoFullscreenManager = new AutoFullscreenManager(ampdoc);
    sandbox.stub(autoFullscreenManager, 'canFullscreen_').returns(true);
  });

  it('should enter fullscreen if a video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(video.element);

    sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.have.been.calledOnce;
  });

  it('should not enter fullscreen if no video is centered in portrait', () => {
    const video = createVideo();
    const entry = {video};
    const enter = sandbox.stub(autoFullscreenManager, 'enter_');

    mockCenteredVideo(null);

    sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    mockOrientation('landscape');
    autoFullscreenManager.onRotation_();

    expect(enter).to.not.have.been.called;
  });

  it('should exit fullscreen on rotation', () => {
    const video = createVideo();
    const entry = {video};
    const exit = sandbox.stub(autoFullscreenManager, 'exit_');

    sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    autoFullscreenManager.currentlyInFullscreen_ = entry;
    mockOrientation('portrait');
    autoFullscreenManager.onRotation_();

    expect(exit).to.have.been.calledOnce;
  });

  it('should not exit on rotation if no video was in fullscreen', () => {
    const video = createVideo();
    const entry = {video};
    const exit = sandbox.stub(autoFullscreenManager, 'exit_');

    sandbox.stub(autoFullscreenManager, 'selectBestCenteredInPortrait_');
    autoFullscreenManager.register(entry);
    autoFullscreenManager.currentlyInFullscreen_ = null;
    mockOrientation('portrait');
    autoFullscreenManager.onRotation_();

    expect(exit).to.not.have.been.called;
  });

  it('selects the only video playing manually amongst visible', () => {
    const video1 = createVideo();
    const video2 = createVideo();
    const video3 = createVideo();

    sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 1000,
    });

    sandbox.stub(video1.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video2.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video3.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 400,
        bottom: 600,
        width: 300,
        height: 200,
      },
    });

    const getPlayingState = sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates.PAUSED);
    getPlayingState.withArgs(video2).returns(PlayingStates.PLAYING_AUTO);
    getPlayingState.withArgs(video3).returns(PlayingStates.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});
    autoFullscreenManager.register({video: video3});

    expect(autoFullscreenManager.selectBestCenteredInPortrait_()).to.equal(
      video3
    );
  });

  it('selects center-most video among those visible and playing', () => {
    const video1 = createVideo();
    const video2 = createVideo();
    const video3 = createVideo();

    sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 600,
    });

    sandbox.stub(video1.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video2.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video3.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 400,
        bottom: 600,
        width: 300,
        height: 200,
      },
    });

    const getPlayingState = sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates.PLAYING_MANUAL);
    getPlayingState.withArgs(video3).returns(PlayingStates.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});
    autoFullscreenManager.register({video: video3});

    expect(autoFullscreenManager.selectBestCenteredInPortrait_()).to.equal(
      video2
    );
  });

  it('selects top-most video if two videos are equally centered', () => {
    const video1 = createVideo();
    const video2 = createVideo();

    sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 400,
    });

    sandbox.stub(video1.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 0,
        bottom: 200,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video2.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    });

    const getPlayingState = sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});

    expect(autoFullscreenManager.selectBestCenteredInPortrait_()).to.equal(
      video1
    );
  });

  it('selects the highest intersection ratio if two videos are visible', () => {
    const video1 = createVideo();
    const video2 = createVideo();

    sandbox.stub(Services.viewportForDoc(ampdoc), 'getSize').returns({
      width: 1000,
      height: 400,
    });

    sandbox.stub(video1.element, 'getIntersectionChangeEntry').returns({
      intersectionRatio: 0.9,
      boundingClientRect: {
        top: -30,
        bottom: 170,
        width: 300,
        height: 200,
      },
    });
    sandbox.stub(video2.element, 'getIntersectionChangeEntry').returns({
      // Visible:
      intersectionRatio: 1,
      boundingClientRect: {
        top: 200,
        bottom: 400,
        width: 300,
        height: 200,
      },
    });

    const getPlayingState = sandbox.stub(
      autoFullscreenManager,
      'getPlayingState_'
    );

    getPlayingState.withArgs(video1).returns(PlayingStates.PLAYING_MANUAL);
    getPlayingState.withArgs(video2).returns(PlayingStates.PLAYING_MANUAL);

    autoFullscreenManager.register({video: video1});
    autoFullscreenManager.register({video: video2});

    expect(autoFullscreenManager.selectBestCenteredInPortrait_()).to.equal(
      video2
    );
  });
});
