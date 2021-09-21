import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoImageSlider} from '../component';

export default {
  title: 'ImageSlider',
  component: BentoImageSlider,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <ImageSlider
      style={{width: 300, height: 200}}
      example-property="example string property value"
    >
      This text is inside.
    </ImageSlider>
  );
};
