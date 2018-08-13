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
    <button id="button" on="tap:slider.seekTo(percent=0.1)">seekTo 10%</button>
    <p class="para">HUGE PADDING</p>
  `;

  const css = `
  #slider .amp-image-slider-hint-left {
    width: 64px;
    height: 32px;
    background-width: 64px;
    background-height: 32px;
  }
  .label {
    color: white;
    border: 4px solid white;
    padding: 1em;
    font-family: Arial, Helvetica, sans-serif;
    box-shadow: 2px 2px 27px 5px rgba(0,0,0,0.75);
  }
  .para {
    height: 10000px;
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
          .then(prepareSlider);
    }

    function timeout(win, ms) {
      return new Promise(resolve => win.setTimeout(resolve, ms));
    }

    // A bunch of expects to check if the slider has slided to
    // where we intended
    // Returns true/false for position checks
    function isOkByBarLeftPos(leftPos) {
      slider = doc.querySelector('#slider');
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

      const roundedLeftPos = Math.round(leftPos);
      const roundedRectLeft = Math.round(rect.left);

      return Math.round(bar_.getBoundingClientRect().left)
          === roundedLeftPos &&
        Math.round(rightMask_.getBoundingClientRect().left)
          === roundedLeftPos &&
        Math.round(leftAmpImage_.getBoundingClientRect().left)
          === roundedRectLeft &&
        Math.round(rightAmpImage_.getBoundingClientRect().left)
          === roundedRectLeft &&
        Math.round(leftLabel_.getBoundingClientRect().left)
          === roundedRectLeft &&
        Math.round(rightLabel_.getBoundingClientRect().left)
          === roundedRectLeft;
    }

    // Poll for 500ms.
    // If all elements are at correct position in 500ms, resolve
    // Otherwise, pass expected value to reject.
    function pollByBarLeftPos(leftPos) {
      return poll('examine position correctness', () => {
        if (isOkByBarLeftPos(leftPos)) {
          return true;
        }
        return false;
      }, () => { return `${leftPos} is not reached.`; });
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
            return pollByBarLeftPos(leftQuarterPos);
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
            return pollByBarLeftPos(centerPos);
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
            return pollByBarLeftPos(leftQuarterPos);
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
            return pollByBarLeftPos(centerPos);
          });
    });

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
            return pollByBarLeftPos(centerPos);
          })
          .then(() => {
            // Mouse button is still down, move to somewhere on slider
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return pollByBarLeftPos(leftQuarterPos);
          })
          .then(() => {
            // Mouse button is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightBeyondPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return pollByBarLeftPos(rect.right);
          })
          .then(() => {
            // Mouse button is still down, move back to inside the slider
            // The bar position should still be updated
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return pollByBarLeftPos(rightQuarterPos);
          })
          .then(() => {
            // Release mouse button
            mouseUpEvent = createFakeEvent(
                'mouseup',
                rightQuarterPos,
                0
            );
            win.dispatchEvent(mouseUpEvent);
            return pollByBarLeftPos(rightQuarterPos);
          })
          .then(() => {
            // Mouse button is now up, should no longer follow mouse move
            mouseMoveEvent = createFakeEvent(
                'mousemove',
                leftQuarterPos,
                0
            );
            win.dispatchEvent(mouseMoveEvent);
            return pollByBarLeftPos(rightQuarterPos);
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
            return pollByBarLeftPos(centerPos);
          })
          .then(() => {
            // Touch is still down, move to somewhere on slider
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return pollByBarLeftPos(leftQuarterPos);
          })
          .then(() => {
            // Touch is still down, move to somewhere outside of slider
            // The bar position should be capped at right border
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightBeyondPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return pollByBarLeftPos(rect.right);
          })
          .then(() => {
            // Touch is still down, move back to inside the slider
            // The bar position should still be updated
            touchMoveEvent = createFakeEvent(
                'touchmove',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return pollByBarLeftPos(rightQuarterPos);
          })
          .then(() => {
            // Release touch
            touchEndEvent = createFakeEvent(
                'touchend',
                rightQuarterPos,
                0
            );
            slider.dispatchEvent(touchEndEvent);
            return pollByBarLeftPos(rightQuarterPos);
          })
          .then(() => {
            // Mouse button is now up, should no longer follow mouse move
            touchMoveEvent = createFakeEvent(
                'touchmove',
                leftQuarterPos,
                0
            );
            slider.dispatchEvent(touchMoveEvent);
            return pollByBarLeftPos(rightQuarterPos);
          });
    });

    it('should follow keyboard buttons', () => {
      let slider;
      let keyDownEvent;
      let centerPos, pos40Percent;
      return prep()
          .then(() => {
            slider = doc.querySelector('amp-image-slider');
            slider.focus();
            centerPos = rect.left + 0.5 * rect.width;
            pos40Percent = rect.left + 0.4 * rect.width;

            keyDownEvent = createKeyDownEvent('ArrowLeft');
            slider.dispatchEvent(keyDownEvent);
            return pollByBarLeftPos(pos40Percent);
          })
          .then(() => {
            keyDownEvent = createKeyDownEvent('ArrowRight');
            slider.dispatchEvent(keyDownEvent);
            return pollByBarLeftPos(centerPos);
          })
          .then(() => {
            keyDownEvent = createKeyDownEvent('PageUp');
            slider.dispatchEvent(keyDownEvent);
            return pollByBarLeftPos(rect.left);
          })
          .then(() => {
            keyDownEvent = createKeyDownEvent('Home');
            slider.dispatchEvent(keyDownEvent);
            return pollByBarLeftPos(centerPos);
          })
          .then(() => {
            keyDownEvent = createKeyDownEvent('PageDown');
            slider.dispatchEvent(keyDownEvent);
            return pollByBarLeftPos(rect.right);
          });
    });

    it('should seekTo correct position', () => {
      let button;
      let pos10Percent;
      return prep()
          .then(() => {
            button = doc.querySelector('#button');
            pos10Percent = rect.left + 0.1 * rect.width;
            button.click();
            return pollByBarLeftPos(pos10Percent);
          });
    });

    it('should show hint again on scroll back and into viewport', () => {
      let slider, container_, hint;
      let mouseDownEvent;
      return prep()
          .then(() => {
            slider = doc.getElementById('slider');
            container_ = slider
                .querySelector('.i-amphtml-image-slider-container');
            hint = slider.querySelectorAll('.i-amphtml-image-slider-hint')[0];
            mouseDownEvent = createFakeEvent(
                'mousedown',
                0,
                0
            );
            container_.dispatchEvent(mouseDownEvent);
            return poll('should receive hidden class', () => {
              return hint.classList
                  .contains('i-amphtml-image-slider-hint-hidden');
            }, () => {});
          })
          .then(() => {
            env.win.scrollTo({
              top: 3000,
            });
            // Have to use timeout here,
            // no indication of proper viewportCallback trigger
            return timeout(env.win, 500);
          })
          .then(() => {
            env.win.scrollTo({
              top: 0,
            });
            return poll('should remove hidden class', () => {
              return !hint.classList
                  .contains('i-amphtml-image-slider-hint-hidden');
            }, () => {});
          });
    });
  });
});
