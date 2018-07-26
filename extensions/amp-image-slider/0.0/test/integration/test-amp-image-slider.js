/**
 * Copyright 2018 The AMP HTML Authors. All Rights Reserved.
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

import {Deferred} from '../../../../../src/utils/promise';
import {poll} from '../../../../../testing/iframe';
import {toggleExperiment} from '../../../../../src/experiments';

const config = describe.configure().ifNewChrome();
config.run('draggable amp-image-slider', function() {
  this.timeout(10000);

  const dragSliderBody = `
    <amp-image-slider id="slider" layout="responsive" width="1000" height="500">
      <amp-img before src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
      <amp-img after src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
      <div before class="label">BEFORE</div>
      <div after class="label">AFTER</div>
    </amp-image-slider>
  `;

  const hoverSliderBody = `
    <amp-image-slider id="slider" type="hover"
        layout="responsive" width="1000" height="500">
      <amp-img before src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
      <amp-img after src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
      <div before class="label">BEFORE</div>
      <div after class="label">AFTER</div>
    </amp-image-slider>
  `;

  const css = `
  .label {
    color: white;
    border: 4px solid white;
    padding: 1em;
    font-family: Arial, Helvetica, sans-serif;
    box-shadow: 2px 2px 27px 5px rgba(0,0,0,0.75);
  }
  `;

  const experiments = ['amp-image-slider'];
  const extensions = ['amp-image-slider'];

  describes.integration('default type', {
    body: dragSliderBody,
    css,
    extensions,
    experiments,
  }, env => {
    let win;
    let doc;
    let slider;
    let sliderImpl;
    let rect;

    function waitForImageSlider() {
      return poll('wait for amp-image-slider to complete', () => {
        win = env.win;
        doc = win.document;

        const sliders = doc.getElementsByTagName('amp-image-slider');
        if (sliders.length === 0) {
          return false;
        }

        slider = sliders[0];
        sliderImpl = slider.implementation_;

        if (!sliderImpl) {
          return false;
        }

        return sliderImpl.isEventRegistered_ &&
            sliderImpl.container_ && sliderImpl.bar_;
      });
    }

    function injectAnimationDeferred() {
      const deferred = new Deferred();
      sliderImpl.deferred = deferred;
      const origAnimateUpdatePositions =
          Object.getPrototypeOf(sliderImpl).animateUpdatePositions;
      sliderImpl.animateUpdatePositions = function(toPercentage) {
        origAnimateUpdatePositions.call(this, toPercentage)
            .then(function() {
              // Notice that we are ref-ing to the deferred in this scope
              // This action is deliberate s.t. we can override .deferred
              // of implementation on the fly without impacting the original
              // deferred that here we intend to resolve
              deferred.resolve();
            });
      };
    }

    function createFakeEvent(type, x, y) {
      const event = new CustomEvent(type);
      event.clientX = x;
      event.clientY = y;
      event.pageX = x;
      event.pageY = y;
      event.touches = [{
        pageX: x,
        pageY: y,
      }];
      return event;
    }

    function calibrateSlider() {
      rect = slider.getBoundingClientRect();
    }

    function prep() {
      return waitForImageSlider()
          .then(injectAnimationDeferred)
          .then(calibrateSlider);
    }

    // A bunch of expects to check if the slider has slide to
    // where we intended
    function expectByBarLeftPos(leftPos) {
      expect(sliderImpl.bar_.getBoundingClientRect().left)
          .to.equal(leftPos);
      expect(sliderImpl.leftMask_.getBoundingClientRect().right)
          .to.equal(leftPos);
      // amp-imgs should stay where they are
      expect(sliderImpl.leftAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
      expect(sliderImpl.rightAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
    }

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-image-slider', true, false);
    });

    it('should animate moving bar to position on click', () => {
      let leftQuarterPos, centerPos;
      return prep()
          .then(() => {
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const clickEvent =
                createFakeEvent(
                    'click',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);
            injectAnimationDeferred();
          })
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            const clickEvent =
                createFakeEvent(
                    'click',
                    centerPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    it('should animate moving bar to position on touch', () => {
      let leftQuarterPos, centerPos;
      return prep()
          .then(() => {
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const clickEvent =
                createFakeEvent(
                    'touchend',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);
            injectAnimationDeferred();
          })
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            const clickEvent =
                createFakeEvent(
                    'touchend',
                    centerPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    it('should animate moving bar to position on click, ' +
      'while abort to follow latest', () => {
      let leftQuarterPos, rightQuarterPos, clickEvent;
      return prep()
          .then(() => {
            leftQuarterPos = rect.left + 0.25 * rect.width;
            clickEvent =
                createFakeEvent(
                    'click',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            rightQuarterPos = rect.left + 0.75 * rect.width;
            clickEvent =
                createFakeEvent(
                    'click',
                    rightQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should animate moving bar to position on touch, ' +
      'while abort to follow latest', () => {
      let leftQuarterPos, rightQuarterPos, clickEvent;
      return prep()
          .then(() => {
            leftQuarterPos = rect.left + 0.25 * rect.width;
            clickEvent =
                createFakeEvent(
                    'touchend',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            rightQuarterPos = rect.left + 0.75 * rect.width;
            clickEvent =
                createFakeEvent(
                    'touchend',
                    rightQuarterPos,
                    0
                );
            slider.dispatchEvent(clickEvent);
            return sliderImpl.deferred.promise;
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow mouse drag', () => {
      let mouseDownEvent, mouseMoveEvent, mouseUpEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      let barButton_;
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            barButton_ = sliderImpl.barButton_;

            // Initiate mousedown, no move expected
            mouseDownEvent = createFakeEvent(
                'mousedown',
                centerPos,
                0
            );
            barButton_.dispatchEvent(mouseDownEvent);
            expectByBarLeftPos(centerPos);

            // Mouse button is still down, move to somewhere on slider
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(leftQuarterPos);

            // Mouse button is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightBeyondPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rect.right);

            // Mouse button is still down, move back to inside the slider
            // The bar position should still be updated
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Release mouse button
            mouseUpEvent = createFakeEvent(
                'mouseup',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseUpEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow touch drag', () => {
      let touchStartEvent, touchMoveEvent, touchEndEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      let barButton_, container_;
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            barButton_ = sliderImpl.barButton_;
            container_ = sliderImpl.container_;

            // Initiate touchStart, no move expected
            touchStartEvent = createFakeEvent(
                'touchstart',
                centerPos,
                0
            );
            barButton_.dispatchEvent(touchStartEvent);
            expectByBarLeftPos(centerPos);

            // Touch is still down, move to somewhere on slider
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(leftQuarterPos);

            // Touch is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightBeyondPos,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rect.right);

            // Touch is still down, move back to inside the slider
            // The bar position should still be updated
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightQuarterPos,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Release touch
            touchEndEvent = createFakeEvent(
                'touchend',
                rightQuarterPos,
                0
            );
            container_.dispatchEvent(touchEndEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow mouse drag, with minor offset on drag start', () => {
      let mouseDownEvent, mouseMoveEvent, mouseUpEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      let barButton_;
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            barButton_ = sliderImpl.barButton_;

            // Initiate mousedown, no move expected
            mouseDownEvent = createFakeEvent(
                'mousedown',
                centerPos - 1,
                0
            );
            barButton_.dispatchEvent(mouseDownEvent);
            expectByBarLeftPos(centerPos);

            // Mouse button is still down, move to somewhere on slider
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos - 1,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(leftQuarterPos);

            // Mouse button is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightBeyondPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rect.right);

            // Mouse button is still down, move back to inside the slider
            // The bar position should still be updated
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightQuarterPos - 1,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Release mouse button
            mouseUpEvent = createFakeEvent(
                'mouseup',
                rightQuarterPos - 1,
                0
            );
            win.dispatchEvent(mouseUpEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos - 1,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            expectByBarLeftPos(rightQuarterPos);
          });
    });


    it('should follow touch drag, with minor offset on drag start', () => {
      let touchStartEvent, touchMoveEvent, touchEndEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      let barButton_, container_;
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            barButton_ = sliderImpl.barButton_;
            container_ = sliderImpl.container_;

            // Initiate touchStart, no move expected
            touchStartEvent = createFakeEvent(
                'touchstart',
                centerPos - 1,
                0
            );
            barButton_.dispatchEvent(touchStartEvent);
            expectByBarLeftPos(centerPos);

            // Touch is still down, move to somewhere on slider
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos - 1,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(leftQuarterPos);

            // Touch is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightBeyondPos,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rect.right);

            // Touch is still down, move back to inside the slider
            // The bar position should still be updated
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightQuarterPos - 1,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Release touch
            touchEndEvent = createFakeEvent(
                'touchend',
                rightQuarterPos - 1,
                0
            );
            container_.dispatchEvent(touchEndEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos - 1,
                0
            );
            container_.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);
          });
    });
  });

  describes.integration('hover type', {
    body: hoverSliderBody,
    css,
    extensions,
    experiments,
  }, env => {
    let win;
    let doc;
    let slider;
    let sliderImpl;
    let rect;

    function waitForImageSlider() {
      return poll('wait for amp-image-slider to complete', () => {
        win = env.win;
        doc = win.document;

        const sliders = doc.getElementsByTagName('amp-image-slider');
        if (sliders.length === 0) {
          return false;
        }

        slider = sliders[0];
        sliderImpl = slider.implementation_;

        if (!sliderImpl) {
          return false;
        }

        return sliderImpl.isEventRegistered_ &&
            sliderImpl.container_ && sliderImpl.bar_;
      });
    }

    function injectAnimationDeferred() {
      const deferred = new Deferred();
      sliderImpl.deferred = deferred;
      const origAnimateUpdatePositions =
          Object.getPrototypeOf(sliderImpl).animateUpdatePositions;
      sliderImpl.animateUpdatePositions = function(toPercentage) {
        origAnimateUpdatePositions.call(this, toPercentage)
            .then(function() {
              // Notice that we are ref-ing to the deferred in this scope
              // This action is deliberate s.t. we can override .deferred
              // of implementation on the fly without impacting the original
              // deferred that here we intend to resolve
              deferred.resolve();
            });
      };
    }

    function createFakeEvent(type, x, y) {
      const event = new CustomEvent(type);
      event.clientX = x;
      event.clientY = y;
      event.pageX = x;
      event.pageY = y;
      event.touches = [{
        pageX: x,
        pageY: y,
      }];
      return event;
    }

    function calibrateSlider() {
      rect = slider.getBoundingClientRect();
    }

    function prep() {
      return waitForImageSlider()
          .then(injectAnimationDeferred)
          .then(calibrateSlider);
    }

    // A bunch of expects to check if the slider has slide to
    // where we intended
    function expectByBarLeftPos(leftPos) {
      expect(sliderImpl.bar_.getBoundingClientRect().left)
          .to.equal(leftPos);
      expect(sliderImpl.leftMask_.getBoundingClientRect().right)
          .to.equal(leftPos);
      // amp-imgs should stay where they are
      expect(sliderImpl.leftAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
      expect(sliderImpl.rightAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
    }

    beforeEach(() => {
      win = env.win;
      toggleExperiment(win, 'amp-image-slider', true, false);
    });

    it('should move slider on hover', () => {
      let centerPos, leftQuarterPos, rightQuarterPos;
      let event;
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;

            event = createFakeEvent('mousemove', leftQuarterPos, 0);
            sliderImpl.container_.dispatchEvent(event);
            expectByBarLeftPos(leftQuarterPos);

            event = createFakeEvent('mousemove', rightQuarterPos, 0);
            sliderImpl.container_.dispatchEvent(event);
            expectByBarLeftPos(rightQuarterPos);

            event = createFakeEvent('mousemove', centerPos, 0);
            sliderImpl.container_.dispatchEvent(event);
            expectByBarLeftPos(centerPos);
          });
    });
  });
});
