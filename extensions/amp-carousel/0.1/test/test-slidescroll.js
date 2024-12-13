import '../amp-carousel';
import {createDocument as createWorkerDomDoc} from '@ampproject/worker-dom/dist/server-lib.mjs';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {user} from '#utils/log';

import {getDeterministicOuterHTML} from '#testing/helpers';
import {installResizeObserverStub} from '#testing/resize-observer-stub';

import {buildDom} from '../build-dom';
import {AmpSlideScroll} from '../slidescroll';

describes.realWin(
  'SlideScroll',
  {
    amp: {
      extensions: ['amp-carousel'],
    },
  },
  (env) => {
    const SHOW_CLASS = 'i-amphtml-slide-item-show';
    let win, doc;
    let resizeObserverStub;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '1000';
      env.iframe.height = '1000';
      resizeObserverStub = installResizeObserverStub(env.sandbox, win);
    });

    /**
     * @param {boolean=} opt_hasLooping
     * @param {number=} opt_slideCount
     * @param {boolean=} opt_attachToDom
     * @param {boolean=} opt_hasAutoplay
     * @param {boolean=} opt_autoplayLoops
     * @param {Document=} opt_doc
     * @return {Element}
     */
    function getAmpSlideScroll(
      opt_hasLooping,
      opt_slideCount = 5,
      opt_attachToDom = true,
      opt_hasAutoplay = false,
      opt_autoplayLoops,
      doc = env.win.document
    ) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const ampSlideScroll = doc.createElement('amp-carousel');
      ampSlideScroll.setAttribute('type', 'slides');
      ampSlideScroll.setAttribute('width', '400');
      ampSlideScroll.setAttribute('height', '300');
      ampSlideScroll.style.setProperty('position', 'relative');
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
        img.style.setProperty('display', 'inline');
        if (i == 0) {
          img.setAttribute('data-slide-id', 'slide-id');
        }
        ampSlideScroll.appendChild(img);
      }

      if (opt_attachToDom) {
        doc.body.appendChild(ampSlideScroll);
        return ampSlideScroll
          .buildInternal()
          .then(() => {
            resizeObserverStub.notifySync({
              target: ampSlideScroll,
              contentRect: {width: 400, height: 300},
            });
            return ampSlideScroll.layoutCallback();
          })
          .then(() => ampSlideScroll);
      }
      return Promise.resolve(ampSlideScroll);
    }

    /**
     * @param {Element} element
     * @returns {boolean}
     */
    function isScreenReaderHidden(element) {
      const computedStyle = getComputedStyle(element);
      return (
        computedStyle.visibility === 'hidden' ||
        computedStyle.display === 'none'
      );
    }

    it('should create container and wrappers and show initial slides', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
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
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');
    });

    it('should go to the correct slide on button click', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

      const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

      impl.go(1);
      expect(showSlideSpy).to.have.been.calledWith(1);
      expect(showSlideSpy).to.be.calledOnce;

      impl.go(-1);
      expect(showSlideSpy).to.have.been.calledWith(0);
      expect(showSlideSpy).to.have.callCount(2);

      impl.go(0);
      expect(showSlideSpy).to.have.callCount(2);
    });

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip('should show the correct slide', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

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
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be.true;
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
      expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-change', {
        'fromSlide': 'slide-id',
        'toSlide': '1',
      });
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('true');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[2].getAttribute('aria-hidden')).to.equal('true');

      expect(impl.showSlide_(0)).to.be.true;
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be.false;
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
      expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-change', {
        'fromSlide': '1',
        'toSlide': 'slide-id',
      });
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[1].getAttribute('aria-hidden')).to.equal('true');

      expect(impl.showSlide_(4)).to.be.true;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be.true;
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
      expect(analyticsEventSpy).to.have.been.calledWith('amp-carousel-change', {
        'fromSlide': 'slide-id',
        'toSlide': '4',
      });
      expect(impl.slides_[3].getAttribute('aria-hidden')).to.equal('true');
      expect(impl.slides_[4].getAttribute('aria-hidden')).to.equal('false');
      expect(impl.slides_[0].getAttribute('aria-hidden')).to.equal(null);
    });

    it('should hide the unwanted slides', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

      const owners = Services.ownersForDoc(impl.element);
      const schedulePauseSpy = env.sandbox.spy(owners, 'schedulePause');
      const hideRestOfTheSlidesSpy = env.sandbox.spy(
        impl,
        'hideRestOfTheSlides_'
      );

      impl.showSlide_(1);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith([0, 1, 2]);
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be.false;
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
      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be.false;
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

      expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[2].classList.contains(SHOW_CLASS)).to.be.false;
      expect(impl.slideWrappers_[3].classList.contains(SHOW_CLASS)).to.be.true;
      expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be.true;
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

    it('should show/hide the correct controls', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
      const controls = impl.controls_;
      const {nextButton_: nextBtn, prevButton_: prevBtn} = controls;

      impl.showSlide_(1);
      expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
      expect(prevBtn.classList.contains('amp-disabled')).to.be.false;

      impl.showSlide_(0);
      expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
      expect(prevBtn.classList.contains('amp-disabled')).to.be.true;

      impl.showSlide_(4);
      expect(nextBtn.classList.contains('amp-disabled')).to.be.true;
      expect(prevBtn.classList.contains('amp-disabled')).to.be.false;

      // Verify aria roles for the button
      expect(nextBtn.getAttribute('role')).equal('button');
      expect(prevBtn.getAttribute('role')).equal('button');
    });

    it('should properly style controls; focusable but not visible', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
      const controls = impl.controls_;
      const {nextButton_: nextBtn, prevButton_: prevBtn} = controls;

      impl.showSlide_(0);
      expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
      expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
      expect(prevBtn.tabIndex).to.equal(-1);
      expect(nextBtn.tabIndex).to.equal(0);
      expect(isScreenReaderHidden(prevBtn)).to.be.false;
      expect(isScreenReaderHidden(nextBtn)).to.be.false;

      nextBtn.focus();
      expect(doc.activeElement).to.equal(nextBtn);

      impl.showSlide_(4);
      expect(nextBtn.classList.contains('amp-disabled')).to.be.true;
      expect(prevBtn.classList.contains('amp-disabled')).to.be.false;
      expect(prevBtn.tabIndex).to.equal(0);
      expect(nextBtn.tabIndex).to.equal(-1);
      expect(isScreenReaderHidden(prevBtn)).to.be.false;
      expect(isScreenReaderHidden(nextBtn)).to.be.false;
      expect(doc.activeElement).to.equal(nextBtn);
    });

    it('should show focus outline and border on next and prev buttons', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
      const controls = impl.controls_;
      const {nextButton_: nextBtn, prevButton_: prevBtn} = controls;

      impl.showSlide_(1);

      prevBtn.focus();
      expect(doc.activeElement).to.equal(prevBtn);
      expect(win.getComputedStyle(prevBtn).outline).to.equal(
        'rgb(255, 255, 255) solid 1px'
      );
      expect(win.getComputedStyle(prevBtn).border).to.equal(
        '1px solid rgb(0, 0, 0)'
      );

      nextBtn.focus();
      expect(doc.activeElement).to.equal(nextBtn);
      expect(win.getComputedStyle(nextBtn).outline).to.equal(
        'rgb(255, 255, 255) solid 1px'
      );
      expect(win.getComputedStyle(nextBtn).border).to.equal(
        '1px solid rgb(0, 0, 0)'
      );
    });

    it('should set the correct scrollLeft when there is only one slide', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

      impl.noOfSlides_ = 1;
      impl.showSlide_(0);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(0);
    });

    it('should update to the right slide on scroll', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

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

    it('should get the correct next slide index for a scrollLeft', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

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

    it('should custom snap to the correct slide', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

      const animateScrollLeftSpy = env.sandbox.spy(impl, 'animateScrollLeft_');

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

    it('should custom snap to the correct slide - special case', async () => {
      const ampSlideScroll = await getAmpSlideScroll(null, 2);
      const impl = await ampSlideScroll.getImpl();

      const animateScrollLeftSpy = env.sandbox.spy(impl, 'animateScrollLeft_');

      impl.customSnap_(0, 1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(0, 400);

      impl.showSlide_(1);

      impl.customSnap_(400, -1);
      expect(animateScrollLeftSpy).to.have.been.calledWith(400, 0);
    });

    it('should handle custom elastic scroll', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

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

    it('should not elastic scroll on iOS scrolling', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
      impl.isIos_ = true;

      const customSnapSpy = env.sandbox.spy(impl, 'handleCustomElasticScroll_');

      impl.scrollHandler_();
      expect(customSnapSpy).to.not.be.called;
    });

    it('should not elastic scroll on Safari scrolling', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();
      impl.isSafari_ = true;

      const customSnapSpy = env.sandbox.spy(impl, 'handleCustomElasticScroll_');

      impl.scrollHandler_();
      expect(customSnapSpy).to.not.be.called;
    });

    it('should handle layout measures (orientation changes)', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

      resizeObserverStub.notifySync({
        target: ampSlideScroll,
        contentRect: {width: 200, height: 400},
      });
      expect(impl.slideWidth_).to.equal(200);

      // Show the first slide, make sure the scroll position is correct.
      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(200);

      // Now do a layout measure letting the component know it changed size.
      resizeObserverStub.notifySync({
        target: ampSlideScroll,
        contentRect: {width: 400, height: 200},
      });
      expect(impl.slideWidth_).to.equal(400);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(200);

      // Make sure the scroll position is correct after layoutCallback.
      await impl.unlayoutCallback(); // cannot call layoutCallback() twice without an unlayout in between.
      await impl.layoutCallback();
      impl.showSlide_(1);
      expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(400);
    });

    it('should relayout the current slide on layoutCallback', async () => {
      const ampSlideScroll = await getAmpSlideScroll();
      const impl = await ampSlideScroll.getImpl();

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

    describe('Looping', () => {
      it('should create container and wrappers and show initial slides', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        expect(impl.slideWrappers_[4].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[0].classList.contains(SHOW_CLASS)).to.be
          .true;
        expect(impl.slideWrappers_[1].classList.contains(SHOW_CLASS)).to.be
          .true;
      });

      // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
      it.skip('should show the correct slides when looping', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

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

      it('show correct slides when looping with `autoplay` for 2 slides', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true, 2);
        const impl = await ampSlideScroll.getImpl();

        const owners = Services.ownersForDoc(impl.element);
        const scheduleLayoutSpy = env.sandbox.spy(owners, 'scheduleLayout');
        const schedulePreloadSpy = env.sandbox.spy(owners, 'schedulePreload');
        const hideRestOfTheSlidesSpy = env.sandbox.spy(
          impl,
          'hideRestOfTheSlides_'
        );
        const setControlsStateSpy = env.sandbox.spy(
          impl.controls_,
          'setControlsState'
        );

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

      it('do not set `autoplay` status if `autoplay=0` specified', async () => {
        const ampSlideScroll = await getAmpSlideScroll(false, 3, true, true, 0);
        const impl = await ampSlideScroll.getImpl();
        const setupAutoplaySpy = env.sandbox.spy(impl, 'setupAutoplay_');
        expect(setupAutoplaySpy).to.not.have.been.called;
      });

      it('removes `autoplay` status after provided loops are made', async () => {
        const ampSlideScroll = await getAmpSlideScroll(false, 3, true, true, 2);
        const impl = await ampSlideScroll.getImpl();

        const removeAutoplaySpy = env.sandbox.spy(impl, 'removeAutoplay_');
        impl.showSlide_(1);
        impl.showSlide_(2);
        expect(impl.loopsMade_).to.equal(1);
        impl.showSlide_(0);
        impl.showSlide_(1);
        impl.showSlide_(2);
        expect(impl.loopsMade_).to.equal(2);
        expect(removeAutoplaySpy).to.have.been.called;
        expect(ampSlideScroll.hasAttribute('loop')).to.be.false;
      });

      it('sets the correct scrollLeft for looping carousel', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true, 7, false, true);
        doc.body.appendChild(ampSlideScroll);
        await ampSlideScroll.buildInternal();
        const impl = await ampSlideScroll.getImpl();
        ampSlideScroll.layoutCallback();
        expect(impl.slideWidth_).to.not.be.null;
        expect(impl.slideWidth_).to.be.greaterThan(0);

        // I.e. the scrollContainer is centered (not at 0)
        expect(impl.slidesContainer_.scrollLeft).to.equal(impl.slideWidth_);
      });

      it('should hide unwanted slides when looping', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

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

      it('should show/hide the correct controls when looping', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();
        const controls = impl.controls_;
        const {nextButton_: nextBtn, prevButton_: prevBtn} = controls;

        impl.showSlide_(1);
        expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.false;

        impl.showSlide_(0);
        expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.false;

        impl.showSlide_(4);
        expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.false;
      });

      it('should set the correct scrollLeft when there is only one slide', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true, 1);
        const impl = await ampSlideScroll.getImpl();

        impl.noOfSlides_ = 1;
        impl.showSlide_(0);
        expect(impl.slidesContainer_./*OK*/ scrollLeft).to.equal(0);
      });

      it('should update to the right slide on scroll', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

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

      it('should get the correct next slide index for a scrollLeft', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

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

      it('should custom snap to the correct slide', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

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

      it('should go to the correct slide on button click', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');

        impl.go(-1);
        expect(showSlideSpy).to.have.been.calledWith(4);
        expect(showSlideSpy).to.be.calledOnce;

        impl.go(1);
        expect(showSlideSpy).to.have.been.calledWith(0);
        expect(showSlideSpy).to.have.callCount(2);

        impl.go(1);
        expect(showSlideSpy).to.have.been.calledWith(1);
        expect(showSlideSpy).to.have.callCount(3);
      });

      it('should update slide when `slide` attribute is mutated', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();
        expectAsyncConsoleError(/Invalid \[slide\] value:/, 1);

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

      it('should trigger `slideChange` action when user changes slides', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.go(-1, /* animate */ false);
        expect(triggerSpy).to.have.been.calledWith(
          ampSlideScroll,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 4}),
          ActionTrust_Enum.HIGH
        );

        impl.go(1, /* animate */ false);
        expect(triggerSpy).to.have.been.calledWith(
          ampSlideScroll,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 0}),
          ActionTrust_Enum.HIGH
        );
      });

      it('should fire `slideChange` DOM event with high trust when user changes slides', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        let event;
        win.document.addEventListener('slideChange', (e) => (event = e));

        impl.go(-1, /* animate */ false);
        expect(win.document.eventListeners.count('slideChange')).to.equal(1);
        expect(event.data.index).to.equal(4);
        expect(event.data.actionTrust).to.equal(ActionTrust_Enum.HIGH);

        impl.go(1, /* animate */ false);
        expect(win.document.eventListeners.count('slideChange')).to.equal(1);
        expect(event.data.index).to.equal(0);
        expect(event.data.actionTrust).to.equal(ActionTrust_Enum.HIGH);
      });

      it('should goToSlide on action', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        expectAsyncConsoleError(/Invalid \[slide\] value:/, 4);

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

      it('should handle carousel snapping & hiding race', async () => {
        const ampSlideScroll = await getAmpSlideScroll(true);
        const impl = await ampSlideScroll.getImpl();

        // simluate carousel hidding
        impl.slideWidth_ = 0;

        // simulate snapping
        expect(impl.getNextSlideIndex_(0)).to.equal(0);
      });

      it('should NOT call showSlide_ before layout', async () => {
        const ampSlideScroll = await getAmpSlideScroll(
          true,
          5,
          /* opt_attachToDom */ false
        );

        // Layout happens asynchronously after attaching to DOM, so we can
        // test pre-layoutCallback logic now.
        doc.body.appendChild(ampSlideScroll);
        await ampSlideScroll.buildInternal();

        const impl = await ampSlideScroll.getImpl();
        const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');
        const satisfiesTrust = () => true;

        const args = {'index': '3'};
        impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
        expect(showSlideSpy).to.not.have.been.called;

        impl.mutatedAttributesCallback({slide: 2});
        expect(showSlideSpy).to.not.have.been.called;

        ampSlideScroll.layoutCallback();

        // Should show the last slide index requested before layout.
        expect(showSlideSpy).to.have.been.calledWith(2);
        expect(showSlideSpy).to.be.calledOnce;
      });

      it('should NOT call showSlide_ before re-layout', async () => {
        const ampSlideScroll = await getAmpSlideScroll(false, 5, false);
        doc.body.appendChild(ampSlideScroll);
        await ampSlideScroll.buildInternal();

        const impl = await ampSlideScroll.getImpl();
        const showSlideSpy = env.sandbox.spy(impl, 'showSlide_');
        const satisfiesTrust = () => true;

        // Test that showSlide_ due to goToSlide(index=1) is not called before
        // layout.
        let args = {'index': '1'};
        impl.executeAction({method: 'goToSlide', args, satisfiesTrust});
        expect(showSlideSpy).to.not.have.been.called;

        // Test that showSlide_ is called after layout.
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
        ampSlideScroll.layoutCallback();

        expect(showSlideSpy).to.have.been.calledWith(4);
        expect(showSlideSpy).to.be.calledOnce;
      });
    });

    describe('Snap Styling', () => {
      let platform;

      beforeEach(() => {
        platform = Services.platformFor(win);
      });

      it('should add disabled CSS snap class for iOS 10.3', async () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'getIosVersionString').returns('10.3');
        const el = await getAmpSlideScroll(false, 3);
        const slidesContainer = el.querySelector('.i-amphtml-slides-container');
        expect(
          slidesContainer.classList.contains('i-amphtml-slidescroll-no-snap')
        ).to.be.true;
      });

      it('shoud not contain disabled snap class for non iOS 10.3', async () => {
        env.sandbox.stub(platform, 'isIos').returns(true);
        env.sandbox.stub(platform, 'getIosVersionString').returns('10.4');
        const el = await getAmpSlideScroll(false, 3);
        const slidesContainer = el.querySelector('.i-amphtml-slides-container');
        expect(
          slidesContainer.classList.contains('i-amphtml-slidescroll-no-snap')
        ).to.be.false;
      });

      it('shoud add disabled CSS snap class for for non iOS', async () => {
        env.sandbox.stub(platform, 'isIos').returns(false);
        env.sandbox.stub(platform, 'getIosVersionString').returns('10.4');
        const el = await getAmpSlideScroll(false, 3);
        const slidesContainer = el.querySelector('.i-amphtml-slides-container');
        expect(
          slidesContainer.classList.contains('i-amphtml-slidescroll-no-snap')
        ).to.be.true;
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

        it('should have the correct values on the last index', async () => {
          const el = await getAmpSlideScroll(false, 3);
          const impl = await el.getImpl();
          impl.showSlide_(2);
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

        it('should have the correct values on the last index', async () => {
          const el = await getAmpSlideScroll(true, 3);
          const impl = await el.getImpl();
          impl.showSlide_(2);
          expect(getPrevTitle(el)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(el)).to.equal('Next item in carousel (1 of 3)');
        });
      });
    });

    describe('buildDom', () => {
      it('buildDom and buildCallback should result in the same outerHTML', async () => {
        const el1 = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false
        );
        const el2 = el1.cloneNode(/* deep */ true);
        const impl = new AmpSlideScroll(el1);
        impl.setupSlideBehavior_ = () => {};
        await impl.buildCallback();
        buildDom(el2);

        expect(el2.outerHTML).equal(el1.outerHTML);
      });

      it('buildDom should behave same in browser and in WorkerDOM', async () => {
        const browserCarousel = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false
        );
        const workerCarousel = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false,
          /* opt_hasAutoPlay */ undefined,
          /* opt_autoplayLoops */ undefined,
          createWorkerDomDoc()
        );
        buildDom(browserCarousel);
        buildDom(workerCarousel);

        const browserHtml = getDeterministicOuterHTML(browserCarousel);
        const workerDomHtml = getDeterministicOuterHTML(workerCarousel);
        expect(workerDomHtml).equal(browserHtml);
      });

      it('buildCallback should assign ivars even when server rendered', async () => {
        const el1 = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false
        );
        buildDom(el1);
        el1.setAttribute('i-amphtml-ssr', '');
        const impl = new AmpSlideScroll(el1);
        impl.setupSlideBehavior_ = () => {};
        await impl.buildCallback();

        expect(impl.slides_).length(5);
        expect(impl.slideWrappers_).length(5);
        expect(impl.slidesContainer_).ok;
      });

      it('buildDom should throw if invalid server rendered dom', async () => {
        const carousel = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false
        );
        carousel.setAttribute('i-amphtml-ssr', '');
        expect(() => buildDom(carousel)).throws(/Invalid server render/);
      });

      it('buildDom should not modify dom for server rendered element', async () => {
        const carousel = await getAmpSlideScroll(
          /* hasLooping */ true,
          /* slideCount */ undefined,
          /* attachToDom */ false
        );
        buildDom(carousel);
        carousel.setAttribute('i-amphtml-ssr', '');

        const before = carousel.outerHTML;
        buildDom(carousel);
        const after = carousel.outerHTML;

        expect(before).equal(after);
      });
    });
  }
);

describes.realWin(
  'SlideScroll with runtimeOn',
  {
    amp: {
      extensions: ['amp-carousel'],
      runtimeOn: true,
    },
  },
  (env) => {
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
        ActionTrust_Enum.HIGH
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
          trust: ActionTrust_Enum.HIGH,
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
        ActionTrust_Enum.HIGH
      );
      expect(userErrorStub).to.be.calledOnce;
      expect(userErrorStub.args[0][1]).to.match(
        /"AMP-CAROUSEL.toggleAutoplay" is not allowlisted/
      );
    });
  }
);
