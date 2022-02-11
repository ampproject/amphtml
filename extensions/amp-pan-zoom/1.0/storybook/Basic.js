import * as Preact from '#preact';

import {BentoPanZoom} from '../component';

export default {
  title: 'PanZoom',
  component: BentoPanZoom,
  args: {},
};

const Foo = ({children}) => <div>Foo stuff{children}</div>;

export const _default = () => {
  return (
    <BentoPanZoom style={{width: 300, height: 200}}>
      <Foo>
        <span>This text is inside.</span>
        This text is inside.
      </Foo>
    </BentoPanZoom>
  );
};

// export const _default = (args) => {
//   return (
//     <BentoPanZoom style={{width: 300, height: 200}} {...args}>
//       This text is inside.
//     </BentoPanZoom>
//   );
// };
