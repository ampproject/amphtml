import * as Preact from '#preact';

import {BentoAdblockDetector} from '../component';

export default {
  title: 'AdblockDetector',
  component: BentoAdblockDetector,
};

export const _default = (args) => {
  /**
   * TODO: Update Preact example when AMP Storybook Enviroment will be enabled (@anuragvasanwala)
   *
   * To render `amp-ad:0.1` we need:
   * import {withAmp} from '@ampproject/storybook-addon';
   *
   * At this moment AMP Storybook Enviroment is disabled,
   * so `amp-ad` will not be rendered and show `amp-ad`
   * fallback div.
   *
   * Refer this PR for more information:
   * https://github.com/ampproject/amphtml/pull/36780
   */

  return (
    <BentoAdblockDetector
      style={{width: 120, height: 600}}
      {...args}
      ampAd={(props) => (
        <amp-ad
          width="120"
          height="600"
          type="doubleclick"
          data-slot="/21730346048/test-skyscraper"
          {...props}
        >
          <div fallback>This is AMP-Ad fallback.</div>
        </amp-ad>
      )}
      fallbackDiv={(props) => (
        <div
          style={{
            border: '2px solid red',
            borderRadius: 10,
            margin: 5,
            padding: 5,
          }}
          {...props}
        >
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      )}
    ></BentoAdblockDetector>
  );
};
