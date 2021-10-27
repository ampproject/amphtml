import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-gpt-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-gpt', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = (args) => {
  return (
    <amp-gpt
      ad-unit-path="/21730346048/test-skyscraper"
      opt-div="div1"
      height="600"
      width="120"
      {...args}
    >
      This text is inside.
    </amp-gpt>
  );
};

export const targeting = (args) => {
  const targeting = {color: 'red'};
  return (
    <amp-gpt
      ad-unit-path="/21730346048/test-skyscraper"
      opt-div="div1"
      height="600"
      width="120"
      {...args}
      targeting={JSON.stringify(targeting)}
    >
      This text is inside.
    </amp-gpt>
  );
};
