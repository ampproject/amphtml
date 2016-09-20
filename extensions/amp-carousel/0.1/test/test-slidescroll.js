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

import * as sinon from 'sinon';
import '../amp-carousel';
import {createIframePromise} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';

describe('SlideScroll', () => {
  const SHOW_CLASS = '-amp-slide-item-show';
  let sandbox;

  beforeEach(() => {
    toggleExperiment(window, 'amp-slidescroll', true);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpSlideScroll(opt_hasLooping, opt_slideCount = 5) {
    return createIframePromise().then(iframe => {
      toggleExperiment(iframe.win, 'amp-slidescroll', true);
      const imgUrl = 'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
          'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const slideScrollHtml = "<amp-carousel type='slides'></amp-carousel>";
      const dummyDiv = iframe.doc.createElement('div');
      dummyDiv.innerHTML = slideScrollHtml.trim();
      const ampSlideScroll = dummyDiv.children[0];
      ampSlideScroll.setAttribute('width', '400');
      ampSlideScroll.setAttribute('height', '300');
      ampSlideScroll.setAttribute('controls', '');
      if (opt_hasLooping) {
        ampSlideScroll.setAttribute('loop', '');
      }

      for (let i = 0; i < opt_slideCount; i++) {
        const img = document.createElement('amp-img');
        ampSlideScroll.setAttribute('src', imgUrl);
        ampSlideScroll.setAttribute('width', '400');
        ampSlideScroll.setAttribute('height', '300');
        // See https://github.com/ampproject/amphtml/issues/3989
        ampSlideScroll.style.display = 'inline';
        ampSlideScroll.appendChild(img);
      }
      return iframe.addElement(ampSlideScroll).then(() => {
        return Promise.resolve({
          iframe,
          ampSlideScroll,
        });
      });
    });
  }

  it('should create container and wrappers and show initial slides', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      expect(
          ampSlideScroll.getElementsByClassName('-amp-slides-container').length)
              .to.equal(1);
      expect(
          ampSlideScroll.querySelectorAll(
            '.-amp-slides-container > .-amp-slide-item').length).to.equal(5);
      expect(
          ampSlideScroll.getElementsByClassName('amp-carousel-slide').length)
              .to.equal(5);
      const impl = ampSlideScroll.implementation_;
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
    });
  });

  it('should create start/end markers when scroll-snap is available', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      ampSlideScroll.style['scrollSnapType'] = '';
      ampSlideScroll.style['webkitScrollSnapType'] = '';
      ampSlideScroll.style['msScrollSnapType'] = '';
      impl.buildCarousel();
      expect(
          ampSlideScroll.getElementsByClassName(
              '-amp-carousel-start-marker').length).to.equal(1);
      expect(
          ampSlideScroll.getElementsByClassName(
              '-amp-carousel-end-marker').length).to.equal(1);
    });
  });

  it('should go to the correct slide on button click', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const showSlideSpy = sandbox.spy(impl, 'showSlide_');
      impl.slideWidth_ = 400;

      impl.goCallback(1);
      expect(showSlideSpy).to.have.been.calledWith(1);
      expect(showSlideSpy.callCount).to.equal(1);

      impl.goCallback(-1);
      expect(showSlideSpy).to.have.been.calledWith(0);
      expect(showSlideSpy.callCount).to.equal(2);

      impl.goCallback(0);
      expect(showSlideSpy.callCount).to.equal(2);
    });
  });

  it('should show the correct slide', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');
      const hideRestOfTheSlidesSpy = sandbox.spy(impl, 'hideRestOfTheSlides_');
      const setControlsStateSpy = sandbox.spy(impl, 'setControlsState');

      impl.showSlide_(-1);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;

      impl.showSlide_(5);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;

      impl.showSlide_(impl.slideIndex_);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;


      impl.showSlide_(1);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], true);
      expect(updateInViewportSpy.callCount).to.equal(2);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(scheduleLayoutSpy.callCount).to.equal(1);
      expect(schedulePreloadSpy.callCount).to.equal(2);
      expect(impl.slideIndex_).to.equal(1);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(1);
      expect(setControlsStateSpy.callCount).to.equal(1);

      impl.showSlide_(0);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], true);
      expect(updateInViewportSpy.callCount).to.equal(4);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(scheduleLayoutSpy.callCount).to.equal(2);
      expect(schedulePreloadSpy.callCount).to.equal(3);
      expect(impl.slideIndex_).to.equal(0);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(2);
      expect(setControlsStateSpy.callCount).to.equal(2);

      impl.showSlide_(4);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[4], true);
      expect(updateInViewportSpy.callCount).to.equal(6);
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[3]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[4]);
      expect(scheduleLayoutSpy.callCount).to.equal(3);
      expect(schedulePreloadSpy.callCount).to.equal(4);
      expect(impl.slideIndex_).to.equal(4);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4]);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(3);
      expect(setControlsStateSpy.callCount).to.equal(3);
    });
  });

  it('should hide the unwanted slides', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const hideRestOfTheSlidesSpy = sandbox.spy(impl, 'hideRestOfTheSlides_');

      impl.showSlide_(1);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(schedulePauseSpy.callCount).to.equal(2);

      impl.showSlide_(0);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0,1]);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(schedulePauseSpy.callCount).to.equal(4);

      impl.showSlide_(4);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4]);

      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[3]);
      expect(schedulePauseSpy.callCount).to.equal(7);
    });
  });

  it('should show/hide the correct controls', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;

      impl.showSlide_(1);
      expect(impl.hasNext()).to.be.true;
      expect(impl.hasPrev()).to.be.true;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;

      impl.showSlide_(0);
      expect(impl.hasNext()).to.be.true;
      expect(impl.hasPrev()).to.be.false;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.true;

      impl.showSlide_(4);
      expect(impl.hasNext()).to.be.false;
      expect(impl.hasPrev()).to.be.true;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.true;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
    });
  });

  it('should set the correct scrollLeft when there is only one slide', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;

      impl.noOfSlides_ = 1;
      impl.showSlide_(0);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
    });
  });

  it('should update to the right slide on scroll', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const showSlideSpy = sandbox.spy(impl, 'showSlide_');

      impl.vsync_ = {
        mutatePromise: cb => {
          cb();
          return {
            then: cb2 => {
              cb2();
            },
          };
        },
        mutate: cb => {
          cb();
        },
      };

      impl.slideWidth_ = 400;

      // Move to slide 1 (from slide 0).
      impl.showSlide_(1);
      expect(showSlideSpy).to.be.calledWith(1);
      expect(impl.snappingInProgress_).to.be.false;

      //Move to slide 0 - via scrolling back.
      impl.updateOnScroll_(1);
      expect(showSlideSpy).to.be.calledWith(0);
      expect(impl.slideIndex_).to.equal(0);

      // Try scrolling Fwd and move to slide 1.
      impl.updateOnScroll_(401);
      expect(showSlideSpy).to.be.calledWith(1);
      expect(impl.slideIndex_).to.equal(1);


      impl.updateOnScroll_(700);
      expect(showSlideSpy).to.be.calledWith(2);
      expect(impl.slideIndex_).to.equal(2);

      impl.showSlide_(4);
      impl.updateOnScroll_(700);
      expect(showSlideSpy).to.be.calledWith(4);
      expect(impl.slideIndex_).to.equal(4);
    });
  });

  it('should get the correct next slide index for a scrollLeft' , () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      impl.slideWidth_ = 400;

      // Already at slide 0;
      expect(impl.getNextSlideIndex_(0)).to.equal(0);
      expect(impl.getNextSlideIndex_(100)).to.equal(0);
      expect(impl.getNextSlideIndex_(200)).to.equal(1);
      expect(impl.getNextSlideIndex_(400)).to.equal(1);

      impl.showSlide_(3);

      expect(impl.getNextSlideIndex_(0)).to.equal(2);
      expect(impl.getNextSlideIndex_(100)).to.equal(2);
      expect(impl.getNextSlideIndex_(200)).to.equal(3);
      expect(impl.getNextSlideIndex_(400)).to.equal(3);
      expect(impl.getNextSlideIndex_(500)).to.equal(3);
      expect(impl.getNextSlideIndex_(600)).to.equal(4);
      expect(impl.getNextSlideIndex_(800)).to.equal(4);

      impl.showSlide_(4);
      expect(impl.getNextSlideIndex_(0)).to.equal(3);
      expect(impl.getNextSlideIndex_(100)).to.equal(3);
      expect(impl.getNextSlideIndex_(200)).to.equal(4);
      expect(impl.getNextSlideIndex_(400)).to.equal(4);
    });
  });

  it('should custom snap to the correct slide', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const animateScrollLeftSpy = sandbox.spy(impl, 'animateScrollLeft_');
      impl.slideWidth_ = 400;

      impl.customSnap_(0);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 0);
      impl.customSnap_(100);
      expect(animateScrollLeftSpy).to.have.been.calledWith(100, 0);
      impl.customSnap_(200);
      expect(animateScrollLeftSpy).to.have.been.calledWith(200, 400);
      impl.customSnap_(400);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 400);

      impl.showSlide_(3);

      impl.customSnap_(0);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 0);
      impl.customSnap_(100);
      expect(animateScrollLeftSpy).to.have.been.calledWith(100, 0);
      impl.customSnap_(200);
      expect(animateScrollLeftSpy).to.have.been.calledWith(200, 400);
      impl.customSnap_(400);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 400);
      impl.customSnap_(500);
      expect(animateScrollLeftSpy).to.have.been.calledWith(500, 400);
      impl.customSnap_(600);
      expect(animateScrollLeftSpy).to.have.been.calledWith(600, 800);
      impl.customSnap_(800);
      expect(animateScrollLeftSpy).to.have.been.calledWith(800, 800);

      impl.showSlide_(4);

      impl.customSnap_(0);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 0);
      impl.customSnap_(100);
      expect(animateScrollLeftSpy).to.have.been.calledWith(100, 0);
      impl.customSnap_(200);
      expect(animateScrollLeftSpy).to.have.been.calledWith(200, 400);
      impl.customSnap_(400);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 400);

      impl.showSlide_(0);

      impl.customSnap_(0, -1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 0);
      impl.customSnap_(0, 1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 400);

      impl.showSlide_(3);

      impl.customSnap_(400, -1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
      impl.customSnap_(400, 1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 400);

      impl.showSlide_(4);

      impl.customSnap_(400, -1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
      impl.customSnap_(400, 1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 400);
    });
  });

  it('should custom snap to the correct slide - special case', () => {
    return getAmpSlideScroll(null, 2).then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const animateScrollLeftSpy = sandbox.spy(impl, 'animateScrollLeft_');
      impl.slideWidth_ = 400;

      impl.customSnap_(0, 1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 400);

      impl.showSlide_(1);

      impl.customSnap_(400, -1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
    });
  });

  it('should handle custom elastic scroll', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const customSnapSpy = sandbox.stub(impl, 'customSnap_', () => {
        return {
          then: cb => {
            cb();
          },
        };
      });
      impl.slideWidth_ = 400;

      impl.handleCustomElasticScroll_(-10);
      expect(impl.elasticScrollState_).to.equal(-1);
      impl.previousScrollLeft_ = -10;
      impl.handleCustomElasticScroll_(-5);
      expect(customSnapSpy).to.have.been.calledWith(-5);

      impl.previousScrollLeft_ = null;

      impl.handleCustomElasticScroll_(410);
      expect(impl.elasticScrollState_).to.equal(1);
      impl.previousScrollLeft_ = 410;
      impl.handleCustomElasticScroll_(405);
      expect(customSnapSpy).to.have.been.calledWith(405);
    });
  });

  it('should handle layout measures (orientation changes)', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const getLayoutWidthSpy = sandbox.stub(impl, 'getLayoutWidth', () => {
        return impl.slideWidth_ == 400 ? 200 : 400;
      });
      impl.slideIndex_ = null;
      impl.onLayoutMeasure();
      expect(getLayoutWidthSpy).to.have.been.called;
      expect(impl.slideWidth_).to.equal(400);

      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(400);
      impl.onLayoutMeasure();
      expect(getLayoutWidthSpy.callCount).to.equal(2);
      expect(impl.slideWidth_).to.equal200;
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(200);
    });
  });

  describe('Looping', () => {
    beforeEach(() => {
      toggleExperiment(window, 'amp-slidescroll', true);
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

    it('should create container and wrappers and show initial slides', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
      });
    });

    it('should show the correct slides when looping', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
        const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
        const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');
        const hideRestOfTheSlidesSpy =
            sandbox.spy(impl, 'hideRestOfTheSlides_');
        const setControlsStateSpy = sandbox.spy(impl, 'setControlsState');

        impl.showSlide_(1);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[1], true);
        expect(updateInViewportSpy.callCount).to.equal(2);
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[2]);
        expect(scheduleLayoutSpy.callCount).to.equal(1);
        expect(schedulePreloadSpy.callCount).to.equal(2);
        expect(impl.slideIndex_).to.equal(1);
        expect(impl.slidesContainer_./*OK*/scrollLeft)
            .to.equal(impl.slideWidth_);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
        expect(hideRestOfTheSlidesSpy.callCount).to.equal(1);
        expect(setControlsStateSpy.callCount).to.equal(1);

        impl.showSlide_(0);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[1], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], true);
        expect(updateInViewportSpy.callCount).to.equal(4);
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[1]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[4]);
        expect(scheduleLayoutSpy.callCount).to.equal(2);
        expect(schedulePreloadSpy.callCount).to.equal(4);
        expect(impl.slideIndex_).to.equal(0);
        expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([4, 0, 1]);
        expect(hideRestOfTheSlidesSpy.callCount).to.equal(2);
        expect(setControlsStateSpy.callCount).to.equal(2);

        impl.showSlide_(4);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[4], true);
        expect(updateInViewportSpy.callCount).to.equal(6);
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[3]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[4]);
        expect(scheduleLayoutSpy.callCount).to.equal(3);
        expect(schedulePreloadSpy.callCount).to.equal(6);
        expect(impl.slideIndex_).to.equal(4);
        expect(impl.slidesContainer_./*OK*/scrollLeft)
            .to.equal(impl.slideWidth_);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4, 0]);
        expect(hideRestOfTheSlidesSpy.callCount).to.equal(3);
        expect(setControlsStateSpy.callCount).to.equal(3);

      });
    });

    it('should hide unwanted slides when looping', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
        const hideRestOfTheSlidesSpy =
            sandbox.spy(impl, 'hideRestOfTheSlides_');

        impl.showSlide_(1);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.false;

        expect(impl.slideWrappers_[0].style.order).to.equal('1');
        expect(impl.slideWrappers_[1].style.order).to.equal('2');
        expect(impl.slideWrappers_[2].style.order).to.equal('3');
        expect(impl.slideWrappers_[3].style.order).to.equal('');
        expect(impl.slideWrappers_[4].style.order).to.equal('');

        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[4]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[2]);
        expect(schedulePauseSpy.callCount).to.equal(3);

        impl.showSlide_(0);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([4, 0, 1]);

        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].style.order).to.equal('2');
        expect(impl.slideWrappers_[1].style.order).to.equal('3');
        expect(impl.slideWrappers_[2].style.order).to.equal('');
        expect(impl.slideWrappers_[3].style.order).to.equal('');
        expect(impl.slideWrappers_[4].style.order).to.equal('1');
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[2]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[4]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[1]);
        expect(schedulePauseSpy.callCount).to.equal(6);

        impl.showSlide_(4);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4, 0]);

        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.false;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].style.order).to.equal('3');
        expect(impl.slideWrappers_[1].style.order).to.equal('');
        expect(impl.slideWrappers_[2].style.order).to.equal('');
        expect(impl.slideWrappers_[3].style.order).to.equal('1');
        expect(impl.slideWrappers_[4].style.order).to.equal('2');
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[3]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[1]);
        expect(schedulePauseSpy.callCount).to.equal(9);
      });
    });

    it('should show/hide the correct controls when looping', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;

        impl.showSlide_(1);
        expect(impl.hasNext()).to.be.true;
        expect(impl.hasPrev()).to.be.true;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;

        impl.showSlide_(0);
        expect(impl.hasNext()).to.be.true;
        expect(impl.hasPrev()).to.be.true;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;

        impl.showSlide_(4);
        expect(impl.hasNext()).to.be.true;
        expect(impl.hasPrev()).to.be.true;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
      });
    });

    it('should set the correct scrollLeft when there is only one slide', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;

        impl.noOfSlides_ = 1;
        impl.showSlide_(0);
        expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
      });
    });

    it('should update to the right slide on scroll', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');

        impl.vsync_ = {
          mutate: cb => {
            cb();
          },
        };

        impl.slideWidth_ = 400;

        // Move to slide 1 (from slide 0).
        impl.showSlide_(1);
        expect(showSlideSpy).to.be.calledWith(1);
        expect(impl.snappingInProgress_).to.be.false;

        //Move to slide 0 - via scrolling back.
        impl.updateOnScroll_(1);
        expect(showSlideSpy).to.be.calledWith(0);
        expect(impl.slideIndex_).to.equal(0);

        // Try scrolling Fwd and move a little fwd to stay in the same slide.
        impl.updateOnScroll_(401);
        expect(showSlideSpy).to.be.calledWith(0);
        expect(impl.slideIndex_).to.equal(0);

        impl.updateOnScroll_(700);
        expect(showSlideSpy).to.be.calledWith(1);
        expect(impl.slideIndex_).to.equal(1);

        impl.showSlide_(4);
        impl.updateOnScroll_(700);
        expect(showSlideSpy).to.be.calledWith(0);
        expect(impl.slideIndex_).to.equal(0);

        impl.updateOnScroll_(1);
        expect(showSlideSpy).to.be.calledWith(4);
        expect(impl.slideIndex_).to.equal(4);
      });
    });

    it('should get the correct next slide index for a scrollLeft' , () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;

        //Slide width = 400
        impl.slideWidth_ = 400;
        // Already at slide 0;

        expect(impl.getNextSlideIndex_(0)).to.equal(4);
        expect(impl.getNextSlideIndex_(100)).to.equal(4);
        expect(impl.getNextSlideIndex_(200)).to.equal(0);
        expect(impl.getNextSlideIndex_(400)).to.equal(0);
        expect(impl.getNextSlideIndex_(500)).to.equal(0);
        expect(impl.getNextSlideIndex_(600)).to.equal(1);
        expect(impl.getNextSlideIndex_(800)).to.equal(1);

        impl.showSlide_(3);

        expect(impl.getNextSlideIndex_(0)).to.equal(2);
        expect(impl.getNextSlideIndex_(100)).to.equal(2);
        expect(impl.getNextSlideIndex_(200)).to.equal(3);
        expect(impl.getNextSlideIndex_(400)).to.equal(3);
        expect(impl.getNextSlideIndex_(500)).to.equal(3);
        expect(impl.getNextSlideIndex_(600)).to.equal(4);
        expect(impl.getNextSlideIndex_(800)).to.equal(4);

        impl.showSlide_(4);
        expect(impl.getNextSlideIndex_(0)).to.equal(3);
        expect(impl.getNextSlideIndex_(100)).to.equal(3);
        expect(impl.getNextSlideIndex_(200)).to.equal(4);
        expect(impl.getNextSlideIndex_(400)).to.equal(4);
        expect(impl.getNextSlideIndex_(500)).to.equal(4);
        expect(impl.getNextSlideIndex_(600)).to.equal(0);
        expect(impl.getNextSlideIndex_(800)).to.equal(0);
      });
    });

    it('should custom snap to the correct slide', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const animateScrollLeftSpy = sandbox.spy(impl, 'animateScrollLeft_');
        impl.slideWidth_ = 400;

        impl.customSnap_(0);
        expect(animateScrollLeftSpy).to.have.been.calledWith(0, 0);
        impl.customSnap_(100);
        expect(animateScrollLeftSpy).to.have.been.calledWith(100, 0);
        impl.customSnap_(200);
        expect(animateScrollLeftSpy).to.have.been.calledWith(200, 400);
        impl.customSnap_(400);
        expect(animateScrollLeftSpy).to.have.been.calledWith(400, 400);
        impl.customSnap_(500);
        expect(animateScrollLeftSpy).to.have.been.calledWith(500, 400);
        impl.customSnap_(600);
        expect(animateScrollLeftSpy).to.have.been.calledWith(600, 800);
        impl.customSnap_(800);
        expect(animateScrollLeftSpy).to.have.been.calledWith(800, 800);

        impl.customSnap_(400, -1);
        expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
        impl.customSnap_(400, 1);
        expect(animateScrollLeftSpy).to.have.been.calledWith(400, 800);
      });
    });

    it('should go to the correct slide on button click', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');
        impl.slideWidth_ = 400;

        impl.goCallback(-1);
        expect(showSlideSpy).to.have.been.calledWith(4);
        expect(showSlideSpy.callCount).to.equal(1);

        impl.goCallback(1);
        expect(showSlideSpy).to.have.been.calledWith(0);
        expect(showSlideSpy.callCount).to.equal(2);

        impl.goCallback(1);
        expect(showSlideSpy).to.have.been.calledWith(1);
        expect(showSlideSpy.callCount).to.equal(3);
      });
    });
  });
});
