import * as Preact from '#preact';
import {BentoDatePicker} from '../component';

export default {
  title: 'DatePicker',
  component: BentoDatePicker,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoDatePicker style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoDatePicker>
  );
};
