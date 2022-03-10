import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {rgba2hex} from './converter';

export default {
  title: 'amp-soundcloud-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-soundcloud', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const TrackId = ({componentColor, trackId, visual, ...args}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackId}
      data-visual={visual}
      layout="fixed-height"
      width="auto"
      {...args}
    />
  );
};

TrackId.args = {
  trackId: '864765493',
};

TrackId.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
  height: {
    name: 'height',
    defaultValue: 180,
    control: {type: 'number'},
  },
  visual: {
    name: 'visual',
    defaultValue: true,
    control: {type: 'boolean'},
  },
};

export const PlaylistId = ({componentColor, playlistId, visual, ...args}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Bento Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-playlistid={playlistId}
      data-visual={visual}
      layout="fixed-height"
      width="auto"
      {...args}
    />
  );
};

PlaylistId.args = {
  playlistId: '151584683',
};

PlaylistId.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
  height: {
    name: 'height',
    defaultValue: 180,
    control: {type: 'number'},
  },
  visual: {
    name: 'visual',
    defaultValue: true,
    control: {type: 'boolean'},
  },
};

export const MediaQuery = ({
  componentColor,
  media1,
  media2,
  trackId1,
  trackId2,
  visual,
  ...args
}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <>
      <amp-soundcloud
        data-color={hex}
        data-trackid={trackId1}
        data-visual={visual}
        height="240"
        layout="fixed"
        media={media1}
        width="240"
        {...args}
      />
      <amp-soundcloud
        data-color={hex}
        data-trackid={trackId2}
        data-visual={visual}
        height="180"
        layout="responsive"
        media={media2}
        width="180"
        {...args}
      />
    </>
  );
};

MediaQuery.args = {
  trackId1: '864765493',
  trackId2: '582363801',
  media1: '(min-width: 650px)',
  media2: '(max-width: 649px)',
};

MediaQuery.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
  visual: {
    name: 'visual',
    defaultValue: 'true',
    control: {type: 'boolean'},
  },
};

export const ResponsiveLayout = ({
  componentColor,
  trackId,
  visual,
  ...args
}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackId}
      data-visual={visual}
      height="340"
      layout="responsive"
      width="520"
      {...args}
    />
  );
};

ResponsiveLayout.args = {
  trackId: '864765493',
  sizes: '(min-width: 720px) 520px, 100vw',
};

ResponsiveLayout.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
  visual: {
    name: 'visual',
    defaultValue: true,
    control: {type: 'boolean'},
  },
};

export const WithPlaceholderAndFallback = ({
  componentColor,
  trackId,
  visual,
  ...args
}) => {
  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-trackid={trackId}
      data-visual={visual}
      layout="fixed-height"
      width="auto"
      {...args}
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

WithPlaceholderAndFallback.args = {
  trackId: '864765493',
};

WithPlaceholderAndFallback.argTypes = {
  componentColor: {
    name: 'componentColor',
    control: {type: 'color'},
    defaultValue: 'RGBA(255, 85, 0, 1)',
  },
  height: {
    name: 'height',
    defaultValue: 180,
    control: {type: 'number'},
  },
  visual: {
    name: 'visual',
    defaultValue: true,
    control: {type: 'boolean'},
  },
};
