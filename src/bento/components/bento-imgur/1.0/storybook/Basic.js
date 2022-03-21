import * as Preact from '#preact';
import {BentoImgur} from '../component';

import '../component.jss';

export default {
  title: 'Imgur',
  component: BentoImgur,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoImgur style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoImgur>
  );
};
