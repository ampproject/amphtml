import {withAmp} from '@ampproject/storybook-addon';
import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'Image Slider',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-image-slider', version: 0.1}],
  },
};

export const Default = () => {
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
};

Default.storyName = 'default';

export const CustomHints = () => {
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
};

CustomHints.storyName = 'custom-hints';
