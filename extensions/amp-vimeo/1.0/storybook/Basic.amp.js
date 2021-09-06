import {withAmp} from '@ampproject/storybook-addon';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';

export default {
  title: 'amp-vimeo-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-vimeo', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Default = ({id}) => {
  const videoid = text('videoid', '27246366');
  const autoplay = boolean('autoplay', true);
  const doNotTrack = boolean('do-not-track', false);
  return (
    <amp-vimeo
      id={id}
      width="16"
      height="9"
      layout="responsive"
      autoplay={autoplay}
      data-videoid={videoid}
      do-not-track={doNotTrack}
    />
  );
};

export const WithPlaceholderAndFallback = ({id}) => {
  const videoid = text('videoid', '27246366');
  const autoplay = boolean('autoplay', true);
  const doNotTrack = boolean('do-not-track', false);
  return (
    <amp-vimeo
      id={id}
      width="16"
      height="9"
      layout="responsive"
      autoplay={autoplay}
      data-videoid={videoid}
      do-not-track={doNotTrack}
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-vimeo>
  );
};

export const Actions = () => {
  const id = 'my-vimeo';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} />
    </VideoElementWithActions>
  );
};
