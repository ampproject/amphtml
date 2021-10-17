import * as Preact from '#preact';

import {BentoAdbDetector} from '../component';

export default {
  title: 'AdbDetector',
  component: BentoAdbDetector,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

export const _default = (args) => {
  return (
    <BentoAdbDetector style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoAdbDetector>
  );
};
