import * as Preact from '#preact';

import {BentoGpt} from '../component';

export default {
  title: 'Gpt',
  component: BentoGpt,
  args: {
    'exampleProperty': 'example string property argument',
  },
};

export const _default = (args) => {
  return (
    <BentoGpt
      style={{width: 120, height: 600}}
      adUnitPath={'/21730346048/test-skyscraper'}
      size={[120, 600]}
      optDiv={'div1'}
      {...args}
    >
      This text is inside.
    </BentoGpt>
  );
};
