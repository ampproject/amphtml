import {withAmp} from '@ampproject/storybook-addon';
import {text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-youtube-0_1',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-youtube', version: 0.1}],
  },
};

export const Default = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
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

export const Responsive = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
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

export const Autoplay = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
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
