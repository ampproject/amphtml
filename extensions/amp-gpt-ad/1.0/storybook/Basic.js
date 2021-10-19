import * as Preact from '#preact';

import {BentoGptAd} from '../component';

export default {
  title: 'GptAd',
  component: BentoGptAd,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoGptAd style={{width: 120, height: 600}} {...args}>
      This text is inside.
    </BentoGptAd>
  );
};
