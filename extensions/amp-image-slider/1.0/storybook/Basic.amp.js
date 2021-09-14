import {withAmp} from '@ampproject/storybook-addon';
import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-image-slider-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-image-slider', version: '1.0'}],
    experiments: ['bento'],
  },
};

// DO NOT SUBMIT: This is example code only.
export const ExampleUseCase = () => {
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
      <img src={first} alt={'First image'}></img>
      <img src={second} alt={'Second iamge'}></img>
      <div first>Img1</div>
      <div second>Img2</div>
    </amp-image-slider>
  );
};

ExampleUseCase.story = {
  name: 'Example use case story',
};
