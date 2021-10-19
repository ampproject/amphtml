import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-gpt-ad-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-gpt-ad', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <amp-gpt-ad width="120" height="600" {...args}>
      This text is inside.
    </amp-gpt-ad>
  );
};
