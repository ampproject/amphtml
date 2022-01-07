import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-gist-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-gist', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  return (
    <amp-gist
      data-gistid="b9bb35bc68df68259af94430f012425f"
      layout="fixed-height"
      height="300"
    ></amp-gist>
  );
};
