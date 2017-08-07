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

import {AmpVisibilityObserver} from '../amp-visibility-observer';
import {layoutRectLtwh, RelativePositions} from '../../../../src/layout-rect';

/**
 * Functional tests that create:
 * - 1000px viewport
 * - 200px container
 * - moves the container in the viewport and tests enter, exit, progress values
 *   with various ratio and margin configurations
 */
describes.sandboxed('amp-visibility-selector', {}, env => {
  let impl;
  let enterSpy;
  let exitSpy;
  let scrollSpy;

  const BELOW_VP = 2000;
  const ABOVE_VP = -1000;
  const INSIDE_VP = 500;

  function init(ratios=['0','0'], margins=['0','0']) {
    const elem = {
      getAttribute(attr) {
        if (attr == 'intersection-ratio') {
          return ratios.join(' ');
        }
        if (attr == 'exclusion-margins') {
          return margins.join(' ');
        }
      },
    };
    elem.ownerDocument = {
      defaultView: window,
    };

    impl = new AmpVisibilityObserver(elem);
    enterSpy = sandbox.stub(impl, 'triggerEnter_');
    exitSpy = sandbox.stub(impl, 'triggerExit_');
    scrollSpy = sandbox.stub(impl, 'triggerScroll_');
  }


  function setPosition(top) {
    const viewportRect = layoutRectLtwh(0, 0, 500, 1000);
    let positionRect = layoutRectLtwh(0, top, 500, 200);
    let relativePos = RelativePositions.INSIDE;

    if (top > 1000 + 200) {
      positionRect = null;
      relativePos = RelativePositions.BOTTOM;
    } else if (top < -200) {
      positionRect = null;
      relativePos = RelativePositions.TOP;
    }
    const entry = {
      viewportRect,
      positionRect,
      relativePos,
    };
    impl.positionChanged_(entry);
  }

  describe('no ratio, no margin', () => {
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

        setPosition(ABOVE_VP);

        expect(scrollSpy).to.be.calledTwice;
        expect(exitSpy).to.be.calledOnce;
      });

      it('should trigger exit/scroll - exits to below', () => {
        init();

        setPosition(INSIDE_VP);
        expect(enterSpy).to.be.calledOnce;
        expect(scrollSpy).to.be.calledOnce;
        expect(exitSpy).not.to.be.called;

        setPosition(BELOW_VP);

        expect(scrollSpy).to.be.calledTwice;
        expect(exitSpy).to.be.calledOnce;
      });
    });

    describe('scroll progress', () => {
      /*
       * Without any ratio/margins items becomes visible and starts reporting
       * progress as soon:
       *   FROM BOTTOM: Its top hits the bottom edge of VP
       *   FROM TOP: Its bottom hits the top edge of VP.
       */
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
      });

      it('should report scroll progress - from top', () => {
        init();

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
  });
});



