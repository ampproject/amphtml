import * as Preact from '#preact';

import {BentoList} from '../component/component';

export default {
  title: 'List',
  component: BentoList,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoList style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoList>
  );
};
