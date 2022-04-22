import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-image-slider-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-image-slider', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const ExampleUseCase = ({first, second, ...args}) => {
  return (
    <amp-image-slider
      layout="fixed"
      width="600"
      height="300"
      initial-slider-position="0"
      {...args}
    >
      <amp-img
        slot="first-image"
        src={first}
        alt="A green apple"
        layout="fill"
      ></amp-img>
      <amp-img
        slot="second-image"
        src={second}
        alt="A red apple"
        layout="fill"
      ></amp-img>
      <div slot="first-label">Clear Picture</div>
      <div slot="second-label">Blur Picture</div>
    </amp-image-slider>
  );
};

ExampleUseCase.args = {
  first: 'https://amp.dev/static/samples/img/canoe_900x600.jpg',
  second: 'https://amp.dev/static/samples/img/canoe_900x600_blur.jpg',
};
