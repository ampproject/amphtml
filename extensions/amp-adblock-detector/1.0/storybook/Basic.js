import * as Preact from '#preact';

import {BentoAdblockDetector} from '../component';

export default {
  title: 'AdblockDetector',
  component: BentoAdblockDetector,
};

export const _default = (args) => {
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
          <div fallback>
            This is a fallback -- do similar as image-slider for img tag slot
          </div>
        </amp-ad>
      )}
      fallbackDiv={(props) => (
        <div status="blocked" {...props}>
          <h2>Ad Blocker Detected</h2>
          <p>Please allow ads to run on this page.</p>
        </div>
      )}
    ></BentoAdblockDetector>
  );
};
