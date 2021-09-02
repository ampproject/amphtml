import {withAmp} from '@ampproject/storybook-addon';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-instagram-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {name: 'amp-instagram', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const _default = () => {
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
    ></amp-instagram>
  );
};

export const InsideAccordion = () => {
  const shortcode = text('shortcode', 'Bp4I3hRhd_v');
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>Post</h2>
        <div>
          <amp-instagram
            data-shortcode={shortcode}
            width={width}
            height={height}
          ></amp-instagram>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = () => {
  const shortcode = text('shortcode', 'Bp4I3hRhd_v');
  const width = number('width', 300);
  const height = number('height', 200);
  return (
    <details open>
      <summary>Post</summary>
      <amp-instagram
        data-shortcode={shortcode}
        width={width}
        height={height}
      ></amp-instagram>
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
