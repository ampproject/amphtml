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
    <amp-image-slider
      layout="responsive"
      width="100"
      height="200"
      initial-slider-position="0"
    >
      <amp-img slot="first-image" src={first} alt="A green apple"></amp-img>
      <amp-img slot="second-image" src={second} alt="A red apple"></amp-img>
      <div slot="first-label">Clear Picture</div>
      <div slot="second-label">Blur Picture</div>
    </amp-image-slider>
  );
};

ExampleUseCase.story = {
  name: 'Example use case story',
};
