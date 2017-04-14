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
import {createIframePromise} from '../../../../testing/iframe';
import * as sinon from 'sinon';

describes.realWin('test-scrollable-carousel', {ampCss: true}, env => {
  let sandbox;
  let win;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    win = env.win;
  });

  afterEach(() => {
    sandbox.restore();
  });

  function getAmpScrollableCarousel() {
    return createIframePromise().then(iframe => {
      iframe.width = '300';
      iframe.height = '200';
      const imgUrl = 'https://lh3.googleusercontent.com/5rcQ32ml8E5ONp9f9-' +
          'Rf78IofLb9QjS5_0mqsY1zEFc=w300-h200-no';

      const carouselElement = iframe.doc.createElement('amp-carousel');
      carouselElement.setAttribute('width', '300');
      carouselElement.setAttribute('height', '100');

      const slideCount = 7;
      for (let i = 0; i < slideCount; i++) {
        const img = document.createElement('amp-img');
        img.setAttribute('src', imgUrl);
        img.setAttribute('width', '120');
        img.setAttribute('height', '100');
        img.style.width = '120px';
        img.style.height = '100px';
        img.id = 'img-' + i;
        carouselElement.appendChild(img);
      }

      return iframe.addElement(carouselElement);
    });
  }

  it('should initialize correctly: create container, build initial slides ' +
      'and show control buttons', () => {
    return getAmpScrollableCarousel().then(carousel => {
      const impl = carousel.implementation_;

      // create container
      expect(carousel.getElementsByClassName(
          'i-amphtml-scrollable-carousel-container').length).to.equal(1);
      const container = carousel.getElementsByClassName(
          'i-amphtml-scrollable-carousel-container')[0];
      const containerStyle = win.getComputedStyle(container, null);

      expect(containerStyle.getPropertyValue('overflow-x')).to.equal('auto');
      expect(containerStyle.getPropertyValue('overflow-y')).to.equal('hidden');
      expect(containerStyle.getPropertyValue('white-space')).to.equal('nowrap');

      // build child slides
      const carouselSlideEls =
        container.getElementsByClassName('amp-carousel-slide');
      const slideStyle = win.getComputedStyle(carouselSlideEls[0], null);
      expect(carouselSlideEls.length).to.equal(7);
      expect(slideStyle.getPropertyValue('display')).to.equal('inline-block');

      // show control buttons correctly
      expect(impl.hasPrev()).to.be.false;
      expect(impl.hasNext()).to.be.true;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.true;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;

    });
  });

  it('should behave correctly when clicking on next button and the space ' +
      'to the right is MORE than containerWidth', () => {
    return getAmpScrollableCarousel().then(carousel => {
      const impl = carousel.implementation_;
      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');

      // click on the next button
      impl.goCallback(1, /*animate*/ false);

      // scroll to the correct position
      expect(impl.container_./*OK*/scrollLeft).to.equal(300);

      // load new slides in viewport
      expect(updateInViewportSpy).to.have.callCount(5);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[2], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[3], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[4], true);

      // unload and pause old slides in viewport
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[0], false);
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[1], false);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[0]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[1]);

      // schedule layout for new slides
      expect(scheduleLayoutSpy).to.have.callCount(3);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[2]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[3]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[4]);

      // preload slides in viewport
      expect(schedulePreloadSpy).to.have.callCount(3);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[4]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[5]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[6]);

      // set control buttons correctly
      expect(impl.hasPrev()).to.be.true;
      expect(impl.hasNext()).to.be.true;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
    });
  });

  it('should behave correctly when clicking on next button and the space ' +
      'to the right is LESS than containerWidth', () => {
    return getAmpScrollableCarousel().then(carousel => {
      const impl = carousel.implementation_;

      // click on the next button the first time
      impl.goCallback(1, /*animate*/ false);

      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');

      // click on the next button the second time
      impl.goCallback(1, /*animate*/ false);

      // scroll to the correct position
      // note the correct scrollLeft is not 600 (300 * 2) but 588 (888 - 300)
      expect(impl.container_./*OK*/scrollLeft).to.equal(588);

      // load new slides in viewport
      expect(updateInViewportSpy).to.have.callCount(5);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[4], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[5], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[6], true);

      // unload and pause old slides in viewport
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[2], false);
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[3], false);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[2]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[3]);

      // schedule layout for new slides
      expect(scheduleLayoutSpy).to.have.callCount(3);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[4]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[5]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[6]);

      // preload slides in viewport
      expect(schedulePreloadSpy).to.have.not.been.called;

      // set control buttons correctly
      expect(impl.hasPrev()).to.be.true;
      expect(impl.hasNext()).to.be.false;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.true;
    });
  });

  it('should behave correctly when clicking on previous button and the space ' +
      'to the left is MORE than containerWidth', () => {
    return getAmpScrollableCarousel().then(carousel => {
      const impl = carousel.implementation_;

      // click on the next button twice to reach the right end
      // scrollLeft after second click is 588
      impl.goCallback(1, /*animate*/ false);
      impl.goCallback(1, /*animate*/ false);

      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');

      // click on the previous button
      impl.goCallback(-1, /*animate*/ false);

      // scroll to the correct position
      expect(impl.container_./*OK*/scrollLeft).to.equal(288);

      // load new slides in viewport
      expect(updateInViewportSpy).to.have.callCount(5);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[2], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[3], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[4], true);

      // unload and pause old slides in viewport
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[5], false);
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[6], false);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[5]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[6]);

      // schedule layout for new slides
      expect(scheduleLayoutSpy).to.have.callCount(3);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[2]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[3]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[4]);

      // preload slides in viewport
      expect(schedulePreloadSpy).to.have.callCount(3);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[0]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[1]);
      expect(schedulePreloadSpy).to.have.been.calledWith(impl.cells_[2]);

      // set control buttons correctly
      expect(impl.hasPrev()).to.be.true;
      expect(impl.hasNext()).to.be.true;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.false;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
    });
  });

  it('should behave correctly when clicking on previous button and the space ' +
      'to the left is LESS than containerWidth', () => {
    return getAmpScrollableCarousel().then(carousel => {
      const impl = carousel.implementation_;

      // click on the next button twice to reach the right end and click on
      // the previous button once, scrollLeft after third click is 288
      impl.goCallback(1, /*animate*/ false);
      impl.goCallback(1, /*animate*/ false);
      impl.goCallback(-1, /*animate*/ false);

      const updateInViewportSpy = sandbox.spy(impl, 'updateInViewport');
      const schedulePauseSpy = sandbox.spy(impl, 'schedulePause');
      const scheduleLayoutSpy = sandbox.spy(impl, 'scheduleLayout');
      const schedulePreloadSpy = sandbox.spy(impl, 'schedulePreload');

      // click on the previous button
      impl.goCallback(-1, /*animate*/ false);

      // scroll to the correct position
      expect(impl.container_./*OK*/scrollLeft).to.equal(0);

      // load new slides in viewport
      expect(updateInViewportSpy).to.have.callCount(5);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[0], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[1], true);
      expect(updateInViewportSpy).to.have.been.calledWith(impl.cells_[2], true);

      // unload and pause old slides in viewport
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[3], false);
      expect(updateInViewportSpy).to.have.been
          .calledWith(impl.cells_[4], false);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[3]);
      expect(schedulePauseSpy).to.have.been.calledWith(impl.cells_[4]);

      // schedule layout for new slides
      expect(scheduleLayoutSpy).to.have.callCount(3);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[0]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[1]);
      expect(scheduleLayoutSpy).to.have.been.calledWith(impl.cells_[2]);

      // preload slides in viewport
      expect(schedulePreloadSpy).to.have.not.been.called;

      // set control buttons correctly
      expect(impl.hasPrev()).to.be.false;
      expect(impl.hasNext()).to.be.true;
      expect(impl.prevButton_.classList.contains('amp-disabled')).to.be.true;
      expect(impl.nextButton_.classList.contains('amp-disabled')).to.be.false;
    });
  });
});
