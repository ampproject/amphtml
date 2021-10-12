import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-embedly-card-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-embedly-card', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    apiKey: 'valid-api-key',
  },
};

export const _default = ({apiKey}) => {
  return (
    <>
      <amp-embedly-key layout="nodisplay" value={apiKey}></amp-embedly-key>
      <amp-embedly-card
        data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        layout="responsive"
        width="300"
        height="200"
      ></amp-embedly-card>
    </>
  );
};

export const WithPlaceholderAndFallback = ({apiKey}) => {
  return (
    <>
      <amp-embedly-key layout="nodisplay" value={apiKey}></amp-embedly-key>
      <amp-embedly-card
        data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        layout="responsive"
        width="300"
        height="200"
      >
        <div placeholder style={{background: 'blue'}}>
          Placeholder. Loading content...
        </div>

        <div fallback style={{background: 'red'}}>
          Fallback. Could not load content...
        </div>
      </amp-embedly-card>
    </>
  );
};
