import * as Preact from '#preact';
import {BentoMegaMenu} from '../component';

import '../component.jss';

export default {
  title: 'MegaMenu',
  component: BentoMegaMenu,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoMegaMenu style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoMegaMenu>
  );
};
