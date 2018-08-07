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

import {poll} from '../../../../../testing/iframe';

const config = describe.configure().ifNewChrome();
config.run('amp-image-slider', function() {
  this.timeout(20000);

  const sliderBody = `
    <amp-image-slider tabindex="0" id="slider"
        layout="responsive" width="1000" height="500">
      <amp-img src="https://unsplash.it/1080/720?image=1037" layout="fill"></amp-img>
      <amp-img src="https://unsplash.it/1080/720?image=1038" layout="fill"></amp-img>
      <div first class="label">BEFORE</div>
      <div second class="label">AFTER</div>
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
    let bar_, container_, rightMask_, leftAmpImage_, rightAmpImage_;
    let leftLabel_, rightLabel_;

    beforeEach(() => {
      win = env.win;
      doc = win.document;
    });

    function waitForImageSlider() {
      return poll('wait for amp-image-slider to complete', () => {
        slider = doc.getElementsByTagName('amp-image-slider')[0];

        if (!slider) {
          return false;
        }

        sliderImpl = slider.implementation_;

        if (!sliderImpl) {
          return false;
        }
        // layoutCallback is called
        // this is the same as CommonSignal.LOAD_END
        return !!slider.signals().get('load-end');
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

    function createKeyDownEvent(key) {
      return new KeyboardEvent('keydown', {
        key,
      });
    }

    function prepareSlider() {
      sliderImpl = slider.implementation_;
      rect = slider.getBoundingClientRect();
    }

    function prep() {
      return waitForImageSlider()
          .then(() => timeout(env.win, 1000))
          .then(prepareSlider);
    }

    // A bunch of expects to check if the slider has slided to
    // where we intended
    function expectByBarLeftPos(leftPos) {
      slider = doc.querySelector('amp-image-slider');
      bar_ = slider.querySelector('.i-amphtml-image-slider-bar');
      container_ =
          slider.querySelector('.i-amphtml-image-slider-container');
      rightMask_ =
          slider.querySelector('.i-amphtml-image-slider-right-mask');
      const ampImgs = slider.getElementsByTagName('amp-img');
      leftAmpImage_ = ampImgs[0];
      rightAmpImage_ = ampImgs[1];
      leftLabel_ = slider.querySelectorAll(
          '.i-amphtml-image-slider-label-wrapper')[0];
      rightLabel_ = slider.querySelectorAll(
          '.i-amphtml-image-slider-label-wrapper')[1];

      expect(bar_.getBoundingClientRect().left)
          .to.equal(leftPos);
      expect(rightMask_.getBoundingClientRect().left)
          .to.equal(leftPos);
      // amp-imgs should stay where they are
      expect(leftAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
      expect(rightAmpImage_.getBoundingClientRect().left)
          .to.equal(rect.left);
      expect(leftLabel_.getBoundingClientRect().left)
          .to.equal(rect.left);
      expect(rightLabel_.getBoundingClientRect().left)
          .to.equal(rect.left);
    }

    it('should construct', () => {
      let slider, container_, rightMask_, bar_;
      return prep()
          .then(() => {
            const sliders = doc.getElementsByTagName('amp-image-slider');
            expect(sliders.length).to.be.greaterThan(0);
            slider = sliders[0];
            container_ = slider
                .querySelector('.i-amphtml-image-slider-container');
            expect(!!container_).to.be.true;
            rightMask_ = slider.querySelector('.i-amphtml-image-slider-bar');
            expect(!!rightMask_).to.be.true;
            bar_ = slider.querySelector('.i-amphtml-image-slider-bar');
            expect(!!bar_).to.be.true;
            const ampImgs = slider.getElementsByTagName('amp-img');
            expect(ampImgs.length).to.equal(2);
            expect(!!ampImgs[0]).to.be.true;
            expect(!!ampImgs[1]).to.be.true;
          });
    });

    it('should animate moving bar to position on mousedown', () => {
      let leftQuarterPos, centerPos, container_;
      let slider;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
            sliderImpl = slider.implementation_;
            container_ =
              slider.querySelector(
                  '.i-amphtml-image-slider-container');
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const mouseDownEvent =
                createFakeEvent(
                    'mousedown',
                    leftQuarterPos,
                    0
                );

            container_.dispatchEvent(mouseDownEvent);
            return timeout(env.win, 500);
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
            container_.dispatchEvent(mouseDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    it('should animate moving bar to position on touch', () => {
      let leftQuarterPos, centerPos;
      let slider;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
            sliderImpl = slider.implementation_;
            leftQuarterPos = rect.left + 0.25 * rect.width;
            const touchStartEvent =
                createFakeEvent(
                    'touchstart',
                    leftQuarterPos,
                    0
                );
            slider.dispatchEvent(touchStartEvent);
            return timeout(env.win, 500);
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
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);
          });
    });

    function timeout(win, ms) {
      return new Promise(resolve => win.setTimeout(resolve, ms));
    }

    it('should follow mouse drag', () => {
      let slider;
      let mouseDownEvent, mouseMoveEvent, mouseUpEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
            sliderImpl = slider.implementation_;
            container_ =
              slider.querySelector(
                  '.i-amphtml-image-slider-container');

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
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);

            // Mouse button is still down, move to somewhere on slider
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);

            // Mouse button is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightBeyondPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rect.right);

            // Mouse button is still down, move back to inside the slider
            // The bar position should still be updated
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);

            // Release mouse button
            mouseUpEvent = createFakeEvent(
                'mouseup',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseUpEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow touch drag', () => {
      let slider;
      let touchStartEvent, touchMoveEvent, touchEndEvent;
      let centerPos, leftQuarterPos, rightQuarterPos, rightBeyondPos;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
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
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);

            // Touch is still down, move to somewhere on slider
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(leftQuarterPos);

            // Touch is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightBeyondPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rect.right);

            // Touch is still down, move back to inside the slider
            // The bar position should still be updated
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);

            // Release touch
            touchEndEvent = createFakeEvent(
                'touchend',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchEndEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);

            // Mouse button is now up, should no longer follow mouse move
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow keyboard buttons', () => {
      let slider;
      let keyDownEvent;
      let centerPos, Pos40Percent;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
            slider.focus();
            centerPos = rect.left + 0.5 * rect.width;
            Pos40Percent = rect.left + 0.4 * rect.width;

            keyDownEvent = createKeyDownEvent('ArrowLeft');
            slider.dispatchEvent(keyDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(Pos40Percent);

            keyDownEvent = createKeyDownEvent('ArrowRight');
            slider.dispatchEvent(keyDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);

            keyDownEvent = createKeyDownEvent('PageUp');
            slider.dispatchEvent(keyDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rect.left);

            keyDownEvent = createKeyDownEvent('Home');
            slider.dispatchEvent(keyDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(centerPos);

            keyDownEvent = createKeyDownEvent('PageDown');
            slider.dispatchEvent(keyDownEvent);
            return timeout(env.win, 500);
          })
          .then(() => {
            expectByBarLeftPos(rect.right);
          });
    });
  });
});
