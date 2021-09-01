import {withAmp} from '@ampproject/storybook-addon';
import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-embedly-card-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-embedly-card', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  const apiKey = text('Embedly API Key', 'valid-api-key');
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

export const WithAPIKey = () => {
  const apiKey = text('Embedly API Key', 'valid-api-key');
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

export const WithPlaceholderAndFallback = () => {
  const apiKey = text('Embedly API Key', 'valid-api-key');
  return (
    <>
      <amp-embedly-key layout="nodisplay" value={apiKey}></amp-embedly-key>
      <amp-embedly-card
        data-url="https://www.youtube.com/watch?v=lBTCB7yLs8Y"
        layout="responsive"
        width="300"
        height="200"
      >
        <div placeholder style="background:red">
          Placeholder. Loading content...
        </div>

        <div fallback style="background:blue">
          Fallback. Could not load content...
        </div>
      </amp-embedly-card>
    </>
  );
};
