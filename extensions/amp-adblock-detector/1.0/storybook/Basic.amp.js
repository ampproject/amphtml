import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-adblock-detector-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-adblock-detector', version: '1.0'},
      {name: 'amp-ad', version: '0.1'},
    ],
    experiments: ['bento'],
  },
};

export const _default = (args) => {
  return (
    <>
      <amp-adblock-detector
        layout="fixed"
        width="120"
        height="600"
        style="margin: 10px"
        {...args}
      >
        <amp-ad
          width="120"
          height="600"
          type="doubleclick"
          data-slot="/21730346048/test-skyscraper"
        >
          <div fallback>
            <p>Error while loading Ad</p>
          </div>
        </amp-ad>
        <div
          status="blocked"
          style="border: 2px solid red; border-radius: 10px; padding: 5px;"
        >
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      </amp-adblock-detector>
      <amp-adblock-detector
        layout="fixed"
        width="120"
        height="600"
        style="margin: 10px"
        {...args}
      >
        <amp-ad
          width="120"
          height="600"
          type="doubleclick"
          data-slot="/21730346048/test-skyscraper"
        >
          <div fallback>
            <p>Error while loading Ad</p>
          </div>
        </amp-ad>
        <div
          status="blocked"
          style="border: 2px solid red; border-radius: 10px; padding: 5px;"
        >
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      </amp-adblock-detector>
      <amp-adblock-detector
        layout="fixed"
        width="120"
        height="600"
        style="margin: 10px"
        {...args}
      >
        <amp-ad
          width="120"
          height="600"
          type="doubleclick"
          data-slot="/21730346048/test-skyscraper"
        >
          <div fallback>
            <p>Error while loading Ad</p>
          </div>
        </amp-ad>
        <div
          status="blocked"
          style="border: 2px solid red; border-radius: 10px; padding: 5px;"
        >
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      </amp-adblock-detector>
    </>
  );
};
