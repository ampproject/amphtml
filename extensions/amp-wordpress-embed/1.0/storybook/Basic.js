import * as Preact from '#preact';

import {WordPressEmbed} from '../component';

export default {
  title: 'WordPressEmbed',
  component: WordPressEmbed,
  args: {
    url: 'https://wordpress.org/news/2021/06/gutenberg-highlights',
    width: 500,
    height: 200,
  },
};

export const _default = ({height, width, ...args}) => {
  return <WordPressEmbed style={{width, height}} {...args} />;
};
