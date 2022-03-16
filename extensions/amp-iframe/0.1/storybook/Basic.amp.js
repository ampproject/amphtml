import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-iframe',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-iframe', version: '0.1'}],
  },
};

export const _default = () => {
  return (
    <amp-iframe
      sandbox="allow-same-origin allow-scripts"
      src="http://ads.localhost:8000/extensions/amp-iframe/0.1/storybook/iframe.html"
      width="400"
      height="300"
      layout="fixed"
    >
      <div placeholder>loading...</div>
      <div fallback>disallowed</div>
    </amp-iframe>
  );
};
