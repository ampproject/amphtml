import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-audio-0_1',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-audio', version: '0.1'}],
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
      height="50"
      width="auto"
      controls
    >
      <div fallback>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};

export const Fixed = () => {
  return (
    <amp-audio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="50"
      width="600"
      layout="fixed"
      controls
    >
      <div fallback>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};

export const FixedHeight = () => {
  return (
    <amp-audio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="50"
      layout="fixed-height"
      controls
    >
      <div fallback>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};

export const nodisplay = () => {
  return (
    <>
      <amp-audio
        id="audioControl1"
        src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
        artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
        title="Snow Fight"
        album="Jan Morgenstern"
        artist="Sintel"
        layout="nodisplay"
        controls
      >
        <div fallback>Your browser doesn’t support HTML5 audio</div>
      </amp-audio>
      <button on="tap:audioControl1.play">Play</button>
      <button on="tap:audioControl1.pause">Pause</button>
    </>
  );
};
