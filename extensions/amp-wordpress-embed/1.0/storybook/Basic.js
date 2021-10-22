import * as Preact from '#preact';

import {BentoWordPressEmbed} from '../component';

export default {
  title: 'WordPressEmbed',
  component: BentoWordPressEmbed,
  args: {
    url: 'https://wordpress.org/news/2021/06/gutenberg-highlights',
    width: 500,
    height: 200,
  },
};

export const _default = ({height, width, ...args}) => {
  return <BentoWordPressEmbed style={{width, height}} {...args} />;
};
