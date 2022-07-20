import * as Preact from '#preact';

import {BentoPanZoom} from '../component';

export default {
  title: 'PanZoom',
  component: BentoPanZoom,
  args: {
    style: {width: 400, height: 225},
  },
};

const ipsum50 = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Delectus dolor dolore dolorum facilis illo illum ipsam sint tempora totam voluptatem! Debitis distinctio doloribus ea excepturi inventore magni modi nihil obcaecati officiis quae quidem, repellat sapiente sequi. Assumenda consequatur dolorum eaque nostrum officia perspiciatis praesentium, quos, sequi tempora tempore ut voluptatibus.`;
const img = `https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no`;

export const WithImage = (args) => (
  <BentoPanZoom {...args}>
    <img height="225" width="400" alt="Destiny artwork" src={img} />
  </BentoPanZoom>
);

export const SmallImage = (args) => (
  <BentoPanZoom {...args}>
    <img height="88" width="160" alt="Destiny artwork" src={img} />
  </BentoPanZoom>
);

export const InitialScale = (args) => (
  <BentoPanZoom {...args} initialScale={3} initialX={-400} initialY={-75}>
    <img height="225" width="400" alt="Destiny artwork" src={img} />
  </BentoPanZoom>
);

export const WithText = (args) => {
  return (
    <BentoPanZoom {...args}>
      <div style={{border: '1px solid black'}}>{ipsum50}</div>
    </BentoPanZoom>
  );
};

export const WithLotsOfText = (args) => {
  return (
    <BentoPanZoom {...args}>
      <div style={{border: '1px solid black'}}>
        {ipsum50} {ipsum50} {ipsum50}
      </div>
    </BentoPanZoom>
  );
};

export const AutoSizeText = (args) => {
  return (
    <BentoPanZoom {...args} style={{}}>
      <div style={{border: '1px solid black'}}>{ipsum50}</div>
    </BentoPanZoom>
  );
};
