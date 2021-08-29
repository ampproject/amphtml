import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {Audio} from '../component';

export default {
  title: 'Audio',
  component: Audio,
  decorators: [withKnobs],
};

export const _default = () => {
  return (
    <Audio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      style={{height: '75px', width: 'auto'}}
      controls
    ></Audio>
  );
};

export const LoadAudioThroughSources = () => {
  return (
    <Audio
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="75"
      width="auto"
      controls
      sources={
        <source
          src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
          type="audio/mpeg"
        />
      }
    ></Audio>
  );
};
