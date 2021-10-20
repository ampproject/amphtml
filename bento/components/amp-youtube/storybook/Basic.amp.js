import {withAmp} from '@ampproject/storybook-addon';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';

export default {
  title: 'amp-youtube-1_0',
  decorators: [withKnobs, withAmp],
  parameters: {
    extensions: [
      {name: 'amp-youtube', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
};

export const Default = ({id}) => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const layout = text('layout', 'responsive');
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const width = number('width', 300);
  const height = number('height', 200);
  const credentials = text('credentials', 'include');
  return (
    <amp-youtube
      id={id}
      width={width}
      height={height}
      data-videoid={videoid}
      layout={layout}
      autoplay={autoplay}
      loop={loop}
      credentials={credentials}
    ></amp-youtube>
  );
};

export const Actions = () => {
  const id = 'my-amp-youtube';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} />
    </VideoElementWithActions>
  );
};

export const InsideAccordion = () => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const width = number('width', 300);
  const height = number('height', 200);
  const autoplay = boolean('autoplay', false);
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>YouTube Video</h2>
        <div>
          <amp-youtube
            width={width}
            height={height}
            data-videoid={videoid}
            autoplay={autoplay}
            loop
          ></amp-youtube>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = () => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const width = number('width', 300);
  const height = number('height', 200);
  const autoplay = boolean('autoplay', false);
  return (
    <details open>
      <summary>YouTube Video</summary>
      <amp-youtube
        width={width}
        height={height}
        data-videoid={videoid}
        autoplay={autoplay}
        loop
      ></amp-youtube>
    </details>
  );
};

export const WithPlaceholder = ({id}) => {
  const videoid = text('videoid', 'IAvf-rkzNck');
  const layout = text('layout', 'responsive');
  const autoplay = boolean('autoplay', false);
  const loop = boolean('loop', false);
  const width = number('width', 300);
  const height = number('height', 200);
  const credentials = text('credentials', 'include');
  return (
    <amp-youtube
      id={id}
      width={width}
      height={height}
      data-videoid={videoid}
      layout={layout}
      autoplay={autoplay}
      loop={loop}
      credentials={credentials}
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-youtube>
  );
};

Default.storyName = 'Default';
