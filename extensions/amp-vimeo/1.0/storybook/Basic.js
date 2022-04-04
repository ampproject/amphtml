import {BentoVimeo} from '#bento/components/bento-vimeo/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Vimeo',
  component: BentoVimeo,
  args: {
    videoid: '27246366',
    width: 320,
    height: 180,
    autoplay: true,
    doNotTrack: false,
  },
};

export const _default = ({height, width, ...args}) => {
  return <BentoVimeo style={{width, height}} {...args} />;
};
