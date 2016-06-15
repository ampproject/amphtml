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
require('../amp-carousel');
import {createIframePromise} from '../../../../testing/iframe';
import {toggleExperiment} from '../../../../src/experiments';

describe('SlideScroll', () => {
  let sandbox;

  beforeEach(() => {
    toggleExperiment(window, 'amp-slidescroll', true);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpSlideScroll() {
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

      for (let i = 0; i < 5; i++) {
        const img = document.createElement('amp-img');
        ampSlideScroll.setAttribute('src', imgUrl);
        ampSlideScroll.setAttribute('width', '400');
        ampSlideScroll.setAttribute('height', '300');
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

  it('should create container and wrappers and show intial slides', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      expect(
          ampSlideScroll.getElementsByClassName('-amp-slides-container').length)
              .to.equal(1);
      expect(
          ampSlideScroll.querySelectorAll(
            '.-amp-slides-container > .-amp-slide-item').length).to.equal(5);
      const impl = ampSlideScroll.implementation_;
      expect(impl.slideWrappers_[0].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains('-amp-slide-item-show'))
          .to.be.true;
    });
  });

  it('should show the correct slide', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const hideRestOfTheSlidesSpy = sandbox.spy(impl, 'hideRestOfTheSlides_');
      const setControlsStateSpy = sandbox.spy(impl, 'setControlsState');

      impl.showSlide_(-1);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;


      impl.showSlide_(5);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;

      impl.showSlide_(impl.slideIndex_);
      expect(updateInViewportSpy).to.not.have.been.called;
      expect(scheduleLayoutSpy).to.not.have.been.called;
      expect(hideRestOfTheSlidesSpy).to.not.have.been.called;
      expect(setControlsStateSpy).to.not.have.been.called;


      impl.showSlide_(1);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], true);
      expect(updateInViewportSpy.callCount).to.equal(2);
      expect(impl.slideWrappers_[0].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(scheduleLayoutSpy.callCount).to.equal(3);
      expect(impl.slideIndex_).to.equal(1);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(1);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(1);
      expect(setControlsStateSpy.callCount).to.equal(1);

      impl.showSlide_(0);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[1], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], true);
      expect(updateInViewportSpy.callCount).to.equal(4);
      expect(impl.slideWrappers_[0].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[1].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[2].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(scheduleLayoutSpy.callCount).to.equal(5);
      expect(impl.slideIndex_).to.equal(0);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(0);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(0);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(2);
      expect(setControlsStateSpy.callCount).to.equal(2);

      impl.showSlide_(4);

      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[0], false);
      expect(updateInViewportSpy).to.have.been.calledWith(
          impl.slides_[4], true);
      expect(updateInViewportSpy.callCount).to.equal(6);
      expect(impl.slideWrappers_[3].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(impl.slideWrappers_[4].classList.contains('-amp-slide-item-show'))
          .to.be.true;
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[3]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.slides_[4]);
      expect(scheduleLayoutSpy.callCount).to.equal(7);
      expect(impl.slideIndex_).to.equal(4);
      expect(impl.slidesContainer_./*OK*/scrollLeft).to.equal(impl.slideWidth_);
      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(4);
      expect(hideRestOfTheSlidesSpy.callCount).to.equal(3);
      expect(setControlsStateSpy.callCount).to.equal(3);
    });
  });

  it('should hide the unwatned slides slide', () => {
    return getAmpSlideScroll().then(obj => {
      const ampSlideScroll = obj.ampSlideScroll;
      const impl = ampSlideScroll.implementation_;
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const hideRestOfTheSlidesSpy = sandbox.spy(impl, 'hideRestOfTheSlides_');

      impl.showSlide_(1);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(1);
      expect(impl.slideWrappers_[3].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(impl.slideWrappers_[4].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(schedulePauseSpy).to.not.have.been.called;
      expect(schedulePauseSpy.callCount).to.equal(0);

      impl.showSlide_(0);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(0);

      expect(impl.slideWrappers_[2].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(impl.slideWrappers_[3].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(impl.slideWrappers_[4].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[2]);
      expect(schedulePauseSpy.callCount).to.equal(1);

      impl.showSlide_(4);

      expect(hideRestOfTheSlidesSpy).to.have.been.calledWith(4);

      expect(impl.slideWrappers_[0].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(impl.slideWrappers_[1].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(impl.slideWrappers_[2].classList.contains('-amp-slide-item-show'))
          .to.be.false;
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[0]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.slides_[1]);
      expect(schedulePauseSpy.callCount).to.equal(3);
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

});
