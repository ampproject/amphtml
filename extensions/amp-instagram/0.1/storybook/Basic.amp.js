import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-instagram-0_1',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-instagram', version: '0.1'}],
  },
  args: {
    width: 500,
    height: 600,
    layout: 'fixed',
    'data-shortcode': 'B8QaZW4AQY_',
    'data-captioned': false,
  },
};

export const _default = (args) => {
  return <amp-instagram {...args}></amp-instagram>;
};
