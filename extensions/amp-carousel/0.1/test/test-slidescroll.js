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

import '../amp-carousel';
import {ActionService} from '../../../../src/service/action-impl';
import {ActionTrust} from '../../../../src/action-constants';
import {Services} from '../../../../src/services';
import {
  createElementWithAttributes,
  whenUpgradedToCustomElement,
} from '../../../../src/dom';
import {user} from '../../../../src/log';

describes.realWin(
  'SlideScroll',
  {
    amp: {
      extensions: ['amp-carousel'],
      runtimeOn: true,
    },
  },
  (env) => {
    const SHOW_CLASS = 'i-amphtml-slide-item-show';
    let win, doc;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '1000';
      env.iframe.height = '1000';
    });

    function getAmpSlideScroll(
      opt_hasLooping,
      opt_slideCount = 5,
      opt_attachToDom = true,
      opt_hasAutoplay = false,
      opt_autoplayLoops
    ) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const ampSlideScroll = doc.createElement('amp-carousel');
      ampSlideScroll.setAttribute('type', 'slides');
      ampSlideScroll.setAttribute('width', '400');
      ampSlideScroll.setAttribute('height', '300');
      ampSlideScroll.style.position = 'relative';
      ampSlideScroll.setAttribute('controls', '');
      if (opt_hasLooping) {
        ampSlideScroll.setAttribute('loop', '');
      }
      if (opt_hasAutoplay) {
        if (!opt_autoplayLoops) {
          ampSlideScroll.setAttribute('autoplay', '');
        } else {
          ampSlideScroll.setAttribute('autoplay', opt_autoplayLoops);
        }
      }

      for (let i = 0; i < opt_slideCount; i++) {
        const img = doc.createElement('amp-img');
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

      if (opt_attachToDom) {
        doc.body.appendChild(ampSlideScroll);
        return ampSlideScroll
          .build()
          .then(() => {
            ampSlideScroll.updateLayoutBox({
              top: 0,
              left: 0,
              width: 400,
              height: 300,
            });
            return ampSlideScroll.layoutCallback();
          })
          .then(() => ampSlideScroll);
      }
      return Promise.resolve(ampSlideScroll);
    }

    it('should create container and wrappers and show initial slides', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        expect(
          ampSlideScroll.getElementsByClassName('i-amphtml-slides-container')
            .length
        ).to.equal(1);
        expect(
          ampSlideScroll.querySelectorAll(
            '.i-amphtml-slides-container > .i-amphtml-slide-item'
          ).length
        ).to.equal(5);
        expect(
          ampSlideScroll.getElementsByClassName('amp-carousel-slide').length
        ).to.equal(5);
        expect(
          ampSlideScroll
            .querySelector('.i-amphtml-slides-container')
            .getAttribute('aria-live')
        ).to.equal('polite');
        const impl = ampSlideScroll.implementation_;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');
      });
    });

    it('should go to the correct slide on button click', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

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

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip('should show the correct slide', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const owners = Services.ownersForDoc(impl.element);
        const scheduleLayoutSpy = env.sandbox.spy(owners, 'scheduleLayout');
        const schedulePreloadSpy = env.sandbox.spy(owners, 'schedulePreload');
        const hideRestOfTheSlidesSpy = env.sandbox.spy(
          impl,
          'hideRestOfTheSlides_'
        );
        const setControlsStateSpy = env.sandbox.spy(impl, 'setControlsState');
        const analyticsEventSpy = env.sandbox.spy(impl, 'analyticsEvent_');

        expect(impl.showSlide_(-1)).to.be.false;
        expect(scheduleLayoutSpy).to.not.have.been.called;
        expect(schedulePreloadSpy).to.not.have.been.called;
        expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
        expect(setControlsStateSpy).to.not.have.been.called;
        expect(analyticsEventSpy).to.not.have.been.called;

        expect(impl.showSlide_(5)).to.be.false;
        expect(scheduleLayoutSpy).to.not.have.been.called;
        expect(schedulePreloadSpy).to.not.have.been.called;
        expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
        expect(setControlsStateSpy).to.not.have.been.called;
        expect(analyticsEventSpy).to.not.have.been.called;

        expect(impl.showSlide_(impl.slideIndex_)).to.be.false;
        expect(scheduleLayoutSpy).to.not.have.been.called;
        expect(schedulePreloadSpy).to.not.have.been.called;
        expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
        expect(setControlsStateSpy).to.not.have.been.called;
        expect(analyticsEventSpy).to.not.have.been.called;

        expect(impl.showSlide_(1)).to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[0]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[1]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[2]
        );
        expect(scheduleLayoutSpy).to.be.calledOnce;
        expect(schedulePreloadSpy).to.have.callCount(2);
        expect(impl.slideIndex_).to.equal(1);
        expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(
          impl.slideWidth_
        );
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
        expect(hideRestOfTheSlidesSpy).to.be.calledOnce;
        expect(setControlsStateSpy).to.be.calledOnce;
        expect(analyticsEventSpy).to.have.callCount(2);
        expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-next', {
          'fromSlide': 'slide-id',
          'toSlide': '1',
        });
        expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change',
          {'fromSlide': 'slide-id', 'toSlide': '1'}
        );
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[2].getAttribute('aria-hidden')).to.equal('true');

        expect(impl.showSlide_(0)).to.be.true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[0]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[1]
        );
        expect(scheduleLayoutSpy).to.have.callCount(2);
        expect(schedulePreloadSpy).to.have.callCount(3);
        expect(impl.slideIndex_).to.equal(0);
        expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(0);
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
        expect(hideRestOfTheSlidesSpy).to.have.callCount(2);
        expect(setControlsStateSpy).to.have.callCount(2);
        expect(analyticsEventSpy).to.have.callCount(4);
        expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-prev', {
          'fromSlide': '1',
          'toSlide': 'slide-id',
        });
        expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change',
          {'fromSlide': '1', 'toSlide': 'slide-id'}
        );
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

        expect(impl.showSlide_(4)).to.be.true;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[3]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[4]
        );
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(schedulePreloadSpy).to.have.callCount(4);
        expect(impl.slideIndex_).to.equal(4);
        expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(
          impl.slideWidth_
        );
        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4]);
        expect(hideRestOfTheSlidesSpy).to.have.callCount(3);
        expect(setControlsStateSpy).to.have.callCount(3);
        expect(analyticsEventSpy).to.have.callCount(6);
        expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-prev', {
          'fromSlide': 'slide-id',
          'toSlide': '4',
        });
        expect(analyticsEventSpy).to.have.been.calledWith(
          'amp-carousel-change',
          {'fromSlide': 'slide-id', 'toSlide': '4'}
        );
        expect(impl.slides_[3].getAttribute('aria-hidden')).to.equal('true');
        expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('false');
        expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal(null);
      });
    });

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip('should hide the unwanted slides', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const owners = Services.ownersForDoc(impl.element);
        const schedulePauseSpy = env.sandbox.spy(owners, 'schedulePause');
        const hideRestOfTheSlidesSpy = env.sandbox.spy(
          impl,
          'hideRestOfTheSlides_'
        );

        impl.showSlide_(1);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[0]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[2]
        );
        expect(schedulePauseSpy).to.have.callCount(2);

        impl.showSlide_(0);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[1]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[2]
        );
        expect(schedulePauseSpy).to.have.callCount(4);

        impl.showSlide_(4);

        expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4]);

        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
          .false;
        expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[0]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[1]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.slides_[3]
        );
        expect(schedulePauseSpy).to.have.callCount(7);
      });
    });

    it('should show/hide the correct controls', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
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

        // Verify aria roles for the button
        expect(impl.nextButton_.getAttribute('role')).equal('button');
        expect(impl.prevButton_.getAttribute('role')).equal('button');
      });
    });

    it('should show focus outline and border on next and prev buttons', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        impl.showSlide_(1);

        impl.prevButton_.focus();
        expect(doc.activeElement).to.equal(impl.prevButton_);
        expect(win.getComputedStyle(impl.prevButton_).outline).to.equal(
          'rgb(255, 255, 255) solid 1px'
        );
        expect(win.getComputedStyle(impl.prevButton_).border).to.equal(
          '1px solid rgb(0, 0, 0)'
        );

        impl.nextButton_.focus();
        expect(doc.activeElement).to.equal(impl.nextButton_);
        expect(win.getComputedStyle(impl.nextButton_).outline).to.equal(
          'rgb(255, 255, 255) solid 1px'
        );
        expect(win.getComputedStyle(impl.nextButton_).border).to.equal(
          '1px solid rgb(0, 0, 0)'
        );
      });
    });

    it('should set the correct scrollLeft when there is only one slide', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;

        impl.noOfSlides_ = 1;
        impl.showSlide_(0);
        expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(0);
      });
    });

    it('should update to the right slide on scroll', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

        impl.vsync_ = {
          mutatePromise: (cb) => {
            cb();
            return {
              then: (cb2) => {
                cb2();
              },
            };
          },
          mutate: (cb) => {
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

    it('should get the correct next slide index for a scrollLeft', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
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
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const animateScrollLeftSpy = env.sandbox.spy(
          impl,
          'animateScrollLeft_'
        );

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
      return getAmpSlideScroll(null, 2).then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const animateScrollLeftSpy = env.sandbox.spy(
          impl,
          'animateScrollLeft_'
        );

        impl.customSnap_(0, 1);
        expect(animateScrollLeftSpy).to.have.been.calledWith(0, 400);

        impl.showSlide_(1);

        impl.customSnap_(400, -1);
        expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
      });
    });

    it('should handle custom elastic scroll', () => {
      return getAmpSlideScroll().then((ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const customSnapSpy = env.sandbox
          .stub(impl, 'customSnap_')
          .callsFake(() => {
            return {
              then: (cb) => {
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

    it('should handle layout measures (orientation changes)', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const getLayoutWidthStub = env.sandbox.stub(
        ampSlideScroll,
        'getLayoutWidth'
      );
      const impl = ampSlideScroll.implementation_;

      getLayoutWidthStub.returns(200);
      impl.onLayoutMeasure();
      expect(getLayoutWidthStub).to.have.been.calledOnce;
      expect(impl.slideWidth_).to.equal(200);

      // Show the first slide, make sure the scroll position is correct.
      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(200);

      // Now do a layout measure letting the component know it changed size.
      getLayoutWidthStub.returns(400);
      impl.onLayoutMeasure();
      expect(getLayoutWidthStub).to.have.callCount(2);
      expect(impl.slideWidth_).to.equal(400);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(200);

      // Make sure the scroll position is correct after layoutCallback.
      await impl.unlayoutCallback(); // cannot call layoutCallback() twice without an unlayout in between.
      await impl.layoutCallback();
      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(400);
    });

    it('should relayout the current slide on layoutCallback', () => {
      return getAmpSlideScroll().then(async (ampSlideScroll) => {
        const impl = ampSlideScroll.implementation_;
        const owners = Services.ownersForDoc(impl.element);
        const scheduleLayoutSpy_ = env.sandbox.spy(owners, 'scheduleLayout');
        impl.slideIndex_ = null;
        await impl.unlayoutCallback(); // cannot call layoutCallback() twice without an unlayout in between.
        impl.layoutCallback();
        expect(scheduleLayoutSpy_).to.have.been.calledWith(
          impl.element,
          impl.slides_[0]
        );

        impl.showSlide_(1);
        await impl.unlayoutCallback(); // cannot call layoutCallback() twice without an unlayout in between.
        impl.layoutCallback();
        expect(scheduleLayoutSpy_).to.have.been.calledWith(
          impl.element,
          impl.slides_[1]
        );
      });
    });

    describe('Looping', () => {
      it('should create container and wrappers and show initial slides', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
        });
      });

      // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
      it.skip('should show the correct slides when looping', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const owners = Services.ownersForDoc(impl.element);
          const scheduleLayoutSpy = env.sandbox.spy(owners, 'scheduleLayout');
          const schedulePreloadSpy = env.sandbox.spy(owners, 'schedulePreload');
          const hideRestOfTheSlidesSpy = env.sandbox.spy(
            impl,
            'hideRestOfTheSlides_'
          );
          const setControlsStateSpy = env.sandbox.spy(impl, 'setControlsState');

          expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('true');
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

          impl.showSlide_(1);

          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(scheduleLayoutSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[2]
          );
          expect(scheduleLayoutSpy).to.be.calledOnce;
          expect(schedulePreloadSpy).to.have.callCount(2);
          expect(impl.slideIndex_).to.equal(1);
          expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(
            impl.slideWidth_
          );
          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
          expect(hideRestOfTheSlidesSpy).to.be.calledOnce;
          expect(setControlsStateSpy).to.be.calledOnce;
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[2].getAttribute('aria-hidden')).to.equal('true');

          impl.showSlide_(0);

          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(scheduleLayoutSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[4]
          );
          expect(scheduleLayoutSpy).to.have.callCount(2);
          expect(schedulePreloadSpy).to.have.callCount(4);
          expect(impl.slideIndex_).to.equal(0);
          expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(400);
          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([4, 0, 1]);
          expect(hideRestOfTheSlidesSpy).to.have.callCount(2);
          expect(setControlsStateSpy).to.have.callCount(2);
          expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('true');
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

          impl.showSlide_(4);

          expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[3]
          );
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(scheduleLayoutSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[4]
          );
          expect(scheduleLayoutSpy).to.have.callCount(3);
          expect(schedulePreloadSpy).to.have.callCount(6);
          expect(impl.slideIndex_).to.equal(4);
          expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(
            impl.slideWidth_
          );
          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4, 0]);
          expect(hideRestOfTheSlidesSpy).to.have.callCount(3);
          expect(setControlsStateSpy).to.have.callCount(3);
          expect(impl.slides_[3].getAttribute('aria-hidden')).to.equal('true');
          expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
        });
      });

      it('show correct slides when looping with `autoplay` for 2 slides', () => {
        return getAmpSlideScroll(true, 2).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const owners = Services.ownersForDoc(impl.element);
          const scheduleLayoutSpy = env.sandbox.spy(owners, 'scheduleLayout');
          const schedulePreloadSpy = env.sandbox.spy(owners, 'schedulePreload');
          const hideRestOfTheSlidesSpy = env.sandbox.spy(
            impl,
            'hideRestOfTheSlides_'
          );
          const setControlsStateSpy = env.sandbox.spy(impl, 'setControlsState');

          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

          impl.showSlide_(1);

          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(scheduleLayoutSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(scheduleLayoutSpy).to.be.calledOnce;
          expect(schedulePreloadSpy).to.have.callCount(1);
          expect(impl.slideIndex_).to.equal(1);
          expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(
            impl.slideWidth_
          );
          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
          expect(hideRestOfTheSlidesSpy).to.be.calledOnce;
          expect(setControlsStateSpy).to.be.calledOnce;
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');

          impl.showSlide_(0);

          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(scheduleLayoutSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(schedulePreloadSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(scheduleLayoutSpy).to.have.callCount(2);
          expect(schedulePreloadSpy).to.have.callCount(2);
          expect(impl.slideIndex_).to.equal(0);
          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1]);
          expect(hideRestOfTheSlidesSpy).to.have.callCount(2);
          expect(setControlsStateSpy).to.have.callCount(2);
          expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
          expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');
        });
      });

      it('do not set `autoplay` status if `autoplay=0` specified', () => {
        return getAmpSlideScroll(false, 3, true, true, 0).then(
          (ampSlideScroll) => {
            const impl = ampSlideScroll.implementation_;
            const setupAutoplaySpy = env.sandbox.spy(impl, 'setupAutoplay_');
            expect(setupAutoplaySpy).to.not.have.been.called;
          }
        );
      });

      it('removes `autoplay` status after provided loops are made', () => {
        return getAmpSlideScroll(false, 3, true, true, 2).then(
          (ampSlideScroll) => {
            const impl = ampSlideScroll.implementation_;
            const removeAutoplaySpy = env.sandbox.spy(impl, 'removeAutoplay');
            impl.showSlide_(1);
            impl.showSlide_(2);
            expect(impl.loopsMade_).to.equal(1);
            impl.showSlide_(0);
            impl.showSlide_(1);
            impl.showSlide_(2);
            expect(impl.loopsMade_).to.equal(2);
            expect(removeAutoplaySpy).to.have.been.called;
            expect(ampSlideScroll.hasAttribute('loop')).to.be.false;
          }
        );
      });

      // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
      it.skip('should hide unwanted slides when looping', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const owners = Services.ownersForDoc(impl.element);
          const schedulePauseSpy = env.sandbox.spy(owners, 'schedulePause');
          const hideRestOfTheSlidesSpy = env.sandbox.spy(
            impl,
            'hideRestOfTheSlides_'
          );

          impl.showSlide_(1);

          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .false;

          expect(impl.slideWrappers_[0].style.order).to.equal('1');
          expect(impl.slideWrappers_[1].style.order).to.equal('2');
          expect(impl.slideWrappers_[2].style.order).to.equal('3');
          expect(impl.slideWrappers_[3].style.order).to.equal('');
          expect(impl.slideWrappers_[4].style.order).to.equal('');

          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[4]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[2]
          );
          expect(schedulePauseSpy).to.have.callCount(3);

          impl.showSlide_(0);

          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([4, 0, 1]);

          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[0].style.order).to.equal('2');
          expect(impl.slideWrappers_[1].style.order).to.equal('3');
          expect(impl.slideWrappers_[2].style.order).to.equal('');
          expect(impl.slideWrappers_[3].style.order).to.equal('');
          expect(impl.slideWrappers_[4].style.order).to.equal('1');
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[2]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[4]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(schedulePauseSpy).to.have.callCount(6);

          impl.showSlide_(4);

          expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([3, 4, 0]);

          expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be
            .false;
          expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
            .true;
          expect(impl.slideWrappers_[0].style.order).to.equal('3');
          expect(impl.slideWrappers_[1].style.order).to.equal('');
          expect(impl.slideWrappers_[2].style.order).to.equal('');
          expect(impl.slideWrappers_[3].style.order).to.equal('1');
          expect(impl.slideWrappers_[4].style.order).to.equal('2');
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[3]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[0]
          );
          expect(schedulePauseSpy).to.have.been.calledWith(
            impl.element,
            impl.slides_[1]
          );
          expect(schedulePauseSpy).to.have.callCount(9);
        });
      });

      it('should show/hide the correct controls when looping', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;

          impl.showSlide_(1);
          expect(impl.hasNext()).to.be.true;
          expect(impl.hasPrev()).to.be.true;
          expect(impl.nextButton_.classList.contains('amp-disabled')).to.be
            .false;
          expect(impl.prevButton_.classList.contains('amp-disabled')).to.be
            .false;

          impl.showSlide_(0);
          expect(impl.hasNext()).to.be.true;
          expect(impl.hasPrev()).to.be.true;
          expect(impl.nextButton_.classList.contains('amp-disabled')).to.be
            .false;
          expect(impl.prevButton_.classList.contains('amp-disabled')).to.be
            .false;

          impl.showSlide_(4);
          expect(impl.hasNext()).to.be.true;
          expect(impl.hasPrev()).to.be.true;
          expect(impl.nextButton_.classList.contains('amp-disabled')).to.be
            .false;
          expect(impl.prevButton_.classList.contains('amp-disabled')).to.be
            .false;
        });
      });

      it('should set the correct scrollLeft when there is only one slide', () => {
        return getAmpSlideScroll(true, 1).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;

          impl.noOfSlides_ = 1;
          impl.showSlide_(0);
          expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(0);
        });
      });

      it('should update to the right slide on scroll', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

          impl.vsync_ = {
            mutate: (cb) => {
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

      it('should get the correct next slide index for a scrollLeft', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
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
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const animateScrollLeftSpy = env.sandbox.spy(
            impl,
            'animateScrollLeft_'
          );

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
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

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

      // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
      it.skip('should update slide when `slide` attribute is mutated', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          expectAsyncConsoleError(/Invalid \[slide\] value:/, 1);

          const impl = ampSlideScroll.implementation_;
          const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

          impl.mutatedAttributesCallback({slide: 2});
          expect(showSlideSpy).to.have.been.calledWith(2);

          impl.mutatedAttributesCallback({slide: 0});
          expect(showSlideSpy).to.have.been.calledWith(0);

          // Don't call showSlide_() if slide is not finite.
          showSlideSpy.resetHistory();
          impl.mutatedAttributesCallback({slide: Number.POSITIVE_INFINITY});
          expect(showSlideSpy.called).to.be.false;
        });
      });

      it('should trigger `slideChange` action when user changes slides', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          const impl = ampSlideScroll.implementation_;
          const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

          impl.goCallback(-1, /* animate */ false);
          expect(triggerSpy).to.have.been.calledWith(
            ampSlideScroll,
            'slideChange',
            /* CustomEvent */ env.sandbox.match.has('detail', {index: 4}),
            ActionTrust.HIGH
          );

          impl.goCallback(1, /* animate */ false);
          expect(triggerSpy).to.have.been.calledWith(
            ampSlideScroll,
            'slideChange',
            /* CustomEvent */ env.sandbox.match.has('detail', {index: 0}),
            ActionTrust.HIGH
          );
        });
      });

      it('should fire `slideChange` DOM event with high trust when user changes slides', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          let event;
          win.document.addEventListener('slideChange', (e) => (event = e));
          const impl = ampSlideScroll.implementation_;

          impl.goCallback(-1, /* animate */ false);
          expect(win.document.eventListeners.count('slideChange')).to.equal(1);
          expect(event.data.index).to.equal(4);
          expect(event.data.actionTrust).to.equal(ActionTrust.HIGH);

          impl.goCallback(1, /* animate */ false);
          expect(win.document.eventListeners.count('slideChange')).to.equal(1);
          expect(event.data.index).to.equal(0);
          expect(event.data.actionTrust).to.equal(ActionTrust.HIGH);
        });
      });

      it('should goToSlide on action', () => {
        return getAmpSlideScroll(true).then((ampSlideScroll) => {
          expectAsyncConsoleError(/Invalid \[slide\] value:/, 4);

          const impl = ampSlideScroll.implementation_;
          const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');
          const satisfiesTrust = () => true;

          let args = {'index': '123'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.not.have.been.called;

          args = {'index': '5'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.not.have.been.called;

          args = {'index': 'ssds11'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.not.have.been.called;

          args = {'index': '-1'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.not.have.been.called;

          args = {'index': '0'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.have.been.calledWith(0);

          args = {'index': '4'};
          impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
          expect(showSlideSpy).to.have.been.calledWith(4);
        });
      });

      it('should NOT call showSlide_ before layout', () => {
        const promise = getAmpSlideScroll(true, 5, /* opt_attachToDom */ false);
        return promise.then((ampSlideScroll) => {
          // Layout happens asynchronously after attaching to DOM, so we can
          // test pre-layoutCallback logic now.
          doc.body.appendChild(ampSlideScroll);
          return ampSlideScroll.build().then(() => {
            const impl = ampSlideScroll.implementation_;
            const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');
            const satisfiesTrust = () => true;

            const args = {'index': '3'};
            impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
            expect(showSlideSpy).to.not.have.been.called;

            impl.mutatedAttributesCallback({slide: 2});
            expect(showSlideSpy).to.not.have.been.called;

            impl.onLayoutMeasure();
            ampSlideScroll.layoutCallback();

            // Should show the last slide index requested before layout.
            expect(showSlideSpy).to.have.been.calledWith(2);
            expect(showSlideSpy).to.be.calledOnce;
          });
        });
      });

      it('should NOT call showSlide_ before re-layout', () => {
        return getAmpSlideScroll(false, 5, false).then((ampSlideScroll) => {
          doc.body.appendChild(ampSlideScroll);
          return ampSlideScroll.build().then(() => {
            const impl = ampSlideScroll.implementation_;
            const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');
            const satisfiesTrust = () => true;

            // Test that showSlide_ due to goToSlide(index=1) is not called before
            // layout.
            let args = {'index': '1'};
            impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
            expect(showSlideSpy).to.not.have.been.called;

            // Test that showSlide_ is called after layout.
            impl.onLayoutMeasure();
            ampSlideScroll.layoutCallback();

            expect(showSlideSpy).to.have.been.calledWith(1);
            expect(showSlideSpy).to.be.calledOnce;

            // Unlayout
            showSlideSpy.resetHistory();
            impl.unlayoutCallback();

            // Test that showSlide_ due to goToSlide(index=4) is not called before
            // layout.
            args = {'index': '4'};
            impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
            expect(showSlideSpy).to.not.have.been.called;

            // Test that showSlide_ is called after layout.
            impl.onLayoutMeasure();
            ampSlideScroll.layoutCallback();

            expect(showSlideSpy).to.have.been.calledWith(4);
            expect(showSlideSpy).to.be.calledOnce;
          });
        });
      });
    });

    describe('button titles', () => {
      function getNextTitle(el) {
        return el
          .querySelector('.amp-carousel-button-next')
          .getAttribute('title');
      }

      function getPrevTitle(el) {
        return el
          .querySelector('.amp-carousel-button-prev')
          .getAttribute('title');
      }

      describe('when not looping', () => {
        it('should have the correct values on the first index', function* () {
          const el = yield getAmpSlideScroll(false, 3);
          expect(getPrevTitle(el)).to.equal(
            'Previous item in carousel (1 of 3)'
          );
          expect(getNextTitle(el)).to.equal('Next item in carousel (2 of 3)');
        });

        it('should have the correct values on the last index', function* () {
          const el = yield getAmpSlideScroll(false, 3);
          el.implementation_.showSlide_(2);
          expect(getPrevTitle(el)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(el)).to.equal('Next item in carousel (3 of 3)');
        });
      });

      describe('when looping', () => {
        it('should have the correct values on the first index', function* () {
          const el = yield getAmpSlideScroll(true, 3);
          expect(getPrevTitle(el)).to.equal(
            'Previous item in carousel (3 of 3)'
          );
          expect(getNextTitle(el)).to.equal('Next item in carousel (2 of 3)');
        });

        it('should have the correct values on the last index', function* () {
          const el = yield getAmpSlideScroll(true, 3);
          el.implementation_.showSlide_(2);
          expect(getPrevTitle(el)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(el)).to.equal('Next item in carousel (1 of 3)');
        });
      });
    });

    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
      const element = createElementWithAttributes(
        env.win.document,
        'amp-carousel',
        {
          'type': 'slides',
          'width': '400',
          'height': '300',
        }
      );
      env.win.document.body.appendChild(element);
      env.sandbox.spy(element, 'enqueAction');
      env.sandbox.stub(element, 'getDefaultActionAlias');
      await whenUpgradedToCustomElement(element);
      await element.whenBuilt();

      action.execute(
        element,
        'goToSlide',
        null,
        'source',
        'caller',
        'event',
        ActionTrust.HIGH
      );
      expect(element.enqueAction).to.be.calledWith(
        env.sandbox.match({
          actionEventType: '?',
          args: null,
          caller: 'caller',
          event: 'event',
          method: 'goToSlide',
          node: element,
          source: 'source',
          trust: ActionTrust.HIGH,
        })
      );

      const userErrorStub = env.sandbox.stub(user(), 'error');
      action.execute(
        element,
        'toggleAutoplay',
        null,
        'source',
        'caller',
        'event',
        ActionTrust.HIGH
      );
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.match(
        /"AMP-CAROUSEL.toggleAutoplay" is not allowlisted/
      );
    });
  }
);
