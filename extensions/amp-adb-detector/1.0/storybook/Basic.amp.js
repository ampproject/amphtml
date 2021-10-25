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
  // <amp-adb-detector width="1" height="2" {...args} on="onblock:s2.hide">

  return (
    <>
      <amp-adb-detector layout="fixed" width="120" height="600" {...args}>
        <amp-ad
          width="120"
          height="600"
          type="doubleclick"
          data-slot="/21730346048/test-skyscraper"
          id="ampad1"
        >
          <div fallback>
            <p>Error while loading Ad</p>
          </div>
        </amp-ad>
        <div status="blocked">
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      </amp-adb-detector>
    </>
  );
};
