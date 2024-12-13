import '../amp-carousel';
import {ActionTrust_Enum} from '#core/constants/action-constants';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import * as Listen from '#utils/event-helper';
import {getDetail, listenOncePromise} from '#utils/event-helper';
import {user} from '#utils/log';

import {CarouselEvents} from '../../../amp-base-carousel/0.1/carousel-events';

/**
 * @fileoverview Some simple tests for amp-carousel. Most of the functionality
 *    for changing slides, resizing, etc should be handled by the base
 *    implementation via amp-base-carousel's tests.
 */

/**
 * @param {!Element} el
 * @param {number=} index An index to wait for.
 * @return {!Promise<undefined>}
 */
async function afterIndexUpdate(el, index) {
  const event = await listenOncePromise(el, CarouselEvents.INDEX_CHANGE);
  const impl = await el.getImpl(false);
  await impl.mutateElement(() => {});
  await impl.mutateElement(() => {});

  if (index != undefined && getDetail(event)['index'] != index) {
    return afterIndexUpdate(el, index);
  }
}

function getNextButton(el) {
  return el.querySelector('.amp-carousel-button-next');
}

function getPrevButton(el) {
  return el.querySelector('.amp-carousel-button-prev');
}

function getNextTitle(el) {
  return getNextButton(el).getAttribute('title');
}

function getPrevTitle(el) {
  return getPrevButton(el).getAttribute('title');
}

function getSlideWrappers(el) {
  return el.querySelectorAll(
    '.i-amphtml-carousel-scroll > .i-amphtml-carousel-slide-item'
  );
}

function isScreenReaderHidden(element) {
  const computedStyle = getComputedStyle(element);
  return (
    computedStyle.visibility === 'hidden' || computedStyle.display === 'none'
  );
}

