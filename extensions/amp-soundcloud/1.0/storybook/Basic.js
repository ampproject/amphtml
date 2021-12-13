import {boolean, color, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {rgba2hex} from './converter';

import {BentoSoundcloud} from '../component';

export default {
  title: 'Soundcloud',
  component: BentoSoundcloud,
  decorators: [withKnobs],
};

export const track = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const trackid = text('Track ID', '864765493');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <BentoSoundcloud
      color={hex}
      style={{height: '240px'}}
      trackId={trackid}
      visual={visual}
    />
  );
};

export const playlist = () => {
  // Knobs
  const componentColor = color('color', 'RGBA(255, 85, 0, 1)');
  const playlistid = text('Playlist ID', '151584683');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <BentoSoundcloud
      color={hex}
      style={{height: '240px'}}
      playlistId={playlistid}
      visual={visual}
    />
  );
};
