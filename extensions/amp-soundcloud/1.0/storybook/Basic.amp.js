import {withAmp} from '@ampproject/storybook-addon';
import {boolean, color, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {rgba2hex} from './converter';

export default {
  title: 'amp-soundcloud-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-soundcloud', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const TrackId = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const height = text('Height', '180');
  const trackid = text('Track ID', '864765493');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackid}
      data-visual={visual}
      height={height}
      layout="fixed-height"
      width="auto"
    />
  );
};

export const PlaylistId = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const height = text('Height', '180');
  const playlistId = text('Playlist ID', '151584683');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Bento Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-playlistid={playlistId}
      data-visual={visual}
      height={height}
      layout="fixed-height"
      width="auto"
    />
  );
};

export const MediaQuery = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const trackid1 = text('Track ID 1', '864765493');
  const trackid2 = text('Track ID 2', '582363801');
  const media1 = text('Media Query 1', '(min-width: 650px)');
  const media2 = text('Media Query 2', '(max-width: 649px)');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <>
      <amp-soundcloud
        data-color={hex}
        data-trackid={trackid1}
        data-visual={visual}
        height="240"
        layout="fixed"
        media={media1}
        width="240"
      />
      <amp-soundcloud
        data-color={hex}
        data-trackid={trackid2}
        data-visual={visual}
        height="180"
        layout="responsive"
        media={media2}
        width="180"
      />
    </>
  );
};

export const ResponsiveLayout = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const trackid = text('Track ID', '864765493');
  const sizes = text('Sizes', '(min-width: 720px) 520px, 100vw');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackid}
      data-visual={visual}
      height="340"
      layout="responsive"
      sizes={sizes}
      width="520"
    />
  );
};

export const WithPlaceholderAndFallback = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const height = text('Height', '180');
  const trackid = text('Track ID', '864765493');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackid}
      data-visual={visual}
      height={height}
      layout="fixed-height"
      width="auto"
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-soundcloud>
  );
};
