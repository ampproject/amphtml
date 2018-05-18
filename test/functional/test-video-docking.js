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
import {
  Direction,
  VideoDocking,
} from '../../src/service/video/docking';
import {PlayingStates} from '../../src/video-interface';
import {Services} from '../../src/services';
import {layoutRectLtwh} from '../../src/layout-rect';


describes.fakeWin('Video Docking', {amp: true}, env => {
  let ampdoc;
  let manager;
  let docking;

  function createVideo() {
    const element = env.win.document.createElement('div');
    const noop = () => {};
    Object.assign(element, {
      getIntersectionChangeEntry: noop,
    });
    return {element, getLayoutBox: noop};
  }

  function stubLayoutBox(video, rect, ratio = 0) {
    sandbox.stub(video, 'getLayoutBox').returns(rect);
    sandbox.stub(video.element, 'getIntersectionChangeEntry').returns({
      intersectionRatio: ratio,
      intersectionRect: rect,
    });
  }

  beforeEach(() => {
    ampdoc = env.ampdoc;
    manager = {
      getPlayingState() { return PlayingStates.PLAYING_MANUAL; },
      isMuted() { return false; },
    };
    docking = new VideoDocking(ampdoc, manager);
    sandbox.stub(Services, 'viewportForDoc').returns({});
  });

  it('should not dock if the viewport is too small', () => {
    const video = createVideo();
    const dock = sandbox.spy(docking, 'dock_');

    sandbox.stub(docking, 'getAreaWidth_').returns(319);
    stubLayoutBox(video, layoutRectLtwh(0, -200, 400, 300));

    docking.updateOnPositionChange_(video);

    expect(dock).to.not.have.been.called;
  });

  it('should not dock if the video is portrait', () => {
    const dock = sandbox.spy(docking, 'dock_');
    const video = createVideo();

    sandbox.stub(docking, 'getAreaWidth_').returns(400);
    stubLayoutBox(video, layoutRectLtwh(0, -400, 300, 400));

    allowConsoleError(() => {
      // user().error() expected
      docking.updateOnPositionChange_(video);
    });

    expect(dock).to.not.have.been.called;
  });

  it('should not dock if another video is docked', () => {
    const dock = sandbox.spy(docking, 'dock_');
    const video = createVideo();

    sandbox.stub(docking, 'getAreaWidth_').returns(400);
    stubLayoutBox(video, layoutRectLtwh(0, 0, 0, 0));

    docking.currentlyDocked_ = {video: createVideo()};

    docking.updateOnPositionChange_(video);

    expect(dock).to.not.have.been.called;
  });

  it('should dock if video is over top boundary', () => {
    const dock = sandbox.stub(docking, 'dock_');
    const video = createVideo();

    docking.scrollDirection_ = Direction.UP;

    sandbox.stub(docking, 'getAreaWidth_').returns(400);
    sandbox.stub(docking, 'getTopEdge_').returns(0);
    stubLayoutBox(video, layoutRectLtwh(0, -250, 400, 300), /* ratio */ 0.1667);

    docking.updateOnPositionChange_(video);

    expect(dock).to.have.been.calledOnce;
  });

  it('should dock if video is under bottom boundary', () => {
    const dock = sandbox.stub(docking, 'dock_');
    const video = createVideo();

    docking.scrollDirection_ = Direction.DOWN;

    sandbox.stub(docking, 'getAreaWidth_').returns(400);
    sandbox.stub(docking, 'getBottomEdge_').returns(400);
    stubLayoutBox(video, layoutRectLtwh(0, 650, 400, 300), /* ratio */ 0.1667);

    docking.updateOnPositionChange_(video);

    expect(dock).to.have.been.calledOnce;
  });

  it('should not dock if the video does not touch boundaries', () => {
    const dock = sandbox.stub(docking, 'dock_');
    const video = createVideo();

    docking.scrollDirection_ = Direction.UP;

    stubLayoutBox(video, layoutRectLtwh(0, 1, 400, 300));
    sandbox.stub(docking, 'getAreaWidth_').returns(400);

    docking.updateOnPositionChange_(video);

    expect(dock).to.not.have.been.called;
  });
});
