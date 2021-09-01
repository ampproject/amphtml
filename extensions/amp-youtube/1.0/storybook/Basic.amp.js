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

  argTypes: {
    "data-videoid": {
      control: {
        type: "text"
      }
    },

    layout: {
      control: {
        type: "text"
      }
    },

    autoplay: {
      control: {
        type: "boolean"
      }
    },

    loop: {
      control: {
        type: "boolean"
      }
    },

    width: {
      control: {
        type: "number"
      }
    },

    height: {
      control: {
        type: "number"
      }
    },

    credentials: {
      control: {
        type: "text"
      }
    },

    "data-videoid": {},
    "data-videoid": {}
  },

  args: {
    "data-videoid": 'IAvf-rkzNck',
    layout: 'responsive',
    autoplay: false,
    loop: false,
    width: 300,
    height: 200,
    credentials: 'include',
    "data-videoid": {},
    "data-videoid": {}
  }
};

export const Default = args => {
  return <amp-youtube id={id}></amp-youtube>;
};

export const Actions = () => {
  const id = 'my-amp-youtube';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} />
    </VideoElementWithActions>
  );
};

export const InsideAccordion = (
  {
    videoid,
    width,
    height,
    autoplay
  }
) => {
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

export const InsideDetails = (
  {
    videoid,
    width,
    height,
    autoplay
  }
) => {
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

Default.storyName = 'Default';
