import * as Preact from '#preact';

import {BentoGpt} from '../component';

export default {
  title: 'Gpt',
  component: BentoGpt,
};

export const _default = (args) => {
  // const json = [{'author': 'Anurag'}];
  return (
    <BentoGpt
      adUnitPath={'/21730346048/test-skyscraper'}
      optDiv={'div1'}
      height="600"
      width="120"
      {...args}
    >
      This text is inside.
    </BentoGpt>
  );
};
