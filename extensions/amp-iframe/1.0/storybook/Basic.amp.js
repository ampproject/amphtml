import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-iframe-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-iframe', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const WithSrc = () => {
  return (
    <amp-iframe
      width="800"
      height="600"
      src="https://www.wikipedia.org/"
    ></amp-iframe>
  );
};

WithSrc.storyName = 'amp-iframe with src attribute';

export const WithPlaceholder = () => {
  return (
    <amp-iframe width="800" height="600" src="https://www.wikipedia.org/">
      <h1>Placeholder</h1>
    </amp-iframe>
  );
};

WithPlaceholder.storyName = 'amp-iframe with placeholder';
