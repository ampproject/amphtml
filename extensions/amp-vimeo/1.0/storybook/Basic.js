import {BentoVimeo} from '#bento/components/bento-vimeo/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Vimeo',
  component: BentoVimeo,
  args: {
    videoid: '27246366',
  },
  argTypes: {
    width: {
      name: 'width',
      control: {type: 'number'},
      defaultValue: 320,
    },
    height: {
      name: 'height',
      control: {type: 'number'},
      defaultValue: 180,
    },
    autoplay: {
      name: 'autoplay',
      control: {type: 'boolean'},
      defaultValue: true,
    },
    doNotTrack: {
      name: 'doNotTrack',
      control: {type: 'boolean'},
      defaultValue: false,
    },
  },
};

export const _default = ({height, width, ...args}) => {
  return <BentoVimeo style={{width, height}} {...args} />;
};
