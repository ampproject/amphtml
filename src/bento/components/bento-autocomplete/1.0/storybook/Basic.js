import * as Preact from '#preact';
import {BentoAutocomplete} from '../component';

import '../component.jss';

export default {
  title: 'Autocomplete',
  component: BentoAutocomplete,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

// DO NOT SUBMIT: This is example code only.
export const _default = (args) => {
  return (
    <BentoAutocomplete style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoAutocomplete>
  );
};
