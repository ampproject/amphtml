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
  REVERT_TO_INLINE_RATIO,
  VideoDocking,
} from '../amp-video-docking';
import {PlayingStates} from '../../../../src/video-interface';
import {Services} from '../../../../src/services';
import {layoutRectLtwh} from '../../../../src/layout-rect';


const noop = () => {};

const slotId = 'my-slot-element';

describes.repeated('', {
  'Minimize to corner': {
    useSlot: false,
    topBoundary: 0,
  },
  'Minimize to slot element': {
    useSlot: true,
    topBoundary: 20,
  },
}, (name, variant) => {

  const {useSlot, topBoundary} = variant;

  describes.realWin('↗ 🔲', {amp: true}, env => {
    let ampdoc;
    let manager;
    let viewport;
    let docking;
    let querySelectorStub;

    const viewportSize = {width: 0, height: 0};

    const targetType = useSlot ? 'slot element' : 'corner';
    const skipForSlot = useSlot ? it.skip : it;

    function createVideo() {
      const video = createAmpElementMock();

      video.element.setAttribute('dock', useSlot ? '#' + slotId : '');

      // VideoDocking.querySlot_() expects this guy:
      querySelectorStub
          .withArgs('[dock]')
          .returns(video.element);

      // VideoDocking.querySlot_() expects the VideoEvents.REGISTERED signal.
      // This is normally set by virtue of the Video service, which is not
      // tested here.
      video.signals = () => ({
        get: () => true,
      });

      video.element.signals = video.signals;

      return video;
    }

    function createAmpElementMock(tag = 'div') {
      const element = env.win.document.createElement(tag);
      const defaultLayoutRect = layoutRectLtwh(0, 0, 0, 0);
      Object.assign(element, {
        getIntersectionChangeEntry: noop,
        getLayoutBox: () => defaultLayoutRect,
      });
      return {
        element,
        getLayoutBox: () => defaultLayoutRect,
      };
    }

    function stubLayoutBox(impl, rect, ratio = 0) {
      sandbox.stub(impl, 'getLayoutBox').returns(rect);
      sandbox.stub(impl.element, 'getLayoutBox').returns(rect);
      sandbox.stub(impl.element, 'getIntersectionChangeEntry').returns({
        intersectionRatio: ratio,
        intersectionRect: rect,
      });
    }

    function maybeCreateSlotElementLtwh(left, top, width, height, ratio = 0) {
      if (!useSlot) {
        return;
      }
      const impl = createAmpElementMock('amp-layout');
      impl.element.id = slotId;
      impl.element.setAttribute('layout', 'fill');
      stubLayoutBox(impl, layoutRectLtwh(left, top, width, height), ratio);
      env.win.document.body.appendChild(impl.element);

      querySelectorStub
          .withArgs('#' + slotId)
          .returns(impl.element);
    }

    function setValidAreaWidth() {
      mockAreaWidth(400);
    }

    function mockInvalidAreaWidth() {
      const min = 320;
      mockAreaWidth(min - 1);
    }

    function mockAreaWidth(width) {
      viewport.width = width;
      sandbox.stub(docking, 'getAreaWidth_').returns(width);
    }

    function setValidAreaHeight(videoHeight = 400) {
      mockAreaHeight(videoHeight * REVERT_TO_INLINE_RATIO);
    }

    function mockAreaHeight(height) {
      viewport.height = height;
      sandbox.stub(docking, 'getAreaHeight_').returns(height);
    }

    function placeVideoLtwh(video, left, top, width, height, ratio = 0) {
      stubLayoutBox(video, layoutRectLtwh(left, top, width, height), ratio);
    }

    function setScrollDirection(direction) {
      docking.scrollDirection_ = direction;
    }

    function stubDock() {
      return sandbox.stub(docking, 'dockInTwoSteps_');
    }

    beforeEach(() => {
      ampdoc = env.ampdoc;

      querySelectorStub = sandbox.stub(ampdoc.getRootNode(), 'querySelector');

      manager = {
        getPlayingState() { return PlayingStates.PLAYING_MANUAL; },
        isMuted() { return false; },
      };

      viewport = {
        getScrollTop: () => 0,
        getSize: () => viewportSize,
      };

      sandbox.stub(Services, 'viewportForDoc').returns(viewport);
      sandbox.stub(Services, 'videoManagerForDoc').returns(manager);

      const positionObserverMock = {};

      docking = new VideoDocking(ampdoc, positionObserverMock);
    });

    afterEach(() => {
      viewport.width = 0;
      viewport.height = 0;
    });

    it(`should use a ${targetType} as target`, () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const video = createVideo();

      const videoWidth = 400;
      const videoHeight = 300;

      placeVideoLtwh(video, 0, -200, videoWidth, videoHeight);

      setScrollDirection(Direction.UP);

      setValidAreaWidth();
      setValidAreaHeight(videoHeight);

      const target = docking.getTargetFor_(video);

      expect(target).to.not.be.null;

      if (useSlot) {
        expect(target.nodeType).to.equal(/* ELEMENT */ 1);
        expect(target.posX).to.be.undefined;
        expect(target.posY).to.be.undefined;
      } else {
        expect(target.nodeType).to.be.undefined;
        expect(target.posX).to.not.be.undefined;
        expect(target.posY).to.not.be.undefined;
      }
    });

    it('should not dock if the viewport is too small', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const video = createVideo();
      const dock = stubDock();

      const videoWidth = 400;
      const videoHeight = 300;

      placeVideoLtwh(video, 0, -200, videoWidth, videoHeight);

      setScrollDirection(Direction.UP);

      mockInvalidAreaWidth();
      setValidAreaHeight(videoHeight);

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });

    it('should not dock if the video is portrait', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const dock = stubDock();
      const video = createVideo();

      const videoWidth = 300;
      const videoHeight = 400;

      setScrollDirection(Direction.UP);

      setValidAreaWidth();
      setValidAreaHeight(videoHeight);

      placeVideoLtwh(video, 0, -400, videoWidth, videoHeight);

      allowConsoleError(() => {
        // user().error() expected.
        docking.updateOnPositionChange_(video);
      });

      expect(dock).to.not.have.been.called;
    });

    // TODO(alanorozco): Unskip for slot
    skipForSlot('does not dock if the video\'s layout box is not sized', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const video = createVideo();
      const dock = stubDock();

      placeVideoLtwh(video, 0, -100, 0, 0);

      setScrollDirection(Direction.UP);

      setValidAreaWidth();
      setValidAreaHeight();

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });

    it('should not dock if another video is docked', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const dock = stubDock();
      const video = createVideo();

      setValidAreaWidth();

      placeVideoLtwh(video, 0, 0, 0, 0);

      docking.currentlyDocked_ = {video: createVideo()};

      setScrollDirection(Direction.UP);

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });

    it('should dock if video is over top boundary', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const dock = stubDock();
      const video = createVideo();

      setScrollDirection(Direction.UP);

      const videoWidth = 400;
      const videoHeight = 300;

      setValidAreaWidth();
      setValidAreaHeight(videoHeight);

      placeVideoLtwh(
          video, 0, -250, videoWidth, videoHeight, /* ratio */ 1 / 3);

      sandbox.stub(docking, 'getTopEdge_').returns(topBoundary);

      docking.updateOnPositionChange_(video);

      expect(dock).to.have.been.calledOnce;
    });

    // TODO(alanorozco): Unskip
    skipForSlot('should not dock if video does not touch boundaries', () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const dock = stubDock();
      const video = createVideo();

      const videoWidth = 400;
      const videoHeight = 300;

      setValidAreaWidth();
      setValidAreaHeight(videoHeight);
      setScrollDirection(Direction.UP);
      placeVideoLtwh(video, 0, topBoundary + 1, videoWidth, videoHeight);

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });
  });
});
