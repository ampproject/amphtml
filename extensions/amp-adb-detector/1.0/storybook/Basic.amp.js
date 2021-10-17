import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-adb-detector-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-adb-detector', version: '1.0'},
      {name: 'amp-ad', version: '0.1'},
    ],
    experiments: ['bento'],
  },
  args: {
    'data-example-property': 'example string property argument',
  },
};

export const _default = (args) => {
  return (
    <>
      <amp-ad
        width="120"
        height="600"
        type="doubleclick"
        data-slot="/21730346048/test-skyscraper"
      >
        <div placeholder></div>
        <div fallback></div>
      </amp-ad>
      <amp-adb-detector width="300" height="200" {...args}>
        This text is inside.
      </amp-adb-detector>
    </>
  );
};
