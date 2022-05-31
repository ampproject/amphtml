import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';

export default {
  title: 'amp-brightcove-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-brightcove', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    autoplay: false,
    'data-video-id': 'ref:amp-docs-sample',
    'data-player-id': 'SyIOV8yWM',
    'data-account': '1290862519001',
    'data-referrer': 'EXTERNAL_REFERRER',
    height: '270',
    width: '480',
  },
};

export const Default = (args) => {
  return <amp-brightcove layout="responsive" {...args}></amp-brightcove>;
};

export const WithPlaceholderAndFallback = (args) => {
  return (
    <amp-brightcove layout="responsive" {...args}>
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-brightcove>
  );
};

export const Actions = (args) => {
  return (
    <VideoElementWithActions id="myPlayer">
      <amp-brightcove
        id="myPlayer"
        layout="responsive"
        {...args}
      ></amp-brightcove>
    </VideoElementWithActions>
  );
};
