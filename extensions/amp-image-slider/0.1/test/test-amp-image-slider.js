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
// import * as sinon from 'sinon';
import {toggleExperiment} from '../../../../src/experiments';

describes.realWin('amp-image-slider component', {
  amp: {
    extensions: ['amp-image-slider'],
  },
}, env => {
  let win, doc, slider, impl;

  beforeEach(() => {
    win = env.win;
    doc = win.document;

    toggleExperiment(win, 'amp-image-slider', true);

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
  });

  it('should render slider img tags', () => {
    const images = slider.getElementsByTagName('img');
    expect(images.length).to.equal(2);
  });

  it('should build necessary components', () => {
    const bar = slider.querySelector('div.i-amphtml-image-slider-bar');
    expect(bar).to.not.equal(null);
    const barStick
        = slider.querySelector('div.i-amphtml-image-slider-bar-stick');
    expect(barStick).to.not.equal(null);
    const barButton
        = slider.querySelector('div.i-amphtml-image-slider-bar-button');
    expect(barButton).to.not.equal(null);
  });

  it('should initially center slider bar', () => {
    const {width: sliderWidth, left: offsetLeft}
        = slider.getBoundingClientRect();
    expect(impl.bar_.getBoundingClientRect().left)
        .to.equal((sliderWidth / 2) + offsetLeft);
  });

  it('should update bar position correctly', () => {
    impl.updatePositions(0);
    expect(impl.bar_.getBoundingClientRect().left)
        .to.equal(slider.getBoundingClientRect().left);
    impl.updatePositions(1);
    expect(impl.bar_.getBoundingClientRect().left)
        .to.equal(slider.getBoundingClientRect().right);
  });

  it('should update bar position with animation correctly', () => {
    return new Promise(resolve => {
      impl.animateUpdatePositions(0);
      resolve();
    })
        .then(() => {
          return waitForMs(300);
        })
        .then(() => {
          expect(impl.bar_.getBoundingClientRect().left)
              .to.equal(slider.getBoundingClientRect().left);
          impl.animateUpdatePositions(1);
          return waitForMs(300);
        })
        .then(() => {
          expect(impl.bar_.getBoundingClientRect().left)
              .to.equal(slider.getBoundingClientRect().right);
        });
  });
});

function waitForMs(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
