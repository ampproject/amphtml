import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-instagram-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-instagram', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
  args: {
    width: 500,
    height: 600,
    layout: 'fixed',
    'data-shortcode': 'B8QaZW4AQY_',
    'data-captioned': false,
  },
};

export const _default = (args) => {
  return <amp-instagram {...args}></amp-instagram>;
};

export const InsideAccordion = (args) => {
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>Post</h2>
        <div>
          <amp-instagram {...args}></amp-instagram>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = (args) => {
  return (
    <details open>
      <summary>Post</summary>
      <amp-instagram {...args}></amp-instagram>
    </details>
  );
};

export const WithPlaceholderAndFallback = () => {
  const width = number('width', 500);
  const height = number('height', 600);
  const shortcode = text('shortcode', 'B8QaZW4AQY_');
  const captioned = boolean('captioned');
  const layout = text('layout', 'fixed');

  return (
    <amp-instagram
      data-shortcode={shortcode}
      data-captioned={captioned}
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
    </amp-instagram>
  );
};
