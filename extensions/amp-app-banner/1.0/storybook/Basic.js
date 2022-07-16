import * as Preact from '#preact';

import {AppBanner} from '../component';

// TODO: use something like storybook actions instead of console.log:
// eslint-disable-next-line local/no-forbidden-terms
const action = (message) => () => console.log(message);

export default {
  title: 'AppBanner',
  component: AppBanner,
  args: {
    onInstall: action('onInstall'),
    onDismiss: action('onDismiss'),
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
      <em>
        The banner below normally only shows if platform-specific app tags are
        included in the document head
      </em>
      <AppBanner {...args} id="ID">
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
      </AppBanner>
    </>
  );
};
