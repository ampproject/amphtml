import {Deferred, tryResolve} from '#core/data-structures/promise';
import {createElementWithAttributes} from '#core/dom';
import {layoutRectLtwh} from '#core/dom/layout/rect';
import {htmlFor} from '#core/dom/static-template';

import {Services} from '#service';

import {PlayingStates_Enum} from '../../../../src/video-interface';
import {
  Actions,
  BASE_CLASS_NAME,
  DockTargetType,
  PLACEHOLDER_ICON_BREAKPOINTS,
  PLACEHOLDER_ICON_LARGE_MARGIN,
  PLACEHOLDER_ICON_LARGE_WIDTH,
  PLACEHOLDER_ICON_SMALL_MARGIN,
  PLACEHOLDER_ICON_SMALL_WIDTH,
  REVERT_TO_INLINE_RATIO,
  VideoDocking,
  getPosterImageSrc,
} from '../amp-video-docking';
import {DirectionX, DirectionY} from '../def';

const slotId = 'my-slot-element';

describes.realWin('video docking', {amp: true}, (env) => {
  let ampdoc;
  let manager;
  let viewport;
  let docking;
  let querySelectorStub;
  let any;
  let slotAttr = '';

  const viewportSize = {width: 0, height: 0};

  function createAmpElementMock(tag = 'div', attrs = {}) {
    const element = createElementWithAttributes(env.win.document, tag, attrs);
    const defaultLayoutRect = layoutRectLtwh(0, 0, 0, 0);
    const impl = {
      element,
      mutateElement: (cb) => tryResolve(cb),
    };
    stubLayoutBox(impl, defaultLayoutRect);
    return impl;
  }

  function createVideo() {
    const video = createAmpElementMock();

    video.element.setAttribute('dock', slotAttr);

    // VideoDocking.querySlot_() expects this guy:
    querySelectorStub.withArgs('[dock]').returns(video.element);

    // VideoDocking.querySlot_() expects the VideoEvents_Enum.REGISTERED signal.
    // This is normally set by virtue of the Video service, which is not
    // tested here.
    video.signals = () => ({
      get: () => true,
    });

    video.element.signals = video.signals;

    video.pause = env.sandbox.spy();
    video.showControls = env.sandbox.spy();
    video.hideControls = env.sandbox.spy();

    return video;
  }

  function stubLayoutBox(impl, rect) {
    let stub = impl.element.__stubBoundingClientRect;
    if (!stub) {
      stub = impl.element.__stubBoundingClientRect = env.sandbox.stub(
        impl.element,
        'getBoundingClientRect'
      );
    }
    stub.returns(rect);
  }

  function setValidAreaWidth() {
    return mockAreaWidth(400);
  }

  function mockInvalidAreaWidth() {
    const min = 320;
    return mockAreaWidth(min - 1);
  }

  function mockAreaWidth(width) {
    viewportSize.width = width;
    return width;
  }

  function setValidAreaHeight(videoHeight = 400) {
    return mockAreaHeight(videoHeight * REVERT_TO_INLINE_RATIO);
  }

  function mockAreaHeight(height) {
    viewportSize.height = height;
    return height;
  }

  function placeElementLtwh(ampEl, left, top, width, height) {
    stubLayoutBox(ampEl, layoutRectLtwh(left, top, width, height));
  }

  function placeRatio(ampEl, width, height, ratio) {
    const visibleHeight = ratio * height;
    placeElementLtwh(ampEl, 0, visibleHeight - height, width, height);
    mockAreaHeight(height);
  }

  function setScrollDirection(direction) {
    docking.scrollDirection_ = direction;
  }

  function stubDockInTransferLayerStep() {
    return env.sandbox.stub(docking, 'dockInTransferLayerStep_');
  }

  function enableComputedStyle(el) {
    env.win.document.body.appendChild(el);
  }

  function stubControls() {
    const controls = {
      positionOnVsync: env.sandbox.spy(),
      enable: env.sandbox.spy(),
      disable: env.sandbox.spy(),
      hide: env.sandbox.spy(),
      setVideo: env.sandbox.spy(),
      overlay: env.win.document.createElement('div'),
      container: env.win.document.createElement('div'),
    };

    env.sandbox.stub(docking, 'getControls_').returns(controls);

    return controls;
  }

  // This may output differently depending on browser
  // TODO(alanorozco): Compare against the output of a statically defined
  // transform on a dummy element.
  const transformMatrix = (x, y, scale) =>
    `matrix(${[scale, 0, 0, scale, x, y].join(', ')})`;

  beforeEach(() => {
    ampdoc = env.ampdoc;
    any = env.sandbox.match.any;
    querySelectorStub = env.sandbox.stub(ampdoc.getRootNode(), 'querySelector');

    manager = {
      getPlayingState() {
        return PlayingStates_Enum.PLAYING_MANUAL;
      },
      isMuted() {
        return false;
      },
    };

    viewport = {
      getScrollTop: () => 0,
      getSize: () => viewportSize,
      animateScrollIntoView: env.sandbox.spy(),
    };

    env.sandbox.stub(Services, 'viewportForDoc').returns(viewport);
    env.sandbox.stub(Services, 'videoManagerForDoc').returns(manager);

    docking = new VideoDocking(ampdoc);

    env.sandbox.stub(docking, 'getTimer_').returns({
      promise: () => Promise.resolve(),
    });
  });

  afterEach(() => {
    viewportSize.width = 0;
    viewportSize.height = 0;
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
      internalElement = html` <video></video> `;

      video.element.appendChild(internalElement);

      env.sandbox.stub(env.win, 'requestAnimationFrame').callsArg(0);

      getComputedStyle = (el) => env.win.getComputedStyle(el);

      bodyLayerElement = (s) => elementExists(env.win.document.body, s);
      videoLayerElement = (s) => elementExists(video.element, s);
    });

    it('delegates controls positioning', async () => {
      const {positionOnVsync} = stubControls();

      const x = 0;
      const y = 0;
      const scale = 0;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(positionOnVsync).to.have.been.calledOnce;
    });

    it('reparents placeholder', async () => {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(videoLayerElement('.amp-video-docked-placeholder-background')).to
        .be.ok;
    });

    it('fills component area with placeholder elemenets', async () => {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(
        videoLayerElement('.amp-video-docked-placeholder-background')
      ).to.have.class('i-amphtml-fill-content');

      expect(
        videoLayerElement('.amp-video-docked-placeholder-background-poster')
      ).to.have.class('i-amphtml-fill-content');
    });

    it('styles and transforms elements into docked area', async () => {
      const {overlay} = stubControls();

      enableComputedStyle(video.element);
      enableComputedStyle(overlay);

      const expectedWidth = 400;
      const expectedHeight = 300;

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 200;

      placeElementLtwh(video, 0, 0, expectedWidth, expectedHeight);

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      const shadow = bodyLayerElement('.amp-video-docked-shadow');

      const expectedTransform = transformMatrix(x, y, scale);

      [internalElement, overlay, shadow].forEach((el) => {
        const {height, minHeight, minWidth, transform, width} =
          getComputedStyle(el);
        expect(transform).to.equal(expectedTransform);
        expect(width).to.equal(expectedWidth + 'px');
        expect(minWidth).to.equal(expectedWidth + 'px');
        expect(height).to.equal(expectedHeight + 'px');
        expect(minHeight).to.equal(expectedHeight + 'px');
      });
    });

    it('sets poster image', async () => {
      const posterSrc = 'https://whatever.com/image.png';

      stubControls();
      enableComputedStyle(video.element);

      video.element.setAttribute('poster', posterSrc);

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      const poster = videoLayerElement(
        '.amp-video-docked-placeholder-background-poster'
      );

      expect(getComputedStyle(poster)['backgroundImage']).to.equal(
        `url("${posterSrc}")`
      );
    });

    for (let step = 0; step <= 1; step = Number((step + 0.1).toFixed(1))) {
      it(`sets opacity = step @ step = ${step}`, async () => {
        stubControls();
        enableComputedStyle(video.element);

        const x = 30;
        const y = 60;
        const scale = 0.5;
        const transitionDurationMs = 0;

        await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

        const shadow = bodyLayerElement('.amp-video-docked-shadow');
        const placeholder = videoLayerElement(
          '.amp-video-docked-placeholder-background'
        );

        expect(Number(getComputedStyle(shadow)['opacity'])).to.equal(step);
        expect(Number(getComputedStyle(placeholder)['opacity'])).to.equal(step);
      });
    }

    it('overrides overflow to render outside of component area', async () => {
      stubControls();
      enableComputedStyle(video.element);

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(getComputedStyle(video.element)['overflow']).to.equal('visible');
    });

    it('applies classname on internal element', async () => {
      stubControls();

      const x = 30;
      const y = 60;
      const scale = 0.5;
      const step = 1;
      const transitionDurationMs = 0;

      await docking.placeAt_(video, x, y, scale, step, transitionDurationMs);

      expect(internalElement).to.have.class(BASE_CLASS_NAME);
    });

    [
      {step: 0, fn: 'ease-in'},
      {step: 1, fn: 'ease-out'},
    ].forEach(({fn, step}) => {
      it(`sets transition timing on elements for step = ${step}`, async () => {
        const {overlay} = stubControls();

        enableComputedStyle(video.element);
        enableComputedStyle(overlay);

        const x = 30;
        const y = 60;
        const scale = 0.5;

        const durationMs = 260;
        const durationSecondsStr = '0.26s';

        await docking.placeAt_(video, x, y, scale, step, durationMs);

        [
          internalElement,
          overlay,
          videoLayerElement('.amp-video-docked-placeholder-background'),
          videoLayerElement('.amp-video-docked-placeholder-icon'),
          bodyLayerElement('.amp-video-docked-shadow'),
        ].forEach((el) => {
          const style = getComputedStyle(el);

          expect(style['transitionDuration']).to.equal(durationSecondsStr);
          expect(style['transitionTimingFunction']).to.equal(fn);
        });
      });
    });

    PLACEHOLDER_ICON_BREAKPOINTS.forEach(({className, minWidth}) => {
      const width = Math.max(200, minWidth);

      const iconMargin =
        className == 'amp-small'
          ? PLACEHOLDER_ICON_SMALL_MARGIN
          : PLACEHOLDER_ICON_LARGE_MARGIN;

      const iconWidth =
        className == 'amp-small'
          ? PLACEHOLDER_ICON_SMALL_WIDTH
          : PLACEHOLDER_ICON_LARGE_WIDTH;

      const step = 1;

      it(`sets ${className} on icon @ ${width}px wide`, async () => {
        stubControls();

        const x = 30;
        const y = 60;
        const scale = 0.5;
        const transitionDurationMs = 0;

        placeElementLtwh(video, 0, 0, width, 200);

        await docking.placeAt_(
          video,
          x,
          y,
          scale,
          step,
          transitionDurationMs,
          // Expecting relative placement to apply icon styling but direction
          // is irrelevant in this case.
          DirectionX.RIGHT
        );

        expect(
          videoLayerElement('.amp-video-docked-placeholder-icon')
        ).to.have.class(className);
      });

      [
        {
          relativeX: DirectionX.RIGHT,
          relativeXTextual: 'right',
          expectedIconX: width - iconWidth - iconMargin * 2,
        },
        {
          relativeX: DirectionX.LEFT,
          relativeXTextual: 'left',
          expectedIconX: -width + iconWidth + iconMargin * 2,
        },
      ].forEach(({expectedIconX, relativeX, relativeXTextual}) => {
        it(`translates placeholder icon horizontally for posX=${relativeXTextual} in threshold for .${className}`, async () => {
          stubControls();
          enableComputedStyle(video.element);

          const expectedTransformMatrix = transformMatrix(
            expectedIconX,
            /* y */ 0,
            /* scale */ 1
          );

          const x = 30;
          const y = 60;
          const scale = 0.5;
          const transitionDurationMs = 0;

          placeElementLtwh(video, 0, 0, width, 200);

          await docking.placeAt_(
            video,
            x,
            y,
            scale,
            step,
            transitionDurationMs,
            relativeX
          );

          const computedStyle = getComputedStyle(
            videoLayerElement('.amp-video-docked-placeholder-icon')
          );

          expect(computedStyle['transform']).to.equal(expectedTransformMatrix);
        });
      });

      it('sets position', async () => {
        stubControls();
        enableComputedStyle(video.element);

        const offsetLeft = 12;
        const offsetTop = 24;

        placeElementLtwh(video, offsetLeft, offsetTop, width, 200);

        await docking.placeAt_(
          video,
          /* x */ 52,
          /* y */ 10,
          /* scale */ 0.5,
          /* step */ 0,
          /* transitionDurationMs */ 300,
          DirectionX.RIGHT,
          /* opt_clientRect */ undefined,
          'sticky'
        );

        const computedStyle = getComputedStyle(internalElement);
        expect(computedStyle['position']).to.equal('sticky');
      });

      it('offsets position: absolute elements', async () => {
        stubControls();
        enableComputedStyle(video.element);

        const offsetLeft = 12;
        const offsetTop = 24;

        placeElementLtwh(video, offsetLeft, offsetTop, width, 200);

        await docking.placeAt_(
          video,
          /* x */ 52,
          /* y */ 10,
          /* scale */ 0.5,
          /* step */ 0,
          /* transitionDurationMs */ 300,
          DirectionX.RIGHT,
          /* opt_clientRect */ undefined,
          'absolute'
        );

        const computedStyle = getComputedStyle(internalElement);
        expect(computedStyle['position']).to.equal('absolute');
        expect(computedStyle['left']).to.equal(`${-offsetLeft}px`);
        expect(computedStyle['top']).to.equal(`${-offsetTop}px`);
      });

      it('does not offset position: fixed elements', async () => {
        stubControls();
        enableComputedStyle(video.element);

        const offsetLeft = 12;
        const offsetTop = 24;

        placeElementLtwh(video, offsetLeft, offsetTop, width, 200);

        await docking.placeAt_(
          video,
          /* x */ 52,
          /* y */ 10,
          /* scale */ 0.5,
          /* step */ 0,
          /* transitionDurationMs */ 300,
          DirectionX.RIGHT,
          /* opt_clientRect */ undefined,
          'fixed'
        );

        const computedStyle = getComputedStyle(internalElement);
        expect(computedStyle['position']).to.equal('fixed');
        expect(computedStyle['left']).to.equal('0px');
        expect(computedStyle['top']).to.equal('0px');
      });
    });

    [
      {
        relativeX: DirectionX.RIGHT,
        directionTextual: 'left to right',
        hasAmpRtl: false,
      },
      {
        relativeX: DirectionX.LEFT,
        directionTextual: 'right to left',
        hasAmpRtl: true,
      },
    ].forEach(({directionTextual, hasAmpRtl, relativeX}) => {
      const setsOrUnsets = hasAmpRtl ? 'sets' : 'unsets';

      it(
        `${setsOrUnsets} amp-rtl classname on icon when docking from ` +
          directionTextual,
        async () => {
          stubControls();
          enableComputedStyle(video.element);

          await docking.placeAt_(
            video,
            /* x, irrelevant */ 30,
            /* y, irrelevant */ 60,
            /* scale, irrelevant */ 0.5,
            /* step, irrelevant */ 1,
            /* transitionDurationMs, irrelevant */ 0,
            relativeX
          );

          expect(
            videoLayerElement(
              '.amp-video-docked-placeholder-icon'
            ).classList.contains('amp-rtl')
          ).to.equal(hasAmpRtl);
        }
      );

      it(
        `${setsOrUnsets} amp-rtl classname on controls layer when docking ` +
          `from ${directionTextual}`,
        async () => {
          const controls = stubControls();
          enableComputedStyle(video.element);

          await docking.placeAt_(
            video,
            /* x, irrelevant */ 30,
            /* y, irrelevant */ 60,
            /* scale, irrelevant */ 0.5,
            /* step, irrelevant */ 1,
            /* transitionDurationMs, irrelevant */ 0,
            relativeX
          );

          expect(controls.container.classList.contains('amp-rtl')).to.equal(
            hasAmpRtl
          );
        }
      );
    });
  });

  describe('getPosterImageSrc', () => {
    let html;
    beforeEach(() => {
      html = htmlFor(env.win.document);
    });

    it('uses `poster` attr', () => {
      const el = html` <amp-video poster="foo.png"></amp-video> `;
      expect(getPosterImageSrc(el)).to.equal('foo.png');
    });

    it('uses `data-poster` attr', () => {
      const el = html` <amp-video data-poster="foo.png"></amp-video> `;
      expect(getPosterImageSrc(el)).to.equal('foo.png');
    });

    it('uses `placeholder` amp-img', () => {
      const el = html`
        <amp-video>
          <amp-img src="foo.png" placeholder></amp-img>
        </amp-video>
      `;

      expect(getPosterImageSrc(el)).to.equal('foo.png');
    });

    it('uses amp-img in a `placeholder`', () => {
      const el = html`
        <amp-video>
          <div placeholder>
            <amp-img src="foo.png"></amp-img>
          </div>
        </amp-video>
      `;

      expect(getPosterImageSrc(el)).to.equal('foo.png');
    });

    it('uses `placeholder` img', () => {
      const el = html`
        <amp-video>
          <img src="foo.png" placeholder />
        </amp-video>
      `;

      expect(getPosterImageSrc(el)).to.equal('foo.png');
    });
  });

  describe('dockInTransferLayerStep_', () => {
    it('should not overflow', async () => {
      const video = {};
      const target = {};

      const dock = env.sandbox
        .stub(docking, 'dock_')
        .returns(Promise.resolve());

      await docking.dockInTransferLayerStep_(video, target);

      expect(dock).to.have.been.called;
    });
  });

  describe.skip('getTargetAreaFromSlot_', () => {
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

      env.sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {height, width, x, y} = docking.getTargetAreaFromSlot_(
        video,
        slot.element
      );

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
        slotX +
        slotWidth / 2 +
        // Offset center by width delta
        -((videoWidth * expectedScale) / 2);

      const expectedY = slotY - scrollTop;

      env.sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {height, width, x, y} = docking.getTargetAreaFromSlot_(
        video,
        slot.element
      );

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
        slotY -
        scrollTop +
        slotHeight / 2 +
        // Offset center by height delta
        -((videoHeight * expectedScale) / 2);

      const expectedX = slotX;

      env.sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);

      const {height, width, x, y} = docking.getTargetAreaFromSlot_(
        video,
        slot.element
      );

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

    const target = {
      rect: layoutRectLtwh(targetX, targetY, targetWidth, targetHeight),
    };

    beforeEach(() => {
      video = createVideo();
      placeElementLtwh(video, videoX, videoY, videoWidth, videoHeight);

      env.sandbox.stub(docking.viewport_, 'getScrollTop').returns(scrollTop);
    });

    it('returns starting position for step = 0', () => {
      const step = 0;
      const {scale, x, y} = docking.getDims_(video, target, step);

      expect(x, 'x').to.equal(videoX);
      expect(y, 'y').to.equal(videoY);
      expect(scale, 'scale').to.equal(1);
    });

    it('returns final position for step = 1', () => {
      const step = 1;
      const {scale, x, y} = docking.getDims_(video, target, step);

      expect(x, 'x').to.equal(targetX);
      expect(y, 'y').to.equal(targetY);
      expect(scale, 'scale').to.equal(targetWidth / videoWidth);
    });

    [
      {
        expectedRelativeX: DirectionX.RIGHT,
        placementTextual: 'right',
        videoX: 0,
        targetX: 10,
      },
      {
        expectedRelativeX: DirectionX.LEFT,
        placementTextual: 'left',
        videoX: 10,
        targetX: 0,
      },
    ].forEach(({expectedRelativeX, placementTextual, targetX, videoX}) => {
      it(
        `returns relativeX=${placementTextual.toUpperCase()} when target ` +
          `placed ${placementTextual} of component`,
        () => {
          const step = 1;

          placeElementLtwh(video, videoX, videoY, videoWidth, videoHeight);

          target.rect = layoutRectLtwh(
            targetX,
            targetY,
            targetWidth,
            targetHeight
          );

          expect(docking.getDims_(video, target, step).relativeX).to.equal(
            expectedRelativeX
          );
        }
      );
    });
  });

  describe('dock_', () => {
    let video;
    let placeAt;
    let setCurrentlyDocked;

    const target = {};
    const step = 1;
    const targetDims = {x: 20, y: 10, scale: 0.5, relativeX: DirectionX.RIGHT};

    beforeEach(() => {
      video = createVideo();

      placeElementLtwh(video, 0, 0, 400, 300);

      setCurrentlyDocked = env.sandbox.stub(docking, 'setCurrentlyDocked_');
      placeAt = env.sandbox
        .stub(docking, 'placeAt_')
        .returns(Promise.resolve());

      env.sandbox.stub(docking, 'getDims_').returns(targetDims);
    });

    it('sets currently docked', async () => {
      stubControls();

      await docking.dock_(video, target, step);

      expect(setCurrentlyDocked.withArgs(video, target, step)).to.have.been
        .calledOnce;
    });

    it('places element at the result of getDims_', async () => {
      stubControls();

      await docking.dock_(video, target, step);

      const {relativeX, scale, x, y} = targetDims;

      expect(
        placeAt.withArgs(
          video,
          x,
          y,
          scale,
          step,
          /* durationMs */ any,
          relativeX
        )
      ).to.have.been.calledOnce;
    });

    it('hides component controls', async () => {
      await docking.dock_(video, target, step);

      expect(video.hideControls).to.have.been.calledOnce;
    });

    it('enables docked controls', async () => {
      const {enable} = stubControls();

      await docking.dock_(video, target, step);

      expect(enable).to.have.been.calledOnce;
    });

    it('does not enable docked controls if transferring layer', async () => {
      const {enable} = stubControls();

      await docking.dock_(
        video,
        target,
        step,
        /* clientRect */ undefined,
        /* isTransferLayerStep */ true
      );

      expect(enable).to.not.have.been.called;
    });
  });

  describe('setCurrentlyDocked_', () => {
    const video = {foo: 'bar'};
    const target = {rect: layoutRectLtwh(0, 0, 50, 50)};

    const step = 1;

    let trigger;

    beforeEach(() => {
      trigger = env.sandbox.stub(docking, 'trigger_');
    });

    it('triggers action', () => {
      stubControls();

      docking.setCurrentlyDocked_(video, target, step);

      expect(trigger.withArgs(Actions.DOCK)).to.have.been.calledOnce;
    });

    it('does not retrigger action', () => {
      stubControls();

      docking.setCurrentlyDocked_(video, target, step);
      docking.setCurrentlyDocked_(video, target, step);
      docking.setCurrentlyDocked_(video, target, step);

      expect(trigger.withArgs(Actions.DOCK)).to.have.been.calledOnce;
    });

    it('retriggers action when videos change', () => {
      stubControls();

      docking.setCurrentlyDocked_(video, target, step);
      docking.setCurrentlyDocked_({a: 'b'}, target, step);
      docking.setCurrentlyDocked_({c: 'd'}, target, step);

      expect(trigger.withArgs(Actions.DOCK)).to.have.been.calledThrice;
    });

    it('retriggers action when target rects change', () => {
      stubControls();

      const a = {rect: layoutRectLtwh(1, 0, 0, 0)};
      const b = {rect: layoutRectLtwh(2, 0, 0, 0)};
      const c = {rect: layoutRectLtwh(3, 0, 0, 0)};
      const d = {rect: layoutRectLtwh(4, 0, 0, 0)};

      docking.setCurrentlyDocked_(video, a, step);
      docking.setCurrentlyDocked_(video, b, step);
      docking.setCurrentlyDocked_(video, c, step);
      docking.setCurrentlyDocked_(video, d, step);
      docking.setCurrentlyDocked_(video, d, step);

      expect(trigger.withArgs(Actions.DOCK).callCount).to.equal(4);
    });

    it("updates controls' video reference", () => {
      const {setVideo} = stubControls();

      docking.setCurrentlyDocked_(video, target, step);

      expect(setVideo.withArgs(video, target.rect)).to.have.been.calledOnce;
    });
  });

  describe('undock_', () => {
    let video;
    let trigger;
    let resetOnUndock;
    let placeAt;

    const targetDims = {x: 20, y: 10, scale: 0.5, relativeX: DirectionX.RIGHT};

    beforeEach(() => {
      video = createVideo();

      placeElementLtwh(video, 0, 0, 400, 300);

      trigger = env.sandbox.stub(docking, 'trigger_');
      resetOnUndock = env.sandbox.stub(docking, 'resetOnUndock_');

      placeAt = env.sandbox
        .stub(docking, 'placeAt_')
        .returns(Promise.resolve());

      docking.currentlyDocked_ = {target: 'foo'};

      env.sandbox
        .stub(docking, 'getDims_')
        .withArgs(video, docking.currentlyDocked_.target, /* step */ 0)
        .returns(targetDims);
    });

    it('triggers action', async () => {
      stubControls();

      await docking.undock_(video);

      expect(trigger.withArgs(Actions.UNDOCK)).to.have.been.calledOnce;
    });

    it('sets position: absolute on undock', async () => {
      await docking.undock_(video);
      expect(
        placeAt.withArgs(
          video,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          env.sandbox.match.any,
          'absolute'
        )
      ).to.have.been.calledOnce;
    });

    it('resets after undock', async () => {
      const {promise, resolve} = new Deferred();

      placeAt.returns(promise);

      const done = docking.undock_(video);

      expect(resetOnUndock.withArgs(video)).to.not.have.been.called;

      resolve();

      await done;

      expect(resetOnUndock.withArgs(video)).to.have.been.calledOnce;
    });

    it('hides and disables docked controls', async () => {
      const {disable, hide} = stubControls();

      await docking.undock_(video);

      expect(hide).to.have.been.calledOnce;
      expect(disable).to.have.been.calledOnce;
    });

    it('places element at the result of getDims_', async () => {
      stubControls();

      await docking.undock_(video);

      const {relativeX, scale, x, y} = targetDims;

      expect(
        placeAt.withArgs(
          video,
          x,
          y,
          scale,
          /* step */ 0,
          /* durationMs */ any,
          relativeX
        )
      ).to.have.been.calledOnce;
    });

    const inlinePercVis = `${REVERT_TO_INLINE_RATIO * 100}% visible`;

    it(`pauses video when < ${inlinePercVis}`, async () => {
      placeRatio(video, 400, 400, REVERT_TO_INLINE_RATIO - 0.1);

      await docking.undock_(video);

      expect(video.pause).to.have.been.calledOnce;
    });

    it(`doesn't pause video when >= ${inlinePercVis}`, async () => {
      placeRatio(video, 400, 400, REVERT_TO_INLINE_RATIO);

      await docking.undock_(video);

      expect(video.pause).to.not.have.been.called;
    });

    describe('Chrome freeze when out-of-view workaround', () => {
      it(`shows component controls early when < ${inlinePercVis}`, () => {
        const {promise, resolve} = new Deferred();
        placeRatio(video, 400, 400, REVERT_TO_INLINE_RATIO - 0.1);

        placeAt.returns(promise);

        const done = docking.undock_(video);

        expect(video.showControls).to.have.been.calledOnce;

        resolve();

        return done;
      });

      it(`shows component controls late when >= ${inlinePercVis}`, () => {
        placeRatio(video, 400, 400, REVERT_TO_INLINE_RATIO);

        const {promise, resolve} = new Deferred();

        placeAt.returns(promise);

        const done = docking.undock_(video);

        expect(video.showControls).to.not.have.been.called;

        resolve();

        return done.then(() => {
          expect(video.showControls).to.have.been.calledOnce;
        });
      });

      it(`does not animate transition when < ${inlinePercVis}`, async () => {
        const expectedTransitionDurationMs = 0;

        placeElementLtwh(video, 0, 0, 400, 400, REVERT_TO_INLINE_RATIO - 0.1);

        await docking.undock_(video);

        expect(
          placeAt.withArgs(
            video,
            /* x */ any,
            /* y */ any,
            /* scale */ any,
            /* step */ any,
            expectedTransitionDurationMs
          )
        ).to.have.been.calledOnce;
      });

      it(`animates transition when >= ${inlinePercVis}`, async () => {
        const expectedTransitionDurationMs = 555;

        env.sandbox
          .stub(docking, 'calculateTransitionDuration_')
          .returns(expectedTransitionDurationMs);

        placeRatio(video, 400, 400, REVERT_TO_INLINE_RATIO);

        await docking.undock_(video);

        expect(
          placeAt.withArgs(
            video,
            /* x */ any,
            /* y */ any,
            /* scale */ any,
            /* step */ any,
            expectedTransitionDurationMs
          )
        ).to.have.been.calledOnce;
      });
    });
  });

  describe('scrollBack_', () => {
    beforeEach(() => {
      // Requests ampdoc when calling `setCurrentlyDocked_`. Node is detached
      // and we don't care about callee's side effects.
      env.sandbox.stub(docking, 'trigger_');
    });

    it('does not scroll when undocked', () => {
      docking.scrollBack_();

      expect(viewport.animateScrollIntoView).to.not.have.been.called;
    });

    it("scrolls back to video component's inline box when docked", () => {
      const video = createVideo();

      docking.setCurrentlyDocked_(
        video,
        /* target, irrelevant */ {},
        /* step, irrelevant */ 1
      );

      docking.scrollBack_();

      expect(viewport.animateScrollIntoView.withArgs(video.element, 'center'))
        .to.have.been.calledOnce;
    });
  });

  describe('onViewportResize_', () => {
    beforeEach(() => {
      env.sandbox.stub(docking, 'trigger_');
      env.sandbox.stub(docking, 'updateOnResize_');

      const video = createVideo();
      mockAreaWidth(400);

      docking.observed_.push(video);
      docking.setCurrentlyDocked_(
        video,
        /* target, irrelevant */ {},
        /* step, irrelevant */ 1
      );
    });
    it('updates dock on resize when docked and viewport width changed', () => {
      mockAreaWidth(399);
      docking.onViewportResize_();
      expect(docking.updateOnResize_.withArgs()).to.have.been.calledOnce;
    });

    it('does not update dock on resize when docked and viewport width did not change', () => {
      mockAreaWidth(400); // unchanged
      docking.onViewportResize_();
      expect(docking.updateOnResize_).not.to.have.been.called;
    });
  });

  describes.repeated(
    '',
    {
      'Minimize to corner': {
        useSlot: false,
        topBoundary: 0,
      },
      'Minimize to slot element': {
        useSlot: true,
        topBoundary: 20,
      },
    },
    (name, {topBoundary, useSlot}) => {
      const DocktargetType = useSlot ? 'slot element' : 'corner';

      function maybeCreateSlotElementLtwh(left, top, width, height) {
        if (!useSlot) {
          return;
        }
        const impl = createAmpElementMock('amp-layout', {
          id: slotId,
          layout: 'fill',
        });
        stubLayoutBox(impl, layoutRectLtwh(left, top, width, height));
        env.win.document.body.appendChild(impl.element);

        querySelectorStub.withArgs('#' + slotId).returns(impl.element);

        return impl.element;
      }

      beforeEach(() => {
        if (useSlot) {
          slotAttr = `#${slotId}`;
        }
      });

      describe('getTargetFor_', () => {
        it(`should use ${DocktargetType} as target type`, () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 150);

          const video = createVideo();

          const videoWidth = 400;
          const videoHeight = 300;

          placeElementLtwh(video, 0, -200, videoWidth, videoHeight);

          setScrollDirection(DirectionY.TOP);

          setValidAreaWidth();
          setValidAreaHeight(videoHeight);

          const target = docking.getTargetFor_(video);

          expect(target).to.not.be.null;
          expect(target.rect).to.not.be.null;

          if (useSlot) {
            expect(target.type).to.equal(DockTargetType.SLOT);
          } else {
            expect(target.type).to.equal(DockTargetType.CORNER);
            expect(target.directionX).to.not.be.undefined;
          }
        });
      });

      describe('updateOnPositionChange_', () => {
        it('should not dock if the viewport is too small', () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const video = createVideo();
          const dock = stubDockInTransferLayerStep();

          const videoWidth = 400;
          const videoHeight = 300;

          placeElementLtwh(video, 0, -200, videoWidth, videoHeight);

          setScrollDirection(DirectionY.TOP);

          mockInvalidAreaWidth();
          setValidAreaHeight(videoHeight);

          docking.updateOnPositionChange_(video);

          expect(dock).to.not.have.been.called;
        });

        it('should not dock if the video is portrait', () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const dock = stubDockInTransferLayerStep();
          const video = createVideo();

          const videoWidth = 300;
          const videoHeight = 400;

          setScrollDirection(DirectionY.TOP);

          setValidAreaWidth();
          setValidAreaHeight(videoHeight);

          placeElementLtwh(video, 0, -400, videoWidth, videoHeight);

          allowConsoleError(() => {
            // user().error() expected.
            docking.updateOnPositionChange_(video);
          });

          expect(dock).to.not.have.been.called;
        });

        it("doesn't dock when video's layout box is not sized", () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const video = createVideo();
          const dock = stubDockInTransferLayerStep();

          placeElementLtwh(video, 0, -100, 0, 0);

          setScrollDirection(DirectionY.TOP);

          setValidAreaWidth();
          setValidAreaHeight();

          docking.updateOnPositionChange_(video);

          expect(dock).to.not.have.been.called;
        });

        it('should not dock if another video is docked', () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const dock = stubDockInTransferLayerStep();
          const video = createVideo();

          setValidAreaWidth();

          placeElementLtwh(video, 0, 0, 0, 0);

          docking.currentlyDocked_ = {video: createVideo()};

          setScrollDirection(DirectionY.TOP);

          docking.updateOnPositionChange_(video);

          expect(dock).to.not.have.been.called;
        });

        it('should dock if video is over top boundary', () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const dock = stubDockInTransferLayerStep();
          const video = createVideo();

          setScrollDirection(DirectionY.TOP);

          const videoWidth = 400;
          const videoHeight = 300;

          setValidAreaWidth();
          setValidAreaHeight(videoHeight * 2);

          placeElementLtwh(video, 0, -250, videoWidth, videoHeight);

          docking.updateOnPositionChange_(video);

          expect(dock).to.have.been.calledOnce;
        });

        it('should not dock if video does not touch boundaries', () => {
          maybeCreateSlotElementLtwh(190, topBoundary, 200, 100);

          const dock = stubDockInTransferLayerStep();
          const video = createVideo();

          const videoWidth = 400;
          const videoHeight = 300;

          setValidAreaWidth();
          setValidAreaHeight(videoHeight);
          setScrollDirection(DirectionY.TOP);
          placeElementLtwh(video, 0, topBoundary + 1, videoWidth, videoHeight);

          docking.updateOnPositionChange_(video);

          expect(dock).to.not.have.been.called;
        });
      });

      describe('trigger_', () => {
        const targetElementTextual = useSlot ? 'video' : 'slot';

        it(`triggers action from ${targetElementTextual} element`, () => {
          const actions = {trigger: env.sandbox.spy()};
          env.sandbox.stub(Services, 'actionServiceForDoc').returns(actions);

          const slot = maybeCreateSlotElementLtwh(23, 17, 100, 100);
          const video = createVideo();
          const action = '🌮';

          docking.currentlyDocked_ = {
            video,
            target: {
              type: useSlot ? DockTargetType.SLOT : DockTargetType.CORNER,
              slot: useSlot ? slot : undefined,
            },
          };

          docking.trigger_(action);

          expect(
            actions.trigger.withArgs(
              slot || video.element,
              action,
              /* event */ any,
              /* trust */ any
            )
          ).to.have.been.called;
          expect(actions.trigger).to.have.been.calledOnce;
        });
      });
    }
  );
});
