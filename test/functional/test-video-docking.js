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
    let docking;
    let querySelectorStub;

    const targetType = useSlot ? 'slot element' : 'corner';

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
      Object.assign(element, {
        getIntersectionChangeEntry: noop,
        getLayoutBox: noop,
      });
      return {
        element,
        getLayoutBox: noop,
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

    function createSlotElement(rect, ratio = 0) {
      const impl = createAmpElementMock('amp-layout');
      impl.element.id = slotId;
      impl.element.setAttribute('layout', 'fill');
      stubLayoutBox(impl, rect, ratio);
      env.win.document.body.appendChild(impl.element);

      querySelectorStub
          .withArgs('#' + slotId)
          .returns(impl.element);

      return impl;
    }

    beforeEach(() => {
      ampdoc = env.ampdoc;

      querySelectorStub = sandbox.stub(ampdoc.getRootNode(), 'querySelector');

      manager = {
        getPlayingState() { return PlayingStates.PLAYING_MANUAL; },
        isMuted() { return false; },
      };

      docking = new VideoDocking(ampdoc, manager);

      sandbox.stub(Services, 'viewportForDoc').returns({
        getScrollTop: () => 0,
      });

      sandbox.stub();

      if (useSlot) {
        createSlotElement(layoutRectLtwh(190, topBoundary, 200, 100));
      }
    });

    it(`should use a ${targetType} as target`, () => {
      const video = createVideo();
      stubLayoutBox(video, layoutRectLtwh(0, -200, 400, 300));

      docking.scrollDirection_ = Direction.UP;

      sandbox.stub(docking, 'getAreaWidth_').returns(400);

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
      stubLayoutBox(video, layoutRectLtwh(0, -250, 400, 300),
          /* ratio */ 0.1667);

      docking.updateOnPositionChange_(video);

      expect(dock).to.have.been.calledOnce;
    });

    if (!useSlot) {
      // Slot elements only support one docking position.
      it('should dock if video is under bottom boundary', () => {
        const dock = sandbox.stub(docking, 'dock_');
        const video = createVideo();

        docking.scrollDirection_ = Direction.DOWN;

        sandbox.stub(docking, 'getAreaWidth_').returns(400);
        sandbox.stub(docking, 'getBottomEdge_').returns(400);
        stubLayoutBox(video, layoutRectLtwh(0, 650, 400, 300),
            /* ratio */ 0.1667);

        docking.updateOnPositionChange_(video);

        expect(dock).to.have.been.calledOnce;
      });
    }

    it('should not dock if the video does not touch boundaries', () => {
      const dock = sandbox.stub(docking, 'dock_');
      const video = createVideo();

      docking.scrollDirection_ = Direction.UP;

      stubLayoutBox(video, layoutRectLtwh(0, topBoundary + 1, 400, 300));
      sandbox.stub(docking, 'getAreaWidth_').returns(400);

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });
  });
});
