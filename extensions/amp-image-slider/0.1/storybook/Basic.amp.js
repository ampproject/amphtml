/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
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

import * as Preact from '../../../../src/preact';
import {storiesOf} from '@storybook/preact';
import {text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

// eslint-disable-next-line
storiesOf('Image Slider', module)
  .addDecorator(withKnobs)
  .addDecorator(withA11y)
  .addDecorator(withAmp)
  .addParameters({extensions: [{name: 'amp-image-slider', version: 0.1}]})
  .add('default', () => {
    const first = text(
      'First image',
      'https://amp.dev/static/samples/img/canoe_900x600.jpg'
    );
    const second = text(
      'Second image',
      'https://amp.dev/static/samples/img/canoe_900x600_blur.jpg'
    );

    return (
      <amp-image-slider width="600" height="300" layout="fixed">
        <amp-img src={first} alt={'First image'} layout="fill"></amp-img>
        <amp-img src={second} alt={'Second iamge'} layout="fill"></amp-img>
      </amp-image-slider>
    );
  })
  .add('custom-hints', () => {
    const first = text(
      'First image',
      'https://amp.dev/static/samples/img/canoe_900x600.jpg'
    );
    const second = text(
      'Second image',
      'https://amp.dev/static/samples/img/canoe_900x600_blur.jpg'
    );

    return (
      <amp-image-slider width="600" height="300" layout="fixed">
        <amp-img src={first} alt={'First image'} layout="fill"></amp-img>
        <amp-img src={second} alt={'Second image'} layout="fill"></amp-img>
        <style jsx global>
          {`
            .amp-image-slider-hint-right {
              width: 10px;
              height: 20px;
              background-size: 10px 20px;
              margin-left: 10px;
              background-image: url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='0,0 10,10 0,20' style='fill:white;stroke:black;stroke-width:1' /%3e%3c/svg%3e");
            }
          `}
        </style>
        <style jsx global>
          {`
            .amp-image-slider-hint-left {
              width: 10px;
              height: 20px;
              background-size: 10px 20px;
              margin-right: 10px;
              background-image: url("data:image/svg+xml;charset=utf-8,%3csvg xmlns='http://www.w3.org/2000/svg' width='10' height='20' viewBox='0 0 10 20'%3e%3cpolygon points='10,0 0,10 10,20' style='fill:white;stroke:black;stroke-width:1' /%3e%3c/svg%3e");
            }
          `}
        </style>
      </amp-image-slider>
    );
  });
