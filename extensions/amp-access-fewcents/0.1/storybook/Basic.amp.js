import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-access-fewcents-0_1',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-access-fewcents', version: '0.1'}],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <amp-access-fewcents width="300" height="200" {...args}>
      This text is inside.
    </amp-access-fewcents>
  );
};
