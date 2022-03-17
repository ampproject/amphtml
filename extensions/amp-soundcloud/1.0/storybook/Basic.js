import {BentoSoundcloud} from '#bento/components/bento-soundcloud/1.0/component';

import * as Preact from '#preact';

import {rgba2hex} from './converter';

export default {
  title: 'Soundcloud',
  component: BentoSoundcloud,
};

export const track = ({componentColor, trackId, ...args}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <BentoSoundcloud
      color={hex}
      style={{height: '240px'}}
      trackId={trackId}
      {...args}
    />
  );
};

track.args = {
  trackId: '864765493',
  visual: true,
};

track.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
};

export const playlist = ({componentColor, playlistId, ...args}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <BentoSoundcloud
      color={hex}
      style={{height: '240px'}}
      playlistId={playlistId}
      {...args}
    />
  );
};

playlist.args = {
  playlistId: '151584683',
  visual: true,
};

playlist.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
};
