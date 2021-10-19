import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-gpt-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-gpt', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};
//.defineSlot('/21730346048/test-skyscraper', [120, 600], 'div1')

export const _default = (args) => {
  return (
    <amp-gpt
      ad-unit-path="/21730346048/test-skyscraper"
      size="[120, 600]"
      opt-div="div1"
      width="120"
      height="600"
      {...args}
    >
      This text is inside.
    </amp-gpt>
  );
};
