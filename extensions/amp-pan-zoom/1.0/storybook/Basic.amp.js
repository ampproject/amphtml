import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-pan-zoom-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-pan-zoom', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

export const _default = (args) => {
  return (
    <amp-pan-zoom width="300" height="200" {...args}>
      This text is inside.
    </amp-pan-zoom>
  );
};
