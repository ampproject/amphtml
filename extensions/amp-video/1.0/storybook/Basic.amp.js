import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {VideoElementWithActions} from './_helpers';

export default {
  title: 'amp-video-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {name: 'amp-video', version: '1.0'},
      {name: 'amp-accordion', version: '1.0'},
    ],
    experiments: ['bento'],
  },
  args: {
    amount: 1,
    spacerHeight: '80vh',
    spacerAbove: '80vh',
    spacerBelow: '80vh',
    width: '640px',
    height: '360px',
    ariaLabel: 'Video Player',
    autoplay: true,
    controls: true,
    mediasession: true,
    noaudio: false,
    loop: false,
    poster: 'https://amp.dev/static/inline-examples/images/kitten-playing.png',
    sources: [
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.webm',
        type: 'video/webm',
      },
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.mp4',
        type: 'video/mp4',
      },
    ],
  },
};

const AmpVideo = (args) => {
  const {sources} = args;

  return (
    <amp-video {...args} layout="responsive">
      {sources.map((props) => (
        <source {...props}></source>
      ))}
    </amp-video>
  );
};

const Spacer = ({height}) => {
  return (
    <div
      style={{
        height,
        background: `linear-gradient(to bottom, #bbb, #bbb 10%, #fff 10%, #fff)`,
        backgroundSize: '100% 10px',
      }}
    ></div>
  );
};

export const Default = (args) => {
  const {amount, spaceAbove, spaceBelow, spacerHeight} = args;

  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<AmpVideo {...args} key={i} i={i} />);
    if (i < amount - 1) {
      players.push(<Spacer height={spacerHeight} />);
    }
  }

  return (
    <>
      {spaceAbove && <Spacer height={spacerHeight} />}
      {players}
      {spaceBelow && <Spacer height={spacerHeight} />}
    </>
  );
};

export const Actions = (args) => {
  const id = 'player';
  return (
    <VideoElementWithActions id={id}>
      <AmpVideo {...args} id={id} />
    </VideoElementWithActions>
  );
};

export const InsideAccordion = (args) => {
  const {autoplay, height, width} = args;

  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>Video</h2>
        <div>
          <amp-video
            autoplay={autoplay}
            controls
            loop
            width={width}
            height={height}
          >
            <source
              type="video/mp4"
              src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
            ></source>
          </amp-video>
        </div>
      </section>
    </amp-accordion>
  );
};

export const InsideDetails = (args) => {
  const {autoplay, height, width} = args;

  return (
    <details open>
      <summary>Video</summary>
      <amp-video
        autoplay={autoplay}
        controls
        loop
        width={width}
        height={height}
      >
        <source
          type="video/mp4"
          src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
        ></source>
      </amp-video>
    </details>
  );
};
