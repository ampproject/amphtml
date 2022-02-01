import {RelativePositions_Enum, layoutRectLtwh} from '#core/dom/layout/rect';

import {AmpVisibilityObserver} from '../amp-position-observer';

/**
 * Functional tests that create:
 * - 1000px viewport
 * - 200px container
 * - moves the container in the viewport and tests enter, exit, progress values,
 *   with various ratio and margin configurations
 */
describes.sandboxed('amp-position-observer', {}, (env) => {
  let impl;
  let enterSpy;
  let exitSpy;
  let scrollSpy;

  const BELOW_VP = 2000;
  const ABOVE_VP = -1000;
  const INSIDE_VP = 500;

  function init(ratios = '0', margins = '0', runOnce = false) {
    const elem = {
      getAttribute(attr) {
        if (attr == 'intersection-ratios') {
          return ratios;
        }
        if (attr == 'viewport-margins') {
          return margins;
        }
      },
    };
    elem.ownerDocument = {
      defaultView: window,
    };

    impl = new AmpVisibilityObserver(elem);
    impl.runOnce_ = runOnce;
    impl.parseAttributes_();
    enterSpy = env.sandbox.stub(impl, 'triggerEnter_');
    exitSpy = env.sandbox.stub(impl, 'triggerExit_');
    scrollSpy = env.sandbox.stub(impl, 'triggerScroll_');
  }

  function resetSpies() {
    enterSpy.resetHistory();
    exitSpy.resetHistory();
    scrollSpy.resetHistory();
  }

  function setPosition(top) {
    const viewportRect = layoutRectLtwh(0, 0, 500, 1000);
    let positionRect = layoutRectLtwh(0, top, 500, 200);
    let relativePos = RelativePositions_Enum.INSIDE;

    if (top > 1000 + 200) {
      positionRect = null;
      relativePos = RelativePositions_Enum.BOTTOM;
    } else if (top < -200) {
      positionRect = null;
      relativePos = RelativePositions_Enum.TOP;
    }
    const entry = {
      viewportRect,
      positionRect,
      relativePos,
    };
    impl.positionChanged_(entry);
  }

  describe('no ratio, no margin', () => {
    /**
     * With no ratio, no margin, element progresses as soon as partially visible
     * until it is fully invisible.
     *
     *    *******
     *    * end *
     * |--*******--|
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |--*******--|
     *    *start*
     *    *******
     */

    describe('not initially in viewport', () => {
      it('should not trigger enter', () => {
        init();
        expect(enterSpy).not.to.be.called;

        setPosition(BELOW_VP);
        expect(enterSpy).not.to.be.called;

        setPosition(ABOVE_VP);
        expect(enterSpy).not.to.be.called;
      });

      it('should not trigger exit', () => {
        init();
        expect(exitSpy).not.to.be.called;

        setPosition(BELOW_VP);
        expect(exitSpy).not.to.be.called;

        setPosition(ABOVE_VP);
        expect(exitSpy).not.to.be.called;
      });

      it('should not trigger scroll', () => {
        init();
        expect(scrollSpy).not.to.be.called;

        setPosition(BELOW_VP);
        expect(scrollSpy).not.to.be.called;

        setPosition(ABOVE_VP);
        expect(scrollSpy).not.to.be.called;
      });
    });

    describe('initially in viewport', () => {
      it('should trigger enter', () => {
        init();
        expect(enterSpy).not.to.be.called;
        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
      });

      it('should not trigger exit', () => {
        init();
        expect(exitSpy).not.to.be.called;
        setPosition(INSIDE_VP);
        expect(exitSpy).not.to.be.called;
      });

      it('should trigger scroll', () => {
        init();
        expect(scrollSpy).not.to.be.called;
        setPosition(INSIDE_VP);
        expect(scrollSpy).to.be.calledOnce;
      });
    });

    describe('enters viewport', () => {
      it('should trigger enter/scroll - enter from above', () => {
        init();

        setPosition(ABOVE_VP);
        expect(enterSpy).not.to.be.called;
        expect(exitSpy).not.to.be.called;
        expect(scrollSpy).not.to.be.called;

        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).not.to.be.called;
      });

      it('should trigger enter/scroll - enter from below', () => {
        init();

        setPosition(BELOW_VP);
        expect(enterSpy).not.to.be.called;
        expect(exitSpy).not.to.be.called;
        expect(scrollSpy).not.to.be.called;

        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).not.to.be.called;
      });
    });

    describe('exits viewport', () => {
      it('should trigger exit/scroll - exits to above', () => {
        init();

        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).not.to.be.called;

        resetSpies();
        setPosition(ABOVE_VP);

        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).to.be.calledOnce;
      });

      it('should trigger exit/scroll - exits to below', () => {
        init();

        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).not.to.be.called;

        resetSpies();
        setPosition(BELOW_VP);

        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).to.be.calledOnce;
      });
    });

    /*
     * Without any ratio/margins items becomes visible and starts reporting
     * progress as soon:
     *   FROM BOTTOM: Its top hits the bottom edge of VP
     *   FROM TOP: Its bottom hits the top edge of VP.
     *    *******
     *    * end *
     * |--*******--|
     * |           |
     * |           |
     * |           |
       |           |
     * |           |
     * |           |
     * |           |
     *  --*******--
     *    *start*
     *    *******
     */
    describe('scroll progress', () => {
      it('should report scroll progress - from bottom', () => {
        init();

        // one pixel below
        setPosition(1001);
        expect(scrollSpy).not.to.be.called;

        // right on edge, progress is 0%
        setPosition(1000);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.equal(0);

        // one more pixel
        setPosition(999);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.above(0);

        // middle - when middle of element is in the middle of viewport
        // vpHeight(100)/2 - elemHeight(200)/2 = 400
        setPosition(400);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(0.5);

        // about to exit
        setPosition(-199);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.below(1);

        // exit edge
        setPosition(-200);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(1);
        expect(exitSpy).not.to.be.called;

        // exited, progress should stay 1
        setPosition(-201);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(1);
        expect(exitSpy).to.be.called;

        resetSpies();
        // rerenter

        // one pixel above
        setPosition(-201);
        expect(scrollSpy).not.to.be.called;

        // right on edge, progress is 100% (coming from top)
        setPosition(-200);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.equal(1);

        // one more pixel
        setPosition(-199);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.below(1);

        // middle - when middle of element is in the middle of viewport
        // vpHeight(100)/2 - elemHeight(200)/2 = 400
        setPosition(400);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(0.5);

        // about to exit
        setPosition(999);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.above(0);

        // exit edge
        setPosition(1000);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(0);
        expect(exitSpy).not.to.be.called;

        // exited, progress should stay 0
        setPosition(1001);
        expect(scrollSpy).to.be.called;
        expect(impl.scrollProgress_).to.be.equal(0);
        expect(exitSpy).to.be.called;
      });
    });

    describe('attribute `once` specified', () => {
      it(
        'should not trigger functions is `once` is specified - ' +
          'scroll from bottom to top',
        () => {
          init('0', '0', true);
          expect(enterSpy).not.to.be.called;
          setPosition(INSIDE_VP);
          expect(enterSpy).to.be.calledOnce;
          expect(scrollSpy).to.be.calledOnce;

          resetSpies();
          setPosition(ABOVE_VP);
          expect(exitSpy).to.be.calledOnce;
          expect(scrollSpy).to.be.calledOnce;

          resetSpies();
          setPosition(INSIDE_VP);
          expect(scrollSpy).not.to.be.called;
          expect(enterSpy).not.to.be.called;
          expect(exitSpy).not.to.be.called;
        }
      );

      it(
        'should not trigger functions is `once` is specified - ' +
          'scroll from top to bottom',
        () => {
          init('0', '0', true);
          expect(enterSpy).not.to.be.called;

          resetSpies();
          setPosition(ABOVE_VP);
          expect(scrollSpy).not.to.be.called;
          expect(enterSpy).not.to.be.called;
          expect(exitSpy).not.to.be.called;

          resetSpies();
          setPosition(INSIDE_VP);
          expect(scrollSpy).to.be.calledOnce;

          resetSpies();
          setPosition(BELOW_VP);
          expect(exitSpy).to.be.calledOnce;
          expect(scrollSpy).to.be.calledOnce;

          resetSpies();
          setPosition(INSIDE_VP);
          expect(scrollSpy).not.to.be.called;
          expect(enterSpy).not.to.be.called;
          expect(exitSpy).not.to.be.called;
        }
      );
    });
  });

  describe('has ratio, no margin', () => {
    /**
     * with both ratios as 1, element only progresses when fully visible
     *  --*******--
     * |  * end *  |
     * |  *******  |
     * |           |
     * |           |
     * |           |
     * |           |
     * |  *******  |
     * |  *start*  |
     *  --*******--
     */
    it('top: 1, bottom: 1', () => {
      init('1');

      // start just below
      setPosition(801);
      expect(scrollSpy).not.to.be.called;
      expect(enterSpy).not.to.be.called;
      expect(exitSpy).not.to.be.called;

      // hit visibility edge ( element fully visible with means
      // vpHeight(1000) - elementHeight(200) = 800
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // scroll up more
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // 1/4
      setPosition(600);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.25);

      // 3/4
      setPosition(200);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.75);

      // about to exit
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      // exit
      setPosition(-1);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      resetSpies();

      // re-enter
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(1);

      // hit middle
      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(0.5);

      // about to exit from bottom
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge at bottom
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // exit from bottom
      setPosition(801);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
    });

    /**
     * with both ratios as 0.5, element progresses when half visible
     *    *******
     * |--* end *--|
     * |  *******  |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |  *******  |
     * |--*start*--|
     *    *******
     */
    it('top: 0.5, bottom: 0.5', () => {
      init('0.5');

      // start just below
      setPosition(901);
      expect(scrollSpy).not.to.be.called;
      expect(enterSpy).not.to.be.called;
      expect(exitSpy).not.to.be.called;

      // hit visibility edge ( element fully visible with means
      // vpHeight(1000) - elementHeight(200) / 2 = 900
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // scroll up more
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // 1/4
      setPosition(650);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.25);

      // 3/4
      setPosition(150);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.75);

      // about to exit
      setPosition(-99);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(-100);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      // exit
      setPosition(-101);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      resetSpies();

      // re-enter
      setPosition(-100);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(1);

      // hit middle
      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(0.5);

      // about to exit from bottom
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge at bottom
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // exit from bottom
      setPosition(901);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
    });

    /**
     *  top: 0 bottom: 1
     *    *******
     *    * end *
     * |--*******--|
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |  *******  |
     * |  *start*  |
     * |--*******--
     */
    it('top: 0, bottom: 1', () => {
      init('0 1');

      // start just below
      setPosition(801);
      expect(scrollSpy).not.to.be.called;
      expect(enterSpy).not.to.be.called;
      expect(exitSpy).not.to.be.called;

      // hit visibility
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // scroll up more
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // about to exit
      setPosition(-199);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(-200);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      // exit
      setPosition(-201);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      resetSpies();

      // re-enter
      setPosition(-200);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(1);

      // about to exit from bottom
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge at bottom
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // exit from bottom
      setPosition(801);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
    });

    /**
     *  top: 1 bottom: 0
     * |--*******--|
     * |  * end *  |
     * |  *******  |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |           |
     * |--*******--|
     *    *start*
     *    *******
     */
    it('top: 1, bottom: 0', () => {
      init('1 0');

      // start just below
      setPosition(1001);
      expect(scrollSpy).not.to.be.called;
      expect(enterSpy).not.to.be.called;
      expect(exitSpy).not.to.be.called;

      // hit visibility
      setPosition(1000);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // scroll up more
      setPosition(999);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // about to exit
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      // exit
      setPosition(-1);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      resetSpies();

      // re-enter
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(1);

      // about to exit from bottom
      setPosition(999);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge at bottom
      setPosition(1000);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // exit from bottom
      setPosition(1001);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
    });

    /**
     * top: 0.75 bottom: 0.2
     * custom, can't ASCII draw thing one.
     */
    it('top: 0.75, bottom: 0.2', () => {
      init('0.75 0.2');

      // 1000 - 40 (0.2*200)
      setPosition(961);
      expect(scrollSpy).not.to.be.called;
      expect(enterSpy).not.to.be.called;
      expect(exitSpy).not.to.be.called;

      // hit visibility
      setPosition(960);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // scroll up more
      setPosition(959);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // 0.75 * 200 = 150. 200 -150 = 50
      setPosition(-49);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(-50);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).not.to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      // exit
      setPosition(-51);
      expect(scrollSpy).to.be.called;
      expect(exitSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equals(1);

      resetSpies();

      // re-enter
      setPosition(-50);
      expect(scrollSpy).to.be.called;
      expect(enterSpy).to.be.calledOnce;
      expect(impl.scrollProgress_).to.be.equals(1);

      // about to exit from bottom
      setPosition(959);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge at bottom
      setPosition(960);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);

      // exit from bottom
      setPosition(961);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
    });
  });

  describe('has margin, no ratio', () => {
    /**
     * margins essentially just narrow the viewport.
     * here we have 100px margin on top and 100px margin on bottom
     */
    it('topMargin: 100px, bottomMargin: 100px', () => {
      init('0', '100');

      // one pixel below
      setPosition(901);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 0%
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(0);

      // one more pixel
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(-99);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(-100);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 1
      setPosition(-101);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).to.be.called;

      resetSpies();
      // rerenter

      // one pixel above
      setPosition(-101);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 100% (coming from top)
      setPosition(-100);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(1);

      // one more pixel
      setPosition(-99);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // middle
      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 0
      setPosition(901);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).to.be.called;
    });

    it('topMargin: 20vh, bottomMargin: 20vh', () => {
      // 10vh = 20% of vpHeight = 200px
      init('0', '20vh');

      // one pixel below
      setPosition(801);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 0%
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(0);

      // one more pixel
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 1
      setPosition(-1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).to.be.called;

      resetSpies();
      // rerenter

      // one pixel above
      setPosition(-1);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 100% (coming from top)
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(1);

      // one more pixel
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // middle
      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 0
      setPosition(801);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).to.be.called;
    });

    it('topMargin: 0px, bottomMargin: 100px', () => {
      init('0', '0 100');

      // one pixel below
      setPosition(901);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 0%
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(0);

      // one more pixel
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      setPosition(350);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(-199);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(-200);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 1
      setPosition(-201);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).to.be.called;

      resetSpies();
      // rerenter

      // one pixel above
      setPosition(-201);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 100% (coming from top)
      setPosition(-200);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(1);

      // one more pixel
      setPosition(-199);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // middle
      setPosition(350);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(899);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge
      setPosition(900);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 0
      setPosition(901);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).to.be.called;
    });
  });

  describe('with both margin and ratio', () => {
    it('ratio: 0.5 padding: 100px', () => {
      init('0.5', '100');

      // one pixel below
      setPosition(801);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 0%
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(0);

      // one more pixel
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // exit edge
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 1
      setPosition(-1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(1);
      expect(exitSpy).to.be.called;

      resetSpies();
      // rerenter

      // one pixel above
      setPosition(-1);
      expect(scrollSpy).not.to.be.called;

      // right on edge, progress is 100% (coming from top)
      setPosition(0);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.equal(1);

      // one more pixel
      setPosition(1);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.below(1);

      // middle
      setPosition(400);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0.5);

      // about to exit
      setPosition(799);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.above(0);

      // exit edge
      setPosition(800);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).not.to.be.called;

      // exited, progress should stay 0
      setPosition(801);
      expect(scrollSpy).to.be.called;
      expect(impl.scrollProgress_).to.be.equal(0);
      expect(exitSpy).to.be.called;
    });
  });
});