describes.realWin(
  'amp-carousel-0.2 type slides',
  {
    amp: {
      extensions: ['amp-carousel:0.2'],
    },
  },
  (env) => {
    let win;
    let doc;
    let container;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '1000';
      env.iframe.height = '1000';
      container = doc.createElement('div');
      doc.body.appendChild(container);
    });

    afterEach(() => {
      doc.body.removeChild(container);
    });

    async function getCarousel({
      dir = null,
      loop = false,
      slideCount = 5,
    } = {}) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';
      const carousel = doc.createElement('amp-carousel');
      carousel.setAttribute('type', 'slides');
      carousel.setAttribute('width', '400');
      carousel.setAttribute('height', '300');
      carousel.style.position = 'relative';
      carousel.setAttribute('controls', '');
      if (loop) {
        carousel.setAttribute('loop', '');
      }
      if (dir) {
        carousel.setAttribute('dir', dir);
      }

      for (let i = 0; i < slideCount; i++) {
        const img = doc.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '400');
        img.setAttribute('height', '300');
        // See https://github.com/ampproject/amphtml/issues/3989
        img.style.display = 'inline';
        if (i == 0) {
          img.setAttribute('data-slide-id', 'slide-id');
        }
        carousel.appendChild(img);
      }

      container.appendChild(carousel);
      await carousel.buildInternal();
      carousel.updateLayoutBox({
        top: 0,
        left: 0,
        width: 400,
        height: 300,
      });
      await carousel.layoutCallback();
      await afterIndexUpdate(carousel);

      return carousel;
    }

    it('should create container and wrappers and show initial slides', async () => {
      const carousel = await getCarousel({loop: false});
      const slideWrappers = getSlideWrappers(carousel);

      expect(
        carousel.getElementsByClassName('i-amphtml-carousel-scroll').length
      ).to.equal(1);
      expect(slideWrappers.length).to.equal(5);
      expect(
        carousel.getElementsByClassName('amp-carousel-slide').length
      ).to.equal(5);
      expect(
        carousel
          .querySelector('.i-amphtml-carousel-scroll')
          .getAttribute('aria-live')
      ).to.equal('polite');
      expect(slideWrappers[4].getAttribute('aria-hidden')).to.equal('true');
      expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('false');
      expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
    });

    it('should style snap for container and content correctly', async () => {
      const carousel = await getCarousel({loop: true});
      const slideWrappers = getSlideWrappers(carousel);
      expect(slideWrappers.length).to.equal(5);

      const slides = carousel.querySelector(
        '.i-amphtml-carousel-scroll'
      ).children;

      // Ensure that the spacers have the snap property and not the
      // slides.
      for (let i = 0; i < slides.length; i++) {
        const slide = slides[i];
        if (slide.classList.contains('i-amphtml-carousel-spacer')) {
          // type=slides is always center alignment.
          expect(slide.style.scrollSnapAlign).to.equal('center');
        } else {
          expect(slide.style.scrollSnapAlign).to.equal('');
          expect(slide.children[0].style.scrollSnapAlign).to.equal('');
        }
      }
    });

    it('should show focus outline and border on next and prev buttons', async () => {
      const carousel = await getCarousel({loop: false});
      const impl = await carousel.getImpl();

      impl.interactionNext();
      await afterIndexUpdate(carousel);

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

    describe('loop', () => {
      it('should go to the correct slide clicking next', async () => {
        const carousel = await getCarousel({loop: true});
        const slideWrappers = getSlideWrappers(carousel);

        getNextButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[2].getAttribute('aria-hidden')).to.equal('true');
      });

      it('should go to the correct slide when navigating with keyboard', async () => {
        const carousel = await getCarousel({loop: true});
        const slideWrappers = getSlideWrappers(carousel);
        const kbEnterEvent = new KeyboardEvent('keydown', {'key': 'Enter'});

        getNextButton(carousel).dispatchEvent(kbEnterEvent);
        await afterIndexUpdate(carousel);
        expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[2].getAttribute('aria-hidden')).to.equal('true');

        getPrevButton(carousel).dispatchEvent(kbEnterEvent);
        await afterIndexUpdate(carousel);
        expect(slideWrappers[0].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[2].getAttribute('aria-hidden')).to.equal('true');
      });

      it('should go to the correct slide clicking prev', async () => {
        const carousel = await getCarousel({loop: true});
        const slideWrappers = getSlideWrappers(carousel);

        getPrevButton(carousel).click();
        await afterIndexUpdate(carousel);
        expect(slideWrappers[3].getAttribute('aria-hidden')).to.equal('true');
        expect(slideWrappers[4].getAttribute('aria-hidden')).to.equal('false');
        expect(slideWrappers[1].getAttribute('aria-hidden')).to.equal('true');
      });
    });

    describe('non-loop', () => {
      it('should disable the prev button when at the start', async () => {
        const carousel = await getCarousel({loop: false});

        expect(getPrevButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });

      it('should disable the next button when at the end', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();

        impl.goToSlide(4);
        await afterIndexUpdate(carousel);

        expect(getNextButton(carousel).getAttribute('aria-disabled')).to.equal(
          'true'
        );
      });

      it('should correctly style controls; focusable but not visible', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();

        getNextButton(carousel).focus();
        impl.goToSlide(4);
        await afterIndexUpdate(carousel);
        expect(getNextButton(carousel).getAttribute('tabIndex')).to.equal('-1');
        expect(getPrevButton(carousel).getAttribute('tabIndex')).to.equal('0');
        expect(isScreenReaderHidden(getPrevButton(carousel))).to.be.false;
        expect(isScreenReaderHidden(getNextButton(carousel))).to.be.false;
        expect(doc.activeElement).to.equal(getNextButton(carousel));

        getPrevButton(carousel).focus();
        impl.goToSlide(0);
        await afterIndexUpdate(carousel);
        expect(getNextButton(carousel).getAttribute('tabIndex')).to.equal('0');
        expect(getPrevButton(carousel).getAttribute('tabIndex')).to.equal('-1');
        expect(isScreenReaderHidden(getPrevButton(carousel))).to.be.false;
        expect(isScreenReaderHidden(getNextButton(carousel))).to.be.false;
        expect(doc.activeElement).to.equal(getPrevButton(carousel));
      });
    });

    describe('slideChange event', () => {
      it('should not dispatch on initial render', async () => {
        const eventSpy = env.sandbox.spy();
        container.addEventListener('slideChange', eventSpy);
        await getCarousel({loop: false});

        expect(eventSpy).to.have.not.been.called;
      });

      it('should dispatch event with index and actionTrust when changing slides', async () => {
        let event;
        container.addEventListener('slideChange', (e) => {
          expect(event).to.be.undefined;
          event = e;
        });
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();

        impl.interactionNext();
        await afterIndexUpdate(carousel);

        expect(event.data.index).to.equal(1);
        expect(event.data.actionTrust).to.equal(ActionTrust_Enum.HIGH);
      });
    });

    describe('goToSlide action', () => {
      it('should propagate high trust', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: 1},
          trust: ActionTrust_Enum.HIGH,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust_Enum.HIGH
        );
      });

      it('should propagate low trust', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: 1},
          trust: ActionTrust_Enum.LOW,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust_Enum.LOW
        );
      });

      it('should allow string-valued index', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        impl.executeAction({
          method: 'goToSlide',
          args: {index: '1'},
          trust: ActionTrust_Enum.LOW,
          satisfiesTrust: () => true,
        });
        await afterIndexUpdate(carousel);

        expect(triggerSpy).to.have.been.calledWith(
          carousel,
          'slideChange',
          /* CustomEvent */ env.sandbox.match.has('detail', {index: 1}),
          ActionTrust_Enum.LOW
        );
      });

      it('should cause error with invalid index', async () => {
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();
        const triggerSpy = env.sandbox.spy(impl.action_, 'trigger');

        try {
          allowConsoleError(() => {
            impl.executeAction({
              method: 'goToSlide',
              args: {index: 'one'},
              trust: ActionTrust_Enum.LOW,
              satisfiesTrust: () => true,
            });
          });
          await afterIndexUpdate(carousel);
        } catch (expected) {
          expect(triggerSpy).to.not.have.been.called;
          return;
        }
        expect.fail();
      });

      it('should be allowlisted in email', async () => {
        env.win.document.documentElement.setAttribute('amp4email', '');
        const action = new ActionService(env.ampdoc, env.win.document);
        env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
        const carousel = await getCarousel({loop: false});
        env.sandbox.spy(carousel, 'enqueAction');
        env.sandbox.stub(carousel, 'getDefaultActionAlias');
        await whenUpgradedToCustomElement(carousel);
        await carousel.whenBuilt();

        action.execute(
          carousel,
          'goToSlide',
          {},
          'source',
          'caller',
          'event',
          ActionTrust_Enum.HIGH
        );

        expect(carousel.enqueAction).to.be.calledWith(
          env.sandbox.match({
            actionEventType: '?',
            args: {},
            caller: 'caller',
            event: 'event',
            method: 'goToSlide',
            node: carousel,
            source: 'source',
            trust: ActionTrust_Enum.HIGH,
          })
        );
      });
    });

    describe('toggleAutoplay action', () => {
      it('should not be allowlisted in email', async () => {
        env.win.document.documentElement.setAttribute('amp4email', '');
        const action = new ActionService(env.ampdoc, env.win.document);
        env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
        const carousel = await getCarousel({loop: false});
        const userErrorStub = env.sandbox.stub(user(), 'error');
        env.sandbox.stub(carousel, 'getDefaultActionAlias');
        await whenUpgradedToCustomElement(carousel);
        await carousel.whenBuilt();

        action.execute(
          carousel,
          'toggleAutoplay',
          {},
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
    });

    describe('layout direction', () => {
      it('should use the initial rtl context if not specified', async () => {
        container.setAttribute('dir', 'rtl');

        const carousel = await getCarousel({loop: false});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} =
          getNextButton(carousel).getBoundingClientRect();
        const {left: prevLeft} =
          getPrevButton(carousel).getBoundingClientRect();

        expect(firstLeft).to.be.greaterThan(secondLeft);
        expect(prevLeft).to.be.greaterThan(nextLeft);
      });

      it("should use the carousel's rtl direction", async () => {
        container.setAttribute('dir', 'ltr');

        const carousel = await getCarousel({loop: false, dir: 'rtl'});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} =
          getNextButton(carousel).getBoundingClientRect();
        const {left: prevLeft} =
          getPrevButton(carousel).getBoundingClientRect();

        expect(firstLeft).to.be.greaterThan(secondLeft);
        expect(prevLeft).to.be.greaterThan(nextLeft);
      });

      it('should use the initial ltr context if not specified', async () => {
        container.setAttribute('dir', 'ltr');

        const carousel = await getCarousel({loop: false});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} =
          getNextButton(carousel).getBoundingClientRect();
        const {left: prevLeft} =
          getPrevButton(carousel).getBoundingClientRect();

        expect(secondLeft).to.be.greaterThan(firstLeft);
        expect(nextLeft).to.be.greaterThan(prevLeft);
      });

      it("should use the carousel's ltr direction", async () => {
        container.setAttribute('dir', 'rtl');

        const carousel = await getCarousel({loop: false, dir: 'ltr'});
        const slideWrappers = getSlideWrappers(carousel);

        const {left: firstLeft} = slideWrappers[0].getBoundingClientRect();
        const {left: secondLeft} = slideWrappers[1].getBoundingClientRect();
        const {left: nextLeft} =
          getNextButton(carousel).getBoundingClientRect();
        const {left: prevLeft} =
          getPrevButton(carousel).getBoundingClientRect();

        expect(secondLeft).to.be.greaterThan(firstLeft);
        expect(nextLeft).to.be.greaterThan(prevLeft);
      });
    });

    describe('button titles', () => {
      describe('when not loop', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel({loop: false, slideCount: 3});

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (1 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel({loop: false, slideCount: 3});
          const impl = await carousel.getImpl();

          impl.goToSlide(2);
          await afterIndexUpdate(carousel);

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (3 of 3)'
          );
        });
      });

      describe('when loop', () => {
        it('should have the correct values on the first index', async () => {
          const carousel = await getCarousel({loop: true, slideCount: 3});

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (3 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (2 of 3)'
          );
        });

        it('should have the correct values on the last index', async () => {
          const carousel = await getCarousel({loop: true, slideCount: 3});
          const impl = await carousel.getImpl();

          impl.goToSlide(2);
          await afterIndexUpdate(carousel);

          expect(getPrevTitle(carousel)).to.equal(
            'Previous item in carousel (2 of 3)'
          );
          expect(getNextTitle(carousel)).to.equal(
            'Next item in carousel (1 of 3)'
          );
        });
      });
    });

    describe('event propogation', () => {
      it('should add touchmove event if in viewer', async () => {
        env.sandbox.stub(Services, 'viewerForDoc').returns({
          isEmbedded: () => true,
        });
        const listenSpy = env.sandbox.spy(Listen, 'listen');
        const carousel = await getCarousel({loop: false});
        const impl = await carousel.getImpl();

        expect(listenSpy.lastCall.args[0]).to.equal(impl.scrollContainer_);
        expect(listenSpy.lastCall.args[1]).to.equal('touchmove');
        expect(listenSpy.args.length).to.equal(5);
      });

      it('should not add touchmove event if not in the viewer', async () => {
        env.sandbox.stub(Services, 'viewerForDoc').returns({
          isEmbedded: () => false,
        });
        const listenSpy = env.sandbox.spy(Listen, 'listen');
        await getCarousel({loop: false});

        expect(listenSpy.args.length).to.equal(4);
      });
    });
  }
);
