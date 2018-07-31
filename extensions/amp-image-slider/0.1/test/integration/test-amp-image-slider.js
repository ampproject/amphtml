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
import '../../amp-image-slider';
import {poll} from '../../../../../testing/iframe';
import {toggleExperiment} from '../../../../../src/experiments';

const config = describe.configure().ifNewChrome();
config.run('amp-image-slider', function() {
  this.timeout(10000);

  const sliderBody = `
    <amp-image-slider id="slider" layout="responsive" width="1000" height="500">
      <amp-img src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
      <amp-img src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
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
    body: sliderBody,
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

        return sliderImpl.isEventRegistered_;
      });
    }

    function createFakeEvent(type, x, y) {
      const event = new CustomEvent(type);
      event.clientX = x;
      event.clientY = y;
      event.pageX = x;
      event.pageY = y;
      event.touches = [{
        clientX: x,
        clientY: y,
        pageX: x,
        pageY: y,
      }];
      return event;
    }

    function calibrateSlider() {
      sliderImpl = slider.implementation_;
      sliderImpl.mutateElement = cb => cb();
      rect = slider.getBoundingClientRect();
    }

    function prep() {
      return waitForImageSlider()
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

    it('should animate moving bar to position on mousedown', () => {
      let leftQuarterPos, centerPos;
      return prep()
          .then(() => {
            sliderImpl = slider.implementation_;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const mouseDownEvent =
                createFakeEvent(
                    'mousedown',
                    leftQuarterPos,
                    0
                );
            sliderImpl.container_.dispatchEvent(mouseDownEvent);
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);
          })
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            const mouseDownEvent =
                createFakeEvent(
                    'mousedown',
                    centerPos,
                    0
                );
            sliderImpl.container_.dispatchEvent(mouseDownEvent);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    it('should animate moving bar to position on touch', () => {
      let leftQuarterPos, centerPos;
      return prep()
          .then(() => {
            sliderImpl = slider.implementation_;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const touchStartEvent =
                createFakeEvent(
                    'touchstart',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(touchStartEvent);
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);
          })
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            const touchStartEvent =
                createFakeEvent(
                    'touchstart',
                    centerPos,
                    0
                );
            slider.dispatchEvent(touchStartEvent);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    it('should follow mouse drag', () => {
      let mouseDownEvent, mouseMoveEvent, mouseUpEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      let container_;
      return prep()
          .then(() => {
            sliderImpl = slider.implementation_;
            container_ = sliderImpl.container_;

            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            // Initiate mousedown, no move expected
            mouseDownEvent = createFakeEvent(
                'mousedown',
                centerPos,
                0
            );
            container_.dispatchEvent(mouseDownEvent);
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
      return prep()
          .then(() => {
            centerPos = rect.left + 0.5 * rect.width;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            rightQuarterPos = rect.left + 0.75 * rect.width;
            rightBeyondPos = rect.right + 100;

            // Initiate touchStart, no move expected
            touchStartEvent = createFakeEvent(
                'touchstart',
                centerPos,
                0
            );
            slider.dispatchEvent(touchStartEvent);
            expectByBarLeftPos(centerPos);

            // Touch is still down, move to somewhere on slider
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(leftQuarterPos);

            // Touch is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightBeyondPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rect.right);

            // Touch is still down, move back to inside the slider
            // The bar position should still be updated
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Release touch
            touchEndEvent = createFakeEvent(
                'touchend',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchEndEvent);
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            expectByBarLeftPos(rightQuarterPos);
          });
    });
  });
});
