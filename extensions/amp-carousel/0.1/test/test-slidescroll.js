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

describe('SlideScroll', () => {
  const SHOW_CLASS = 'i-amphtml-slide-item-show';
  let sandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpSlideScroll(
      opt_hasLooping, opt_slideCount = 5, opt_attachToDom = true) {
    return createIframePromise().then(iframe => {
      iframe.width = '1000';
      iframe.height = '1000';
      const imgUrl = 'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
          'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const slideScrollHtml = "<amp-carousel type='slides'></amp-carousel>";
      const dummyDiv = iframe.doc.createElement('div');
      dummyDiv.innerHTML = slideScrollHtml.trim();
      const ampSlideScroll = dummyDiv.children[0];
      ampSlideScroll.setAttribute('width', '400');
      ampSlideScroll.setAttribute('height', '300');
      ampSlideScroll.style.position = 'relative';
      ampSlideScroll.setAttribute('controls', '');
      if (opt_hasLooping) {
        ampSlideScroll.setAttribute('loop', '');
      }

      for (let i = 0; i < opt_slideCount; i++) {
        const img = document.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '400');
        img.setAttribute('height', '300');
        // See https://github.com/ampproject/amphtml/issues/3989
        img.style.display = 'inline';
        if (i == 0) {
          img.setAttribute('data-slide-id', 'slide-id');
        }
        ampSlideScroll.appendChild(img);
      }

      const returnPromise = Promise.resolve({iframe, ampSlideScroll});
      if (opt_attachToDom) {
        return iframe.addElement(ampSlideScroll).then(() => returnPromise);
      } else {
        return returnPromise;
      }
    });
  }

  it('should create container and wrappers and show initial slides', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      expect(
          ampSlideScroll.getElementsByClassName('i-amphtml-slides-container')
              .length).to.equal(1);
      expect(
          ampSlideScroll.querySelectorAll(
            '.i-amphtml-slides-container > .i-amphtml-slide-item').length)
                .to.equal(5);
      expect(
          ampSlideScroll.getElementsByClassName('amp-carousel-slide').length)
              .to.equal(5);
      expect(ampSlideScroll.querySelector('.i-amphtml-slides-container')
            .getAttribute('aria-live')).to.equal('polite');
      const impl = ampSlideScroll.implementation_;
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');
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
              'i-amphtml-carousel-start-marker').length).to.be.at.least(1);
      expect(
          ampSlideScroll.getElementsByClassName(
              'i-amphtml-carousel-end-marker').length).to.be.at.least(1);
    });
  });

  it('should go to the correct slide on button click', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const showSlideSpy = sandbox.spy(impl, 'showSlide_');

      impl.goCallback(1);
      expect(showSlideSpy).to.have.been.calledWith(1);
      expect(showSlideSpy).to.be.calledOnce;

      impl.goCallback(-1);
      expect(showSlideSpy).to.have.been.calledWith(0);
      expect(showSlideSpy).to.have.callCount(2);

      impl.goCallback(0);
      expect(showSlideSpy).to.have.callCount(2);
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
      const analyticsEventSpy = sandbox.spy(impl, 'analyticsEvent_');

      impl.showSlide_(-1);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;
      expect(analyticsEventSpy).to.not.have.been.called;

      impl.showSlide_(5);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;
      expect(analyticsEventSpy).to.not.have.been.called;

      impl.showSlide_(impl.slideIndex_);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(schedulePreloadSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;
      expect(analyticsEventSpy).to.not.have.been.called;

      impl.showSlide_(1);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], true);
      expect(updateInViewportSpy).to.have.callCount(2);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(scheduleLayoutSpy).to.be.calledOnce;
      expect(schedulePreloadSpy).to.have.callCount(2);
      expect(impl.slideIndex_).to.equal(1);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
      expect(hideRestOfTheSlidesSpy).to.be.calledOnce;
      expect(setControlsStateSpy).to.be.calledOnce;
      expect(analyticsEventSpy).to.have.callCount(2);
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-next', {'fromSlide': 'slide-id', 'toSlide': '1'});
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change', {'fromSlide': 'slide-id', 'toSlide': '1'});
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[2].getAttribute('aria-hidden')).to.equal('true');

      impl.showSlide_(0);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], true);
      expect(updateInViewportSpy).to.have.callCount(4);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
          .to.be.false;
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(scheduleLayoutSpy).to.have.callCount(2);
      expect(schedulePreloadSpy).to.have.callCount(3);
      expect(impl.slideIndex_).to.equal(0);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
      expect(hideRestOfTheSlidesSpy).to.have.callCount(2);
      expect(setControlsStateSpy).to.have.callCount(2);
      expect(analyticsEventSpy).to.have.callCount(4);
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-prev', {'fromSlide': '1', 'toSlide': 'slide-id'});
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change', {'fromSlide': '1', 'toSlide': 'slide-id'});
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

      impl.showSlide_(4);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[4], true);
      expect(updateInViewportSpy).to.have.callCount(6);
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
          .to.be.true;
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[3]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[4]);
      expect(scheduleLayoutSpy).to.have.callCount(3);
      expect(schedulePreloadSpy).to.have.callCount(4);
      expect(impl.slideIndex_).to.equal(4);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4]);
      expect(hideRestOfTheSlidesSpy).to.have.callCount(3);
      expect(setControlsStateSpy).to.have.callCount(3);
      expect(analyticsEventSpy).to.have.callCount(6);
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-prev', {'fromSlide': 'slide-id', 'toSlide': '4'});
      expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change', {'fromSlide': 'slide-id', 'toSlide': '4'});
      expect(impl.slides_[3].getAttribute('aria-hidden')).to.equal('true');
      expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal(null);
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
      expect(schedulePauseSpy).to.have.callCount(2);

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
      expect(schedulePauseSpy).to.have.callCount(4);

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
      expect(schedulePauseSpy).to.have.callCount(7);
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
      impl.onLayoutMeasure();
      expect(getLayoutWidthSpy).to.have.been.called;
      expect(impl.slideWidth_).to.equal(200);

      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(200);
      impl.onLayoutMeasure();
      expect(getLayoutWidthSpy).to.have.callCount(2);
      expect(impl.slideWidth_).to.equal(400);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(400);
    });
  });

  describe('Looping', () => {
    beforeEach(() => {
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

        expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

        impl.showSlide_(1);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[1], true);
        expect(updateInViewportSpy).to.have.callCount(2);
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[2]);
        expect(scheduleLayoutSpy).to.be.calledOnce;
        expect(schedulePreloadSpy).to.have.callCount(2);
        expect(impl.slideIndex_).to.equal(1);
        expect(impl.slidesContainer_./*OK*/scrollLeft)
            .to.equal(impl.slideWidth_);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
        expect(hideRestOfTheSlidesSpy).to.be.calledOnce;
        expect(setControlsStateSpy).to.be.calledOnce;
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[2].getAttribute('aria-hidden')).to.equal('true');

        impl.showSlide_(0);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[1], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], true);
        expect(updateInViewportSpy).to.have.callCount(4);
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
        expect(scheduleLayoutSpy).to.have.callCount(2);
        expect(schedulePreloadSpy).to.have.callCount(4);
        expect(impl.slideIndex_).to.equal(0);
        expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(400);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([4, 0, 1]);
        expect(hideRestOfTheSlidesSpy).to.have.callCount(2);
        expect(setControlsStateSpy).to.have.callCount(2);
        expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

        impl.showSlide_(4);

        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[0], false);
        expect(updateInViewportSpy).to.have.been.calledWith(
            impl.slides_[4], true);
        expect(updateInViewportSpy).to.have.callCount(6);
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS))
            .to.be.true;
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[3]);
        expect(schedulePreloadSpy).to.have.been.calledWith(impl.slides_[0]);
        expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[4]);
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(schedulePreloadSpy).to.have.callCount(6);
        expect(impl.slideIndex_).to.equal(4);
        expect(impl.slidesContainer_./*OK*/scrollLeft)
            .to.equal(impl.slideWidth_);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4, 0]);
        expect(hideRestOfTheSlidesSpy).to.have.callCount(3);
        expect(setControlsStateSpy).to.have.callCount(3);
        expect(impl.slides_[3].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');

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
        expect(schedulePauseSpy).to.have.callCount(3);

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
        expect(schedulePauseSpy).to.have.callCount(6);

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
        expect(schedulePauseSpy).to.have.callCount(9);
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
      return getAmpSlideScroll(true, 1).then(obj => {
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

        impl.goCallback(-1);
        expect(showSlideSpy).to.have.been.calledWith(4);
        expect(showSlideSpy).to.be.calledOnce;

        impl.goCallback(1);
        expect(showSlideSpy).to.have.been.calledWith(0);
        expect(showSlideSpy).to.have.callCount(2);

        impl.goCallback(1);
        expect(showSlideSpy).to.have.been.calledWith(1);
        expect(showSlideSpy).to.have.callCount(3);
      });
    });

    it('should update slide when `slide` attribute mutates', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');

        impl.mutatedAttributesCallback({slide: 2});
        expect(showSlideSpy).to.have.been.calledWith(2);

        impl.mutatedAttributesCallback({slide: 0});
        expect(showSlideSpy).to.have.been.calledWith(0);

        // Don't call showSlide_() if slide is not finite.
        showSlideSpy.reset();
        impl.mutatedAttributesCallback({slide: Number.POSITIVE_INFINITY});
        expect(showSlideSpy.called).to.be.false;
      });
    });

    it('should update slide count when `slide-count` attribute mutates', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        impl.showSlide_(4);
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');
        const hideRestOfTheSlidesSpy =
            sandbox.spy(impl, 'hideRestOfTheSlides_');

        impl.mutatedAttributesCallback({'slide-count': 2});
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
        // Should move to last visible slide
        expect(showSlideSpy).to.have.been.calledWith(1);
      });
    });

    it('should trigger `slideChange` action when user changes slides', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        const triggerSpy = sandbox.spy(impl.action_, 'trigger');

        impl.goCallback(-1, /* animate */ false);
        expect(triggerSpy).to.have.been.calledWith(
            ampSlideScroll,
            'slideChange',
            /* CustomEvent */ sinon.match.has('detail', {index: 4}));

        impl.goCallback(1, /* animate */ false);
        expect(triggerSpy).to.have.been.calledWith(
            ampSlideScroll,
            'slideChange',
            /* CustomEvent */ sinon.match.has('detail', {index: 0}));
      });
    });

    it('should goToSlide on action', () => {
      return getAmpSlideScroll(true).then(obj => {
        const ampSlideScroll = obj.ampSlideScroll;
        const impl = ampSlideScroll.implementation_;
        let args = {'index': '123'};
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');

        impl.executeAction({method: 'goToSlide', args});
        expect(showSlideSpy).to.have.been.calledWith(123);

        args = {'index': 'ssds11'};
        impl.executeAction({method: 'goToSlide', args});
        expect(showSlideSpy).to.be.calledOnce;

        args = {'index': '0'};
        impl.executeAction({method: 'goToSlide', args});
        expect(showSlideSpy).to.have.been.calledWith(0);
      });
    });

    it('should NOT call showSlide_ before layout', () => {
      const promise = getAmpSlideScroll(true, 5, /* opt_attachToDom */ false);
      return promise.then(obj => {
        const {iframe, ampSlideScroll} = obj;

        // Layout happens asynchronously after attaching to DOM, so we can
        // test pre-layoutCallback logic now.
        iframe.addElement(ampSlideScroll);

        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = sandbox.spy(impl, 'showSlide_');

        const args = {'index': '123'};
        impl.executeAction({method: 'goToSlide', args});
        expect(showSlideSpy.called).to.be.false;

        impl.mutatedAttributesCallback({slide: 321});
        expect(showSlideSpy.called).to.be.false;

        ampSlideScroll.layoutCallback();

        // Should show the last slide index requested before layout.
        expect(showSlideSpy).to.have.been.calledWith(321);
        expect(showSlideSpy).to.be.calledOnce;
      });
    });
  });
});
