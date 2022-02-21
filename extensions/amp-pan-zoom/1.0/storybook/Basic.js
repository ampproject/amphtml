import * as Preact from '#preact';

import {BentoPanZoom} from '../component';

export default {
  title: 'PanZoom',
  component: BentoPanZoom,
  args: {
    style: {width: 300, height: 200},
  },
};

export const _default = (args) => {
  return (
    <BentoPanZoom {...args}>
      <span>This text is inside.</span>
      This text is inside.
    </BentoPanZoom>
  );
};

export const WithImage = (args) => (
  <BentoPanZoom {...args}>
    <img
      height="225"
      width="400"
      alt="Destiny artwork"
      src="https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no"
    />
  </BentoPanZoom>
);

// export const _default = (args) => {
//   return (
//     <BentoPanZoom style={{width: 300, height: 200}} {...args}>
//       This text is inside.
//     </BentoPanZoom>
//   );
// };
