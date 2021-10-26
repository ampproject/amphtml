import {BentoWordPressEmbed} from '#bento/components/amp-wordpress-embed/component';

import * as Preact from '#preact';

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
