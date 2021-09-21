import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoImageSlider} from '../component';

export default {
  title: 'ImageSlider',
  component: BentoImageSlider,
  decorators: [withKnobs],
};

export const _default = () => {
  const first = text(
    'First image',
    'https://amp.dev/static/samples/img/canoe_900x600.jpg'
  );
  const second = text(
    'Second image',
    'https://amp.dev/static/samples/img/canoe_900x600_blur.jpg'
  );

  return (
    <BentoImageSlider
      layout="responsive"
      width="100"
      height="200"
      initial-slider-position="0"
    >
      <amp-img slot="first-image" src={first} alt="A green apple"></amp-img>
      <amp-img slot="second-image" src={second} alt="A red apple"></amp-img>
      <div slot="first-label">Clear Picture</div>
      <div slot="second-label">Blur Picture</div>
    </BentoImageSlider>
  );
};
