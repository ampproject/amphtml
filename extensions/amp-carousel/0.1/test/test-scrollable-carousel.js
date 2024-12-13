import '../amp-carousel';
import {createDocument as createWorkerDomDoc} from '@ampproject/worker-dom/dist/server-lib.mjs';

import {ActionTrust_Enum} from '#core/constants/action-constants';
import {createElementWithAttributes} from '#core/dom';
import {whenUpgradedToCustomElement} from '#core/dom/amp-element-helpers';

import {Services} from '#service';
import {ActionService} from '#service/action-impl';

import {user} from '#utils/log';

import {getDeterministicOuterHTML} from '#testing/helpers';

import {buildDom} from '../build-dom';
import {AmpScrollableCarousel} from '../scrollable-carousel';

describes.realWin(
  'test-scrollable-carousel',
  {
    amp: {
      extensions: ['amp-carousel'],
      runtimeOn: true,
    },
  },
  (env) => {
    let win,
      doc,
      owners,
      schedulePauseSpy,
      scheduleLayoutSpy,
      schedulePreloadSpy;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
      env.iframe.width = '300';
      env.iframe.height = '200';

      owners = Services.ownersForDoc(doc);
      schedulePauseSpy = env.sandbox.spy(owners, 'schedulePause');
      scheduleLayoutSpy = env.sandbox.spy(owners, 'scheduleLayout');
      schedulePreloadSpy = env.sandbox.spy(owners, 'schedulePreload');
    });

    function getAmpScrollableCarousel(addToDom = true, doc = env.win.document) {
      const imgUrl =
        'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
        'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';

      const carouselElement = doc.createElement('amp-carousel');
      carouselElement.setAttribute('width', '300');
      carouselElement.setAttribute('height', '100');

      const slideCount = 7;
      for (let i = 0; i < slideCount; i++) {
        const img = doc.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '120');
        img.setAttribute('height', '100');
        img.style.setProperty('width', '120px');
        img.style.setProperty('height', '100px');
        img.setAttribute('id', `img-${i}`);
        carouselElement.appendChild(img);
      }

      if (!addToDom) {
        return Promise.resolve(carouselElement);
      }

      doc.body.appendChild(carouselElement);
      return carouselElement
        .buildInternal()
        .then(() => {
          carouselElement.updateLayoutBox({
            top: 0,
            left: 0,
            width: 300,
            height: 100,
          });
          return carouselElement.layoutCallback();
        })
        .then(() => carouselElement);
    }

    it(
      'should initialize correctly: create container, build initial slides ' +
        'and show control buttons',
      async () => {
        const carousel = await getAmpScrollableCarousel();
        const impl = await carousel.getImpl();

        // create container
        expect(
          carousel.getElementsByClassName(
            'i-amphtml-scrollable-carousel-container'
          ).length
        ).to.equal(1);
        const container = carousel.getElementsByClassName(
          'i-amphtml-scrollable-carousel-container'
        )[0];
        const containerStyle = win.getComputedStyle(container, null);

        expect(containerStyle.getPropertyValue('overflow-x')).to.equal('auto');
        expect(containerStyle.getPropertyValue('overflow-y')).to.equal(
          'hidden'
        );
        expect(containerStyle.getPropertyValue('white-space')).to.equal(
          'nowrap'
        );

        // build child slides
        const carouselSlideEls =
          container.getElementsByClassName('amp-carousel-slide');
        expect(carouselSlideEls.length).to.equal(7);
        expect(carouselSlideEls[0]).to.have.display('inline-block');

        // show control buttons correctly
        const {nextButton_: nextBtn, prevButton_: prevBtn} = impl.controls_;
        expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
        expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
        // Controls are hidden from screen readers as they do not provide
        // any functionality for scrollable carousel.
        // ATs see this is a scrolling div and can scroll it as user navigates
        // items just fine (unlike type=slide which requires next/prev)
        expect(prevBtn.getAttribute('role')).equal('presentation');
        expect(nextBtn.getAttribute('role')).equal('presentation');
      }
    );

    it('should properly style controls; focusable but not visible', async () => {
      const carousel = await getAmpScrollableCarousel();
      const impl = await carousel.getImpl();
      const container = carousel.getElementsByClassName(
        'i-amphtml-scrollable-carousel-container'
      )[0];
      const carouselSlideEls =
        container.getElementsByClassName('amp-carousel-slide');
      const {nextButton_: nextBtn, prevButton_: prevBtn} = impl.controls_;

      // show control buttons correctly
      expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
      expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
      // Explicitly check if buttons don't have visibility hidden or display none
      expect(prevBtn.tabIndex).to.equal(-1);
      expect(nextBtn.tabIndex).to.equal(0);
      expect(isScreenReaderHidden(prevBtn)).to.be.false;
      expect(isScreenReaderHidden(nextBtn)).to.be.false;

      nextBtn.focus();
      expect(doc.activeElement).to.equal(nextBtn);

      // Scroll to end
      for (let i = 0; i < carouselSlideEls.length - 1; i++) {
        impl.go(1, /*animate*/ false);
      }
      // Explicitly check if buttons don't have visibility hidden or display none
      expect(prevBtn.classList.contains('amp-disabled')).to.be.false;
      expect(nextBtn.classList.contains('amp-disabled')).to.be.true;
      expect(prevBtn.tabIndex).to.equal(0);
      expect(nextBtn.tabIndex).to.equal(-1);
      expect(isScreenReaderHidden(prevBtn)).to.be.false;
      expect(isScreenReaderHidden(nextBtn)).to.be.false;
      expect(doc.activeElement).to.equal(nextBtn);

      prevBtn.focus();

      for (let i = 0; i < carouselSlideEls.length - 1; i++) {
        impl.go(-1, /*animate*/ false);
      }
      // Explicitly check if buttons don't have visibility hidden or display none
      expect(prevBtn.classList.contains('amp-disabled')).to.be.true;
      expect(nextBtn.classList.contains('amp-disabled')).to.be.false;
      expect(prevBtn.tabIndex).to.equal(-1);
      expect(nextBtn.tabIndex).to.equal(0);
      expect(isScreenReaderHidden(prevBtn)).to.be.false;
      expect(isScreenReaderHidden(nextBtn)).to.be.false;
      expect(doc.activeElement).to.equal(prevBtn);
    });

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip(
      'should behave correctly when clicking on next button and the ' +
        'space to the right is MORE than containerWidth',
      async () => {
        const carousel = await getAmpScrollableCarousel();
        const impl = await carousel.getImpl();

        // click on the next button
        impl.go(1, /*animate*/ false);

        // scroll to the correct position
        expect(impl.container_./*OK*/ scrollLeft).to.equal(300);

        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[0]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[1]
        );

        // schedule layout for new slides
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[2]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[3]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[4]
        );

        // preload slides in viewport
        expect(schedulePreloadSpy).to.have.callCount(3);
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[4]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[5]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[6]
        );

        // set control buttons correctly
        expect(impl.hasPrev()).to.be.true;
        expect(impl.hasNext()).to.be.true;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
      }
    );

    describe('buildDom', () => {
      it('buildDom and buildCallback should result in the same outerHTML', async () => {
        env.sandbox
          .stub(Services, 'inputFor')
          .returns({onMouseDetected: () => {}});

        const el1 = await getAmpScrollableCarousel(/* addToDom */ false);
        const el2 = el1.cloneNode(/* deep */ true);
        const impl = new AmpScrollableCarousel(el1);
        impl.setupBehavior_ = () => {};
        await impl.buildCallback();
        buildDom(el2);

        expect(el2.outerHTML).equal(el1.outerHTML);
      });

      it('buildDom should behave same in browser and in WorkerDOM', async () => {
        const browserCarousel = await getAmpScrollableCarousel(
          /* addToDom */ false,
          env.win.doc
        );
        const workerCarousel = await getAmpScrollableCarousel(
          /* addToDom */ false,
          createWorkerDomDoc()
        );

        buildDom(browserCarousel);
        buildDom(workerCarousel);

        const browserHtml = getDeterministicOuterHTML(browserCarousel);
        const workerDomHtml = getDeterministicOuterHTML(workerCarousel);
        expect(workerDomHtml).equal(browserHtml);
      });

      it('buildCallback should assign ivars even when server rendered', async () => {
        const el1 = await getAmpScrollableCarousel(/* addToDom */ false);
        buildDom(el1);
        el1.setAttribute('i-amphtml-ssr', '');
        const impl = new AmpScrollableCarousel(el1);
        impl.setupBehavior_ = () => {};
        await impl.buildCallback();

        expect(impl.cells_).length(7);
        expect(impl.container_).ok;
      });

      it('buildDom should throw if invalid server rendered dom', async () => {
        const carousel = await getAmpScrollableCarousel(/* addToDom */ false);
        carousel.setAttribute('i-amphtml-ssr', '');
        expect(() => buildDom(carousel)).throws(/Invalid server render/);
      });

      it('buildDom should not modify dom for server rendered element', async () => {
        const carousel = await getAmpScrollableCarousel(/* addToDom */ false);
        buildDom(carousel);
        carousel.setAttribute('i-amphtml-ssr', '');

        const before = carousel.outerHTML;
        buildDom(carousel);
        const after = carousel.outerHTML;

        expect(before).equal(after);
      });
    });

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip(
      'should behave correctly when clicking on next button and the ' +
        'space to the right is LESS than containerWidth',
      async () => {
        const carousel = await getAmpScrollableCarousel();
        const impl = await carousel.getImpl();

        // click on the next button the first time
        impl.go(1, /*animate*/ false);

        // click on the next button the second time
        impl.go(1, /*animate*/ false);

        // scroll to the correct position
        // note the correct scrollLeft is not 600 (300 * 2) but 588 (888 - 300)
        expect(impl.container_./*OK*/ scrollLeft).to.equal(588);

        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[2]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[3]
        );

        // schedule layout for new slides
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[4]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[5]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[6]
        );

        // preload slides in viewport
        expect(schedulePreloadSpy).to.have.not.been.called;

        // set control buttons correctly
        expect(impl.hasPrev()).to.be.true;
        expect(impl.hasNext()).to.be.false;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.true;
      }
    );

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip(
      'should behave correctly when clicking on previous button and the ' +
        'space to the left is MORE than containerWidth',
      async () => {
        const carousel = await getAmpScrollableCarousel();
        const impl = await carousel.getImpl();

        // click on the next button twice to reach the right end
        // scrollLeft after second click is 588
        impl.go(1, /*animate*/ false);
        impl.go(1, /*animate*/ false);

        // click on the previous button
        impl.go(-1, /*animate*/ false);

        // scroll to the correct position
        expect(impl.container_./*OK*/ scrollLeft).to.equal(288);

        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[5]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[6]
        );

        // schedule layout for new slides
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[2]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[3]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[4]
        );

        // preload slides in viewport
        expect(schedulePreloadSpy).to.have.callCount(3);
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[0]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[1]
        );
        expect(schedulePreloadSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[2]
        );

        // set control buttons correctly
        expect(impl.hasPrev()).to.be.true;
        expect(impl.hasNext()).to.be.true;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
      }
    );

    // TODO(#17197): This test triggers sinonjs/sinon issues 1709 and 1321.
    it.skip(
      'should behave correctly when clicking on previous button and the ' +
        'space to the left is LESS than containerWidth',
      async () => {
        const carousel = await getAmpScrollableCarousel();
        const impl = await carousel.getImpl();

        // click on the next button twice to reach the right end and click on
        // the previous button once, scrollLeft after third click is 288
        impl.go(1, /*animate*/ false);
        impl.go(1, /*animate*/ false);
        impl.go(-1, /*animate*/ false);

        // click on the previous button
        impl.go(-1, /*animate*/ false);

        // scroll to the correct position
        expect(impl.container_./*OK*/ scrollLeft).to.equal(0);

        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[3]
        );
        expect(schedulePauseSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[4]
        );

        // schedule layout for new slides
        expect(scheduleLayoutSpy).to.have.callCount(3);
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[0]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[1]
        );
        expect(scheduleLayoutSpy).to.have.been.calledWith(
          impl.element,
          impl.cells_[2]
        );

        // preload slides in viewport
        expect(schedulePreloadSpy).to.have.not.been.called;

        // set control buttons correctly
        expect(impl.hasPrev()).to.be.false;
        expect(impl.hasNext()).to.be.true;
        expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.true;
        expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
      }
    );

    it('should allow default actions in email documents', async () => {
      env.win.document.documentElement.setAttribute('amp4email', '');
      const action = new ActionService(env.ampdoc, env.win.document);
      env.sandbox.stub(Services, 'actionServiceForDoc').returns(action);
      const element = createElementWithAttributes(
        env.win.document,
        'amp-carousel',
        {
          'type': 'carousel',
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

/**
 *
 * @param {Element} element
 * @returns {boolean}
 */
function isScreenReaderHidden(element) {
  const computedStyle = getComputedStyle(element);
  return (
    computedStyle.visibility === 'hidden' || computedStyle.display === 'none'
  );
}
