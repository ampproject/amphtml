import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-app-banner-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-app-banner', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'dismiss-button-aria-label': 'Dismiss',
  },
};

const cssContent = {
  display: 'flex',
  textAlign: 'center',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: 10,
};

export const _default = (args) => {
  return (
    <>
      <strong>
        This banner should be hidden, since this page does not include required
        meta tags
      </strong>
      <amp-app-banner {...args} id="ID">
        <div class="content" style={cssContent}>
          <img
            src="https://cdn-images-1.medium.com/max/800/1*JLegdtjFMNgqHgnxdd04fg.png"
            width="40"
            height="34"
          />
          <div class="description">
            <h5>Get the App</h5>
            <p>Experience a richer experience on our mobile app!</p>
          </div>
          <div class="actions">
            <button open-button>Open In App</button>
          </div>
        </div>
      </amp-app-banner>
    </>
  );
};
