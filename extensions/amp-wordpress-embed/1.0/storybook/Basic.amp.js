import {withAmp} from '@ampproject/storybook-addon';
import {number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-wordpress-embed-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-wordpress-embed', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const BasicEmbedExample = () => {
  const url = text(
    'url',
    'https://wordpress.org/news/2021/06/gutenberg-highlights'
  );
  const width = number('width', 500);
  const height = number('height', 200);
  const layout = text('layout', 'fixed');

  return (
    <>
      <amp-wordpress-embed
        data-url={url}
        width={width}
        height={height}
        layout={layout}
      >
        <button overflow>Load more</button>
      </amp-wordpress-embed>
      <p>text below</p>
    </>
  );
};

export const WithPlaceholderAndFallback = () => {
  const url = text(
    'url',
    'https://wordpress.org/news/2021/06/gutenberg-highlights'
  );
  const width = number('width', 500);
  const height = number('height', 200);
  const layout = text('layout', 'fixed');

  return (
    <>
      <amp-wordpress-embed
        data-url={url}
        width={width}
        height={height}
        layout={layout}
      >
        <div placeholder style="background:red">
          Placeholder. Loading content...
        </div>

        <div fallback style="background:blue">
          Fallback. Could not load content...
        </div>
      </amp-wordpress-embed>
      <p>text below</p>
    </>
  );
};

BasicEmbedExample.story = {
  name: 'Basic example',
};
