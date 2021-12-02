import * as Preact from '#preact';

import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-beopinion-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-beopinion', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-account': '589446dd42ee0d6fdd9c3dfd',
    'data-content': '5a703a2f46e0fb00016d51b3',
  },
};

export const _default = (args) => {
  return <amp-beopinion {...args}></amp-beopinion>;
};
