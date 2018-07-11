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

import '../amp-image-slider';
import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-image-slider component', {
  amp: {
    extensions: ['amp-image-slider'],
  },
}, env => {
  let win, doc, slider, impl, sandbox;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    toggleExperiment(win, 'amp-image-slider', true);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    slider = null;
    const sliders
        = env.win.document.body.getElementsByTagName('amp-image-slider');
    for (let i = 0; i < sliders.length; i++) {
      env.win.document.body.removeChild(sliders[i]);
    }
  });

  function buildSlider() {
    slider = doc.createElement('amp-image-slider');
    slider.setAttribute('layout', 'responsive');
    slider.setAttribute('width', '1024');
    slider.setAttribute('height', '600');
    const leftImage = doc.createElement('amp-img');
    leftImage.setAttribute('src', 'https://unsplash.it/1080/720?image=1037');
    leftImage.setAttribute('layout', 'fill');
    leftImage.setAttribute('before', '');
    slider.appendChild(leftImage);
    const rightImage = doc.createElement('amp-img');
    rightImage.setAttribute('src', 'https://unsplash.it/1080/720?image=1038');
    rightImage.setAttribute('layout', 'fill');
    rightImage.setAttribute('after', '');
    slider.appendChild(rightImage);

    impl = slider.implementation_; // expose extended from AMP.BaseElement

    doc.body.appendChild(slider);
    return Promise.all([leftImage.build(), rightImage.build()])
        .then(() => {
          return Promise.all([
            leftImage.layoutCallback(),
            rightImage.layoutCallback(),
          ]);
        })
        .then(() => {
          return slider.build();
        })
        .then(() => {
          return slider.layoutCallback();
        });
  }

  /*
  function buildSliderWithLabels() {
    slider = doc.createElement('amp-image-slider');
    slider.setAttribute('layout', 'responsive');
    slider.setAttribute('width', '1024');
    slider.setAttribute('height', '600');
    const leftImage = doc.createElement('amp-img');
    leftImage.setAttribute('src', 'https://unsplash.it/1080/720?image=1037');
    leftImage.setAttribute('layout', 'fill');
    leftImage.setAttribute('before', '');
    slider.appendChild(leftImage);
    const rightImage = doc.createElement('amp-img');
    rightImage.setAttribute('src', 'https://unsplash.it/1080/720?image=1038');
    rightImage.setAttribute('layout', 'fill');
    rightImage.setAttribute('after', '');
    slider.appendChild(rightImage);
    const leftLabel = doc.createElement('div');
    leftLabel.setAttribute('before', '');
    slider.appendChild(leftLabel);
    const rightLabel = doc.createElement('div');
    rightLabel.setAttribute('after', '');
    slider.appendChild(rightLabel);

    impl = slider.implementation_; // expose extended from AMP.BaseElement

    doc.body.appendChild(slider);
    return Promise.all([leftImage.build(), rightImage.build()])
        .then(() => {
          return Promise.all([
            leftImage.layoutCallback(),
            rightImage.layoutCallback(),
          ]);
        })
        .then(() => {
          return slider.build();
        })
        .then(() => {
          return slider.layoutCallback();
        });
  }
  */

  function expectLeftImageNotMoved() {
    const {left: imageLeft, right: imageRight}
        = impl.leftRealImage_.getBoundingClientRect();
    const {left: sliderLeft, right: sliderRight}
        = slider.getBoundingClientRect();
    expect(imageLeft).to.equal(sliderLeft);
    expect(imageRight).to.equal(sliderRight);
  }

  it('should render slider img tags', () => {
    return buildSlider().then(() => {
      const images = slider.getElementsByTagName('img');
      expect(images.length).to.equal(2);
    });
  });

  it('should build necessary bar components', () => {
    return buildSlider().then(() => {
      const bar = slider.querySelector('div.i-amphtml-image-slider-bar');
      expect(bar).to.not.equal(null);
      const barStick
          = slider.querySelector('div.i-amphtml-image-slider-bar-stick');
      expect(barStick).to.not.equal(null);
      const barButton
          = slider.querySelector('div.i-amphtml-image-slider-bar-button');
      expect(barButton).to.not.equal(null);
    });
  });

  it('should initially center slider bar', () => {
    return buildSlider().then(() => {
      const {width: sliderWidth, left: offsetLeft}
          = slider.getBoundingClientRect();
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal((sliderWidth / 2) + offsetLeft);
    });
  });

  it('should update positions correctly', () => {
    return buildSlider().then(() => {
      impl.updatePositions(0);
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(slider.getBoundingClientRect().left);
      // left img vs slider relative position should not change
      expectLeftImageNotMoved();
      expect(impl.leftRealImage_.getBoundingClientRect().right)
          .to.equal(slider.getBoundingClientRect().right);
      impl.updatePositions(1);
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(slider.getBoundingClientRect().right);
      // left img vs slider relative position should not change
      expectLeftImageNotMoved();
    });
  });

  it('should update bar position with animation correctly', () => {
    return buildSlider().then(() => {
      impl.animateUpdatePositions(0);
    })
        .then(() => {
          return waitForMs(300);
        })
        .then(() => {
          expect(impl.bar_.getBoundingClientRect().left)
              .to.equal(slider.getBoundingClientRect().left);
          expectLeftImageNotMoved();
          impl.animateUpdatePositions(1);
          return waitForMs(300);
        })
        .then(() => {
          expect(impl.bar_.getBoundingClientRect().left)
              .to.equal(slider.getBoundingClientRect().right);
          expectLeftImageNotMoved();
        });
  });

  it('should respond with click on image with animated update position', () => {
    let animateUpdatePositionsSpy;
    let sliderRect;
    return buildSlider().then(() => {
      animateUpdatePositionsSpy
          = sandbox.spy(impl, 'animateUpdatePositions');
      sliderRect = slider.getBoundingClientRect();
      const event = createFakeClickEvent(
          slider, sliderRect.left, 200);
      impl.handleClickImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(sliderRect.left);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(0)).to.be.true;
      expect(animateUpdatePositionsSpy.calledOnce).to.be.true;
      const event = createFakeClickEvent(
          slider, sliderRect.right, 200);
      impl.handleClickImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(slider.getBoundingClientRect().right);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(1)).to.be.true;
      expect(animateUpdatePositionsSpy.calledTwice).to.be.true;
    });
  });

  it('should respond with tap on image with animated update position', () => {
    let animateUpdatePositionsSpy;
    let sliderRect;
    return buildSlider().then(() => {
      animateUpdatePositionsSpy
          = sandbox.spy(impl, 'animateUpdatePositions');
      sliderRect = slider.getBoundingClientRect();
      const event = createFakeTapEvent(
          slider, sliderRect.left, 200);
      impl.handleTapImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(sliderRect.left);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(0)).to.be.true;
      expect(animateUpdatePositionsSpy.calledOnce).to.be.true;
      const event = createFakeTapEvent(
          slider, sliderRect.right, 200);
      impl.handleTapImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(slider.getBoundingClientRect().right);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(1)).to.be.true;
      expect(animateUpdatePositionsSpy.calledTwice).to.be.true;
    });
  });

  // To support touchscreen desktops
  it('should support both tap and click events', () => {
    let animateUpdatePositionsSpy;
    let sliderRect;
    return buildSlider().then(() => {
      animateUpdatePositionsSpy
          = sandbox.spy(impl, 'animateUpdatePositions');
      sliderRect = slider.getBoundingClientRect();
      const event = createFakeTapEvent(
          slider, sliderRect.left, 200);
      impl.handleTapImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(sliderRect.left);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(0)).to.be.true;
      expect(animateUpdatePositionsSpy.calledOnce).to.be.true;
      const event = createFakeClickEvent(
          slider, sliderRect.right, 200);
      impl.handleClickImage(event);
      return waitForMs(300);
    }).then(() => {
      expect(impl.bar_.getBoundingClientRect().left)
          .to.equal(slider.getBoundingClientRect().right);
      expectLeftImageNotMoved();
      expect(animateUpdatePositionsSpy.calledWith(1)).to.be.true;
      expect(animateUpdatePositionsSpy.calledTwice).to.be.true;
    });
  });
});

function waitForMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function createFakeClickEvent(target, pageX, pageY) {
  return {
    target,
    pageX,
    pageY,
  };
}

function createFakeTapEvent(target, pageX, pageY) {
  return {
    target,
    touches: [{
      pageX,
      pageY,
    }],
  };
}
