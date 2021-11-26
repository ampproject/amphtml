import * as Preact from '#preact';
import {BentoAppBanner} from '../component';

export default {
  title: 'AppBanner',
  component: BentoAppBanner,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoAppBanner style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoAppBanner>
  );
};
