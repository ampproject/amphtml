import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-youtube-0_1',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-youtube', version: 0.1}],
  },
  args: {
    videoId: 'mGENRKrdoGY',
  },
};

export const Default = ({videoId}) => {
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="fixed"
      width="480"
      height="270"
    ></amp-youtube>
  );
};

Default.storyName = 'default';

export const Responsive = ({videoId}) => {
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="responsive"
      width="480"
      height="270"
    ></amp-youtube>
  );
};

Responsive.storyName = 'responsive';

export const Autoplay = ({videoId}) => {
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="fixed"
      width="480"
      height="270"
      autoplay
    ></amp-youtube>
  );
};

Autoplay.storyName = 'autoplay';
