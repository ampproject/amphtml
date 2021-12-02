import * as Preact from '#preact';
import {BentoBeopinion} from '../component';

export default {
  title: 'Beopinion',
  component: BentoBeopinion,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoBeopinion style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoBeopinion>
  );
};
