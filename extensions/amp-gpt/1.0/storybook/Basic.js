import {boolean, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {BentoGpt} from '../component';

export default {
  title: 'Gpt',
  component: BentoGpt,
  decorators: [withKnobs],
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

export const targeting = (args) => {
  const targeting = {color: 'red'};
  return (
    <BentoGpt
      adUnitPath="/21730346048/test-skyscraper"
      optDiv="div2"
      height="600"
      width="120"
      {...args}
      targeting={JSON.stringify(targeting)}
    >
      This text is inside.
    </BentoGpt>
  );
};

/**
 * Cannot test this in Preact/Bento Storybook.
 */
// export const disableInitialLoad = (args) => {
//   const disableInitialLoad = boolean('disableInitialLoad', false);
//   return (
//     <>
//       <BentoGpt
//         adUnitPath="/21730346048/test-skyscraper"
//         optDiv="div3"
//         height="600"
//         width="120"
//         disableInitialLoad={disableInitialLoad}
//         {...args}
//       >
//         This text is inside.
//       </BentoGpt>
//       <button onclick="googletag.cmd.push(function() { googletag.pubads().refresh(); });">
//         Show/Refresh Ad
//       </button>
//     </>
//   );
// };
