import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-slikeplayer-0_1',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-slikeplayer', version: '0.1'}],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <amp-slikeplayer width="300" height="200" {...args}>
      This text is inside.
    </amp-slikeplayer>
  );
};
