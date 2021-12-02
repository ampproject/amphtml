import * as Preact from '#preact';
import {BentoBeopinion} from '../component';

export default {
  title: 'Beopinion',
  component: BentoBeopinion,
  args: {
    account: '589446dd42ee0d6fdd9c3dfd',
    content: '5a703a2f46e0fb00016d51b3',
  },
};

export const _default = ({...args}) => {
  return (
    <BentoBeopinion style={{width: 300, height: 200}} {...args}>
      This text is inside.
    </BentoBeopinion>
  );
};
