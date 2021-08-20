import {number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {WordPressEmbed} from '../component';

export default {
  title: 'WordPressEmbed',
  component: WordPressEmbed,
  decorators: [withKnobs],
};

export const _default = () => {
  const url = text(
    'url',
    'https://wordpress.org/news/2021/06/gutenberg-highlights'
  );
  const width = number('width', 500);
  const height = number('height', 200);

  return <WordPressEmbed url={url} style={{width, height}} />;
};
