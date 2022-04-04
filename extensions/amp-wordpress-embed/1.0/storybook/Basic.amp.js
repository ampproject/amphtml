import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-wordpress-embed-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-wordpress-embed', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'data-url': 'https://wordpress.org/news/2021/06/gutenberg-highlights',
    width: 500,
    height: 200,
    layout: 'fixed',
  },
};

export const BasicEmbedExample = (args) => {
  return (
    <>
      <amp-wordpress-embed {...args}>
        <button overflow>Load more</button>
      </amp-wordpress-embed>
      <p>text below</p>
    </>
  );
};

export const WithPlaceholderAndFallback = (args) => {
  return (
    <>
      <amp-wordpress-embed {...args}>
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
