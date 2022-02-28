import * as Preact from '#preact';
import {BentoResizeGuard} from '../component';

import '../component.jss';

export default {
  title: 'ResizeGuard',
  component: BentoResizeGuard,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoResizeGuard style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoResizeGuard>
  );
};
