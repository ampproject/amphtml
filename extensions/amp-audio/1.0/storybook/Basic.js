import * as Preact from '#preact';

import {BentoAudio} from '../component';

export default {
  title: 'Audio',
  component: BentoAudio,
};

export const _default = () => {
  return (
    <BentoAudio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      style={{height: '75px', width: 'auto'}}
      controls
    ></BentoAudio>
  );
};

export const LoadAudioThroughSources = () => {
  return (
    <BentoAudio
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
    ></BentoAudio>
  );
};
