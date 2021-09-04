import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {Vimeo} from '../component';

export default {
  title: 'Vimeo',
  component: Vimeo,
  decorators: [withKnobs],
};

export const _default = () => {
  const videoid = text('videoid', '27246366');
  const width = number('width', 320);
  const height = number('height', 180);
  const autoplay = boolean('autoplay', true);
  const doNotTrack = boolean('do-not-track', false);
  return (
    <Vimeo
      style={{width, height}}
      autoplay={autoplay}
      doNotTrack={doNotTrack}
      videoid={videoid}
    />
  );
};
