import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-list-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-list', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <amp-list width="300" height="200" {...args}>
      This text is inside.
    </amp-list>
  );
};
