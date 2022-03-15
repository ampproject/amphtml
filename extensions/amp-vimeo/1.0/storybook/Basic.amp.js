import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';

export default {
  title: 'amp-vimeo-1_0',
  decorators: [withAmp],

  parameters: {
    extensions: [{name: 'amp-vimeo', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    videoid: '27246366',
    autoplay: true,
    doNotTrack: false,
  },
};

export const Default = ({doNotTrack, id, videoid, ...args}) => {
  return (
    <amp-vimeo
      id={id}
      width="16"
      height="9"
      layout="responsive"
      data-videoid={videoid}
      do-not-track={doNotTrack}
      {...args}
    />
  );
};

export const WithPlaceholderAndFallback = ({
  doNotTrack,
  id,
  videoid,
  ...args
}) => {
  return (
    <amp-vimeo
      id={id}
      width="16"
      height="9"
      layout="responsive"
      data-videoid={videoid}
      do-not-track={doNotTrack}
      {...args}
    >
      <div placeholder style="background:red">
        Placeholder. Loading content...
      </div>

      <div fallback style="background:blue">
        Fallback. Could not load content...
      </div>
    </amp-vimeo>
  );
};

export const Actions = ({...args}) => {
  const id = 'my-vimeo';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} {...args} />
    </VideoElementWithActions>
  );
};
