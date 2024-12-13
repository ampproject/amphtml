import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-audio-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-audio', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  return (
    <amp-audio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="75"
      width="auto"
      layout="fixed-height"
      controls
    >
      <div>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};

export const LoadAudioThroughSources = () => {
  return (
    <amp-audio
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="75"
      width="auto"
      layout="fixed-height"
      controls
    >
      <source
        src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
        type="audio/mpeg"
      />
      <div fallback>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};
