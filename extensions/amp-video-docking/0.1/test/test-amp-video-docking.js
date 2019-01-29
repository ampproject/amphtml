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
  Actions,
  BASE_CLASS_NAME,
  DOCKED_TO_CORNER_SIZING_RATIO,
  Direction,
  MARGIN_AREA_WIDTH_PERC,
  MARGIN_MAX,
  MIN_WIDTH,
  PLACEHOLDER_ICON_BREAKPOINTS,
  REVERT_TO_INLINE_RATIO,
  RelativeX,
  RelativeY,
  VideoDocking,
} from '../amp-video-docking';
import {Deferred, tryResolve} from '../../../../src/utils/promise';
import {PlayingStates} from '../../../../src/video-interface';
import {Services} from '../../../../src/services';
import {htmlFor} from '../../../../src/static-template';
import {layoutRectLtwh} from '../../../../src/layout-rect';


const noop = () => {};

const slotId = 'my-slot-element';

describes.realWin('↗ 🔲', {amp: true}, env => {

  let ampdoc;
  let manager;
  let viewport;
  let docking;
  let querySelectorStub;

  let slotAttr = '';

  const viewportSize = {width: 0, height: 0};

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
      mutateElement: cb => tryResolve(cb),
      applyFillContent: env.sandbox.spy(),
    };
  }

  function createVideo() {
    const video = createAmpElementMock();

    video.element.setAttribute('dock', slotAttr);

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

    video.pause = sandbox.spy();
    video.showControls = sandbox.spy();

    return video;
  }

  function stubLayoutBox(impl, rect, ratio = 0) {
    impl.getLayoutBox = () => rect;
    impl.element.getLayoutBox = impl.getLayoutBox;
    impl.element.getIntersectionChangeEntry = () => ({
      intersectionRatio: ratio,
      intersectionRect: rect,
    });
  }

  function setValidAreaWidth() {
    return mockAreaWidth(400);
  }

  function mockInvalidAreaWidth() {
    const min = 320;
    return mockAreaWidth(min - 1);
  }

  function mockAreaWidth(width) {
    viewport.width = width;
    sandbox.stub(docking, 'getRightEdge_').returns(width);
    return width;
  }

  function setValidAreaHeight(videoHeight = 400) {
    return mockAreaHeight(videoHeight * REVERT_TO_INLINE_RATIO);
  }

  function mockAreaHeight(height) {
    viewport.height = height;
    sandbox.stub(docking, 'getBottomEdge_').returns(height);
    return height;
  }

  function placeElementLtwh(ampEl, left, top, width, height, ratio = 0) {
    stubLayoutBox(ampEl, layoutRectLtwh(left, top, width, height), ratio);
  }

  function setScrollDirection(direction) {
    docking.scrollDirection_ = direction;
  }

  function stubDock() {
    return sandbox.stub(docking, 'dockInTransferLayerStep_');
  }

  function enableComputedStyle(el) {
    env.win.document.body.appendChild(el);
  }

  function stubControls() {
    const html = htmlFor(env.win.document);
    const controls = {
      positionOnVsync: sandbox.spy(),
      enable: sandbox.spy(),
      disable: sandbox.spy(),
      hide: sandbox.spy(),
      overlay: html`<div></div>`,
    };

    sandbox.stub(docking, 'getControls_').returns(controls);

    return controls;
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

    sandbox.stub(docking, 'getTimer_').returns({
      promise: () => Promise.resolve(),
    });
  });

  afterEach(() => {
    viewport.width = 0;
    viewport.height = 0;
  });

  describe('placeAt_', () => {

    let video;
    let html;
    let internalElement;

    let getComputedStyle;
    let bodyLayerElement;
    let videoLayerElement;

    const elementExists = (root, selector) => {
      const elOrNull = root.querySelector(selector);
      expect(elOrNull, selector).to.be.ok;
      return elOrNull;
    };

    beforeEach(() => {
      html = htmlFor(env.win.document);
      video = createVideo();
      internalElement = html`<video></video>`;

      video.element.appendChild(internalElement);

      sandbox.stub(env.win, 'requestAnimationFrame').callsArg(0);

      getComputedStyle = el => env.win.getComputedStyle(el);

      bodyLayerElement = s => elementExists(env.win.document.body, s);
      videoLayerElement = s => elementExists(video.element, s);
    });

    it('delegates controls positioning', function* () {
      const {positionOnVsync} = stubControls();

      const x = 0;
      const y = 0;
      const scale = 0;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(positionOnVsync).to.have.been.calledOnce;
    });

    it('reparents placeholder', function* () {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(videoLayerElement(
          '.amp-video-docked-placeholder-background')).to.be.ok;
    });

    it('fills component area with placeholder elemenets', function* () {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(video.applyFillContent.withArgs(videoLayerElement(
          '.amp-video-docked-placeholder-background')))
          .to.have.been.calledOnce;

      expect(video.applyFillContent.withArgs(videoLayerElement(
          '.amp-video-docked-placeholder-background-poster')))
          .to.have.been.calledOnce;
    });

    it('styles and transforms elements into docked area', function* () {
      const {overlay} = stubControls();

      enableComputedStyle(video.element);
      enableComputedStyle(overlay);

      const width = 400;
      const height = 300;

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 200;

      placeElementLtwh(video, 0, 0, width, height);

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      const shadow = bodyLayerElement('.amp-video-docked-shadow');

      // This may output differently in browsers.
      // TODO(alanorozco): Compare against the output of a statically defined
      // transform on a dummy element.
      const transformMatrix = `matrix(${[
        scale, 0, 0, scale, x, y,
      ].join(', ')})`;

      [
        internalElement,
        overlay,
        shadow,
      ].forEach(el => {
        expect(getComputedStyle(el)['transform']).to.equal(transformMatrix);
        expect(getComputedStyle(el)['width']).to.equal(width + 'px');
        expect(getComputedStyle(el)['min-width']).to.equal(width + 'px');
        expect(getComputedStyle(el)['height']).to.equal(height + 'px');
        expect(getComputedStyle(el)['min-height']).to.equal(height + 'px');
      });
    });

    it('sets poster image', function* () {
      const posterSrc = 'https://whatever.com/image.png';

      stubControls();
      enableComputedStyle(video.element);

      sandbox.stub(docking, 'getPosterImageSrc_').returns(posterSrc);

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      const poster = videoLayerElement(
          '.amp-video-docked-placeholder-background-poster');

      expect(getComputedStyle(poster)['backgroundImage'])
          .to.equal(`url("${posterSrc}")`);
    });

    for (let step = 0; step <= 1; step = Number((step + 0.1).toFixed(1))) {

      it(`sets opacity = step @ step = ${step}`, function* () {
        stubControls();
        enableComputedStyle(video.element);

        const x = 30;
        const y = 60;
        const scale = 0.5;
        const transitionDurationMs = 0;

        yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

        const shadow = bodyLayerElement('.amp-video-docked-shadow');
        const placeholder = videoLayerElement(
            '.amp-video-docked-placeholder-background');

        expect(Number(getComputedStyle(shadow)['opacity'])).to.equal(step);
        expect(Number(getComputedStyle(placeholder)['opacity'])).to.equal(step);
      });
    }

    it('overrides overflow to render outside of component area', function* () {
      stubControls();
      enableComputedStyle(video.element);

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(getComputedStyle(video.element)['overflow']).to.equal('visible');
    });

    it('applies classname on internal element', function* () {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(internalElement).to.have.class(BASE_CLASS_NAME);
    });

    [
      {step: 0, fn: 'ease-in'},
      {step: 1, fn: 'ease-out'},
    ].forEach(({step, fn}) => {

      it(`sets transition timing on elements for step = ${step}`, function* () {
        const {overlay} = stubControls();

        enableComputedStyle(video.element);
        enableComputedStyle(overlay);

        const x = 30;
        const y = 60;
        const scale = 0.5;

        const durationMs = 260;
        const durationSecondsStr = '0.26s';

        yield docking.placeAt_(video, x, y, scale, step, durationMs);

        [
          internalElement,
          overlay,
          videoLayerElement('.amp-video-docked-placeholder-background'),
          videoLayerElement('.amp-video-docked-placeholder-icon'),
          bodyLayerElement('.amp-video-docked-shadow'),
        ].forEach(el => {
          const style = getComputedStyle(el);

          expect(style['transitionDuration']).to.equal(durationSecondsStr);
          expect(style['transitionTimingFunction']).to.equal(fn);
        });
      });

    });

    PLACEHOLDER_ICON_BREAKPOINTS.forEach(({minWidth, className}) => {
      const width = Math.max(200, minWidth);

      it(`sets ${className} on icon @ ${width}px wide`, function* () {
        stubControls();

        const x = 30;
        const y = 60;
        const scale = 0.5;
        const step = 1;
        const transitionDurationMs = 0;

        placeElementLtwh(video, 0, 0, width, 200);

        yield docking.placeAt_(video, x, y, scale, step, transitionDurationMs,
            // Expecting relative placement to apply icon styling but direction
            // is irrelevant in this case.
            RelativeX.RIGHT);

        expect(videoLayerElement('.amp-video-docked-placeholder-icon'))
            .to.have.class(className);
      });
    });

    [{
      relativeX: RelativeX.RIGHT,
      relativeXTextual: 'right',
      placeholderIconHasAmpRtl: false,
    },
    {
      relativeX: RelativeX.LEFT,
      relativeXTextual: 'left',
      placeholderIconHasAmpRtl: true,
    }].forEach(({
      relativeX,
      relativeXTextual,
      placeholderIconHasAmpRtl,
    }) => {
      const setsOrUnsets = placeholderIconHasAmpRtl ? 'sets' : 'unsets';

      it(`${setsOrUnsets} RTL classname on icon transitioning to ${
        relativeXTextual
      }`, function* () {
        stubControls();
        enableComputedStyle(video.element);

        const x = 30;
        const y = 60;
        const scale = 0.5;
        const step = 1;
        const transitionDurationMs = 0;

        yield docking.placeAt_(
            video, x, y, scale, step, transitionDurationMs, relativeX);

        expect(
            videoLayerElement('.amp-video-docked-placeholder-icon')
                .classList.contains('amp-rtl'))
            .to.equal(placeholderIconHasAmpRtl);
      });

    });

  });

  describe('getPosterImageSrc_', () => {

    let html;
    beforeEach(() => {
      html = htmlFor(env.win.document);
    });

    it('uses `poster` attr', () => {
      const el = html`<amp-video poster=foo.png></amp-video>`;
      expect(docking.getPosterImageSrc_(el)).to.equal('foo.png');
    });

    it('uses `placeholder` amp-img', () => {
      const el = html`<amp-video>
          <amp-img src=foo.png placeholder></amp-img>
        </amp-video>`;

      expect(docking.getPosterImageSrc_(el)).to.equal('foo.png');
    });

    it('uses amp-img in a `placeholder`', () => {
      const el = html`<amp-video>
          <div placeholder>
            <amp-img src=foo.png></amp-img>
          </div>
        </amp-video>`;

      expect(docking.getPosterImageSrc_(el)).to.equal('foo.png');
    });

    it('uses `placeholder` img', () => {
      const el = html`<amp-video>
          <img src=foo.png placeholder>
        </amp-video>`;

      expect(docking.getPosterImageSrc_(el)).to.equal('foo.png');
    });

  });

  describe('dockInTransferLayerStep_', () => {

    // Something weird causing this to flake in certain leftover states.
    // TODO(alanorozco): Unskip.
    it.skip('should not overflow', function* () {
      const video = {};
      const target = {};

      const dock = sandbox.stub(docking, 'dock_').returns(Promise.resolve());

      yield docking.dockInTransferLayerStep_(video, target);

      expect(dock).to.have.been.called;
    });

  });

  describe('getTargetArea_', () => {

    it('delegates for slot', () => {
      const fromPos = sandbox.stub(docking, 'getTargetAreaFromPos_')
          .returns('foo');

      const fromSlot = sandbox.stub(docking, 'getTargetAreaFromSlot_')
          .returns('bar');

      const video = {};
      const target = {nodeType: /* ELEMENT */ 1};

      expect(docking.getTargetArea_(video, target)).to.equal('bar');

      expect(fromPos).to.not.have.been.called;
      expect(fromSlot.withArgs(video, target)).to.have.been.calledOnce;
    });

    it('delegates for corner', () => {
      const fromPos = sandbox.stub(docking, 'getTargetAreaFromPos_')
          .returns('foo');

      const fromSlot = sandbox.stub(docking, 'getTargetAreaFromSlot_')
          .returns('bar');

      const posX = RelativeX.LEFT;
      const posY = RelativeY.BOTTOM;

      const video = {};
      const target = {posX, posY};

      expect(docking.getTargetArea_(video, target)).to.equal('foo');

      expect(fromPos.withArgs(video, posX, posY)).to.have.been.calledOnce;
      expect(fromSlot).to.not.have.been.called;
    });

  });

  describe('getTargetAreaFromPos_', () => {

    [{
      posX: RelativeX.RIGHT,
      posXTextual: 'right',
      expectedXFn: (vw, margin, width) => vw - margin - width,
    }, {
      posX: RelativeX.LEFT,
      posXTextual: 'left',
      expectedXFn: (unusedVw, margin, unusedWidth) => margin,
    }].forEach(({posX, posXTextual, expectedXFn}) => {

      it(`sets relative margin for posX = ${posXTextual}`, () => {
        const video = createVideo();

        const vw = mockAreaWidth(
            Math.max(MIN_WIDTH / DOCKED_TO_CORNER_SIZING_RATIO));

        mockAreaHeight(200);

        const videoWidth = 600;
        const videoHeight = 400;

        const aspectRatio = videoWidth / videoHeight;

        const expectedMargin = MARGIN_AREA_WIDTH_PERC * vw;
        const expectedY = expectedMargin;
        const expectedWidth = vw * DOCKED_TO_CORNER_SIZING_RATIO;
        const expectedHeight = expectedWidth / aspectRatio;

        placeElementLtwh(video, 0, 0, videoWidth, videoHeight);

        const expectedX = expectedXFn(vw, expectedMargin, expectedWidth);

        const {x, y, width, height} =
            docking.getTargetAreaFromPos_(video, posX, RelativeY.TOP);

        expect(x, 'x').to.equal(expectedX);
        expect(y, 'y').to.equal(expectedY);
        expect(width, 'width').to.equal(expectedWidth);
        expect(height, 'height').to.equal(expectedHeight);
      });

      it(`limits margin for posX = ${posXTextual}`, () => {
        const video = createVideo();

        const vw = mockAreaWidth(10000);

        mockAreaHeight(8000);

        const videoWidth = 600;
        const videoHeight = 400;

        const aspectRatio = videoWidth / videoHeight;

        const expectedMargin = MARGIN_MAX;
        const expectedY = expectedMargin;
        const expectedWidth = vw * DOCKED_TO_CORNER_SIZING_RATIO;
        const expectedHeight = expectedWidth / aspectRatio;

        placeElementLtwh(video, 0, 0, videoWidth, videoHeight);

        const expectedX = expectedXFn(vw, expectedMargin, expectedWidth);

        const {x, y, width, height} =
            docking.getTargetAreaFromPos_(video, posX, RelativeY.TOP);

        expect(x, 'x').to.equal(expectedX);
        expect(y, 'y').to.equal(expectedY);
        expect(width, 'width').to.equal(expectedWidth);
        expect(height, 'height').to.equal(expectedHeight);
      });

    });

  });

  describe('getTargetAreaFromSlot_', () => {

    it('returns valid dimensions for same aspect ratio as component', () => {
      const video = createVideo();
      const slot = createAmpElementMock('amp-layout');

      const slotWidth = 300;
      const slotHeight = 300;

      const slotX = 10;
      const slotY = 10;

      placeElementLtwh(slot, slotX, slotY, slotWidth, slotHeight);

      const videoWidth = 200;
      const videoHeight = 200;

      placeElementLtwh(video, 0, 0, videoWidth, videoHeight);

      const scrollTop = 500;

      const expectedScale = slotWidth / videoWidth;

      const expectedX = slotX;
      const expectedY = slotY - scrollTop;

      sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {x, y, width, height} =
          docking.getTargetAreaFromSlot_(video, slot.element);

      expect(x, 'x').to.equal(expectedX);
      expect(y, 'y').to.equal(expectedY);
      expect(width, 'width').to.equal(videoWidth * expectedScale);
      expect(height, 'height').to.equal(videoHeight * expectedScale);
    });

    it('returns valid dimensions for a slot wider than component', () => {
      const video = createVideo();
      const slot = createAmpElementMock('amp-layout');

      const slotWidth = 400;
      const slotHeight = 300;

      const slotX = 10;
      const slotY = 10;

      placeElementLtwh(slot, slotX, slotY, slotWidth, slotHeight);

      const videoWidth = 200;
      const videoHeight = 200;

      placeElementLtwh(video, 0, 0, videoWidth, videoHeight);

      const scrollTop = 500;

      const expectedScale = slotHeight / videoHeight;

      const expectedX =
          // Center
          slotX + (slotWidth / 2) +

          // Offset center by width delta
          -(videoWidth * expectedScale / 2);

      const expectedY = slotY - scrollTop;

      sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {x, y, width, height} =
          docking.getTargetAreaFromSlot_(video, slot.element);

      expect(x, 'x').to.equal(expectedX);
      expect(y, 'y').to.equal(expectedY);
      expect(width, 'width').to.equal(videoWidth * expectedScale);
      expect(height, 'height').to.equal(videoHeight * expectedScale);
    });

    it('returns valid dimensions for a slot taller than component', () => {
      const video = createVideo();
      const slot = createAmpElementMock('amp-layout');

      const slotWidth = 300;
      const slotHeight = 400;

      const slotX = 10;
      const slotY = 10;

      placeElementLtwh(slot, slotX, slotY, slotWidth, slotHeight);

      const videoWidth = 200;
      const videoHeight = 200;

      placeElementLtwh(video, 0, 0, videoWidth, videoHeight);

      const scrollTop = 500;

      const expectedScale = slotWidth / videoWidth;

      const expectedY =
          // Center
          (slotY - scrollTop) + (slotHeight / 2) +

          // Offset center by height delta
          -(videoHeight * expectedScale / 2);

      const expectedX = slotX;

      sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {x, y, width, height} =
          docking.getTargetAreaFromSlot_(video, slot.element);

      expect(x, 'x').to.equal(expectedX);
      expect(y, 'y').to.equal(expectedY);
      expect(width, 'width').to.equal(videoWidth * expectedScale);
      expect(height, 'height').to.equal(videoHeight * expectedScale);
    });
  });

  describe('getDims_', () => {

    let video;

    const scrollTop = 5;

    const videoX = 10;
    const videoY = 10;

    const videoWidth = 500;
    const videoHeight = 300;

    const targetX = 50;
    const targetY = 20;
    const targetWidth = 440;
    const targetHeight = 264;

    const target = {};

    let targetAreaStub;

    beforeEach(() => {
      video = createVideo();
      placeElementLtwh(video, videoX, videoY, videoWidth, videoHeight);

      targetAreaStub = sandbox.stub(docking, 'getTargetArea_');

      targetAreaStub
          .returns(layoutRectLtwh(targetX, targetY, targetWidth, targetHeight));

      sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);
    });

    it('returns starting position for step = 0', () => {
      const step = 0;
      const {x, y, scale} = docking.getDims_(video, target, step);

      expect(x, 'x').to.equal(videoX);
      expect(y, 'y').to.equal(videoY - scrollTop);
      expect(scale, 'scale').to.equal(1);
    });

    it('returns final position for step = 1', () => {
      const step = 1;
      const {x, y, scale} = docking.getDims_(video, target, step);

      expect(x, 'x').to.equal(targetX);
      expect(y, 'y').to.equal(targetY);
      expect(scale, 'scale').to.equal(targetWidth / videoWidth);
    });

    it('returns relativeX=RIGHT when target placed right of component', () => {
      const videoX = 0;
      const targetX = 10;
      const step = 1;

      placeElementLtwh(video, videoX, videoY, videoWidth, videoHeight);

      targetAreaStub
          .returns(layoutRectLtwh(targetX, targetY, targetWidth, targetHeight));

      expect(docking.getDims_(video, target, step).relativeX)
          .to.equal(RelativeX.RIGHT);
    });

    it('returns relativeX=LEFT when target placed left of component', () => {
      const videoX = 10;
      const targetX = 0;
      const step = 1;

      placeElementLtwh(video, videoX, videoY, videoWidth, videoHeight);

      targetAreaStub
          .returns(layoutRectLtwh(targetX, targetY, targetWidth, targetHeight));

      expect(docking.getDims_(video, target, step).relativeX)
          .to.equal(RelativeX.LEFT);
    });

  });

  describe('undock_', () => {

    let video;
    let trigger;
    let resetOnUndock;
    let placeAt;
    let maybeUpdateStaleYAfterScroll;

    const targetDims = {x: 20, y: 10, scale: 0.5, relativeX: RelativeX.RIGHT};

    beforeEach(() => {
      video = createVideo();

      placeElementLtwh(video, 0, 0, 400, 300, /* ratio */ 1);

      trigger = sandbox.stub(docking, 'trigger_');
      resetOnUndock = sandbox.stub(docking, 'resetOnUndock_');
      maybeUpdateStaleYAfterScroll = sandbox.stub(docking,
          'maybeUpdateStaleYAfterScroll_').returns(Promise.resolve());

      placeAt = sandbox.stub(docking, 'placeAt_').returns(Promise.resolve());

      docking.currentlyDocked_ = {target: 'foo'};

      sandbox.stub(docking, 'getDims_')
          .withArgs(video, docking.currentlyDocked_.target, /* step */ 0)
          .returns(targetDims);
    });

    it('triggers action', function* () {
      stubControls();

      yield docking.undock_(video);

      expect(trigger.withArgs(Actions.UNDOCK)).to.have.been.calledOnce;
    });

    it('updates stale Y after undock', function* () {
      const {promise, resolve} = new Deferred();

      placeAt.returns(promise);

      const done = docking.undock_(video);

      expect(maybeUpdateStaleYAfterScroll.withArgs(video))
          .to.not.have.been.called;

      resolve();

      yield done;

      expect(maybeUpdateStaleYAfterScroll.withArgs(video))
          .to.have.been.calledOnce;
    });

    it('resets after undock', function* () {
      const {promise, resolve} = new Deferred();

      placeAt.returns(promise);

      const done = docking.undock_(video);

      expect(resetOnUndock.withArgs(video))
          .to.not.have.been.called;

      resolve();

      yield done;

      expect(resetOnUndock.withArgs(video))
          .to.have.been.calledOnce;
    });

    it('hides and disables docked controls', function* () {
      const {hide, disable} = stubControls();

      yield docking.undock_(video);

      expect(hide).to.have.been.calledOnce;
      expect(disable).to.have.been.calledOnce;
    });

    it('places element at the result of getDims_', function* () {
      stubControls();

      yield docking.undock_(video);

      const {x, y, scale, relativeX} = targetDims;

      expect(placeAt.withArgs(
          video, x, y, scale, /* step */ 0, /* durationMs */ sinon.match.any,
          relativeX))
          .to.have.been.calledOnce;
    });

  });

  describes.repeated('', {
    'Minimize to corner': {
      useSlot: false,
      topBoundary: 0,
    },
    'Minimize to slot element': {
      useSlot: true,
      topBoundary: 20,
    },
  }, (name, {useSlot, topBoundary}) => {

    const targetType = useSlot ? 'slot element' : 'corner';
    const skipForSlot = useSlot ? it.skip : it;

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

    beforeEach(() => {
      if (useSlot) {
        slotAttr = `#${slotId}`;
      }
    });

    it(`should use a ${targetType} as target`, () => {
      maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

      const video = createVideo();

      const videoWidth = 400;
      const videoHeight = 300;

      placeElementLtwh(video, 0, -200, videoWidth, videoHeight);

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

      placeElementLtwh(video, 0, -200, videoWidth, videoHeight);

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

      placeElementLtwh(video, 0, -400, videoWidth, videoHeight);

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

      placeElementLtwh(video, 0, -100, 0, 0);

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

      placeElementLtwh(video, 0, 0, 0, 0);

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
      setValidAreaHeight(videoHeight * 2);

      placeElementLtwh(
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
      placeElementLtwh(video, 0, topBoundary + 1, videoWidth, videoHeight);

      docking.updateOnPositionChange_(video);

      expect(dock).to.not.have.been.called;
    });
  });
});
