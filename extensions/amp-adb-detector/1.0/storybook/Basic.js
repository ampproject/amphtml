import * as Preact from '#preact';

import {BentoAdbDetector} from '../component';

export default {
  title: 'AdbDetector',
  parameters: {
    extensions: [{name: 'amp-adb-detector', version: '1.0'}],
  },
  component: BentoAdbDetector,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

export const _default = () => {
  return (
    <>
      <BentoAdbDetector
        style={{width: 120, height: 600}}
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
      ></BentoAdbDetector>
    </>
  );
};
