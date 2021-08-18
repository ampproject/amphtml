

import {withAmp} from '@ampproject/storybook-addon';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-instagram-0_1',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-instagram', version: '0.1'}],
  },
};

export const _default = () => {
  const width = number('width', 500);
  const height = number('height', 600);
  const shortcode = text('shortcode', 'B8QaZW4AQY_');
  const captioned = boolean('captioned');
  const layout = text('layout', 'fixed');

  return (
    <amp-instagram
      data-shortcode={shortcode}
      data-captioned={captioned}
      width={width}
      height={height}
      layout={layout}
    ></amp-instagram>
  );
};
