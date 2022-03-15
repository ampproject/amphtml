import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';

export default {
  title: 'amp-youtube-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-youtube', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
  args: {
    videoid: 'IAvf-rkzNck',
    layout: 'responsive',
    autoplay: false,
    loop: false,
    width: 300,
    height: 300,
    credentials: 'include',
  },
};

export const Default = ({id, videoid, ...args}) => {
  return <amp-youtube id={id} data-videoid={videoid} {...args}></amp-youtube>;
};

export const Actions = ({...args}) => {
  const id = 'my-amp-youtube';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} {...args} />
    </VideoElementWithActions>
  );
};

export const InsideAccordion = ({videoid, ...args}) => {
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>YouTube Video</h2>
        <div>
          <amp-youtube data-videoid={videoid} {...args}></amp-youtube>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = ({videoid, ...args}) => {
  return (
    <details open>
      <summary>YouTube Video</summary>
      <amp-youtube data-videoid={videoid} {...args}></amp-youtube>
    </details>
  );
};

export const WithPlaceholder = ({id, videoid, ...args}) => {
  return (
    <amp-youtube id={id} data-videoid={videoid} {...args}>
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
