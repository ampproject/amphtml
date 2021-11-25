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
      style={{height: '600px', width: '120px'}}
      {...args}
    >
      This text is inside.
    </BentoGpt>
  );
};

export const targeting = (args) => {
  const targetingAtf = {color: 'red', position: 'atf'};
  const targetingBtf = {position: 'btf'};

  return (
    <>
      <BentoGpt
        adUnitPath="/6355419/Travel/Asia"
        optDiv="div_targeting_atf"
        style={{height: '90px', width: '728px'}}
        fallbackDiv={() => {
          <div>Error while loading Ad!</div>;
        }}
        {...args}
        targeting={JSON.stringify(targetingAtf)}
      ></BentoGpt>
      <BentoGpt
        adUnitPath="/6355419/Travel/Asia"
        optDiv="div_targeting_btf"
        style={{height: '90px', width: '728px'}}
        fallbackDiv={() => {
          <div>Error while loading Ad!</div>;
        }}
        {...args}
        targeting={JSON.stringify(targetingBtf)}
      ></BentoGpt>
    </>
  );
};

export const disableInitialLoad = (args) => {
  const disableInitialLoad = boolean('disable-initial-load', true);

  // TODO(#30447): replace imperative calls with "button" knobs when the
  // Storybook 6.1 is released.
  const gptSlotRef = Preact.useRef();

  return (
    <>
      <BentoGpt
        adUnitPath="/21730346048/test-skyscraper"
        optDiv="div_disable_initial_load"
        style={{height: '250px', width: '300px'}}
        fallbackDiv={() => {
          <div>Error while loading Ad!</div>;
        }}
        {...args}
        disableInitialLoad={disableInitialLoad}
        ref={gptSlotRef}
      ></BentoGpt>
      <button onClick={() => gptSlotRef.current.refresh()}>
        Show/Refresh Ad
      </button>
    </>
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
