import * as Preact from '#preact';

import {BentoPanZoom} from '../component';

export default {
  title: 'PanZoom',
  component: BentoPanZoom,
  args: {
    style: {width: 400, height: 225},
  },
};

const ipsum = `Lorem ipsum dolor sit amet, consectetur adipisicing elit. Adipisci beatae dolores dolorum ducimus ex explicabo iusto magni maxime nam natus necessitatibus odio, odit porro quidem saepe sed sunt, temporibus veritatis. Aspernatur beatae eveniet expedita facilis iste numquam rerum! Explicabo ipsum nisi recusandae. Et in necessitatibus nisi nulla, officia placeat quas tenetur. Ab atque autem blanditiis ea eos explicabo fuga illum iste neque, non pariatur quae quos sed sit tenetur, vel velit. Ab dolorum harum nulla officiis, sunt suscipit tenetur? Animi aperiam atque eos nostrum voluptatibus. Atque dolorum ea, earum eligendi ipsum nesciunt pariatur placeat, quo quod similique sit sunt vitae.`;
const img = `https://lh3.googleusercontent.com/pSECrJ82R7-AqeBCOEPGPM9iG9OEIQ_QXcbubWIOdkY=w400-h300-no`;
export const _default = (args) => {
  return (
    <BentoPanZoom {...args}>
      <div style={{border: '1px solid black'}}>{ipsum}</div>
    </BentoPanZoom>
  );
};

export const AutomaticSize = (args) => {
  return (
    <BentoPanZoom {...args} style={{}}>
      <div style={{border: '1px solid black'}}>{ipsum}</div>
    </BentoPanZoom>
  );
};

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
