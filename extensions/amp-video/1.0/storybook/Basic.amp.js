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
    width: '640px',
    height: '360px',
    ariaLabel: 'Video Player',
    autoplay: true,
    controls: true,
    mediasession: true,
    noaudio: false,
    loop: false,
    poster: 'https://amp.dev/static/inline-examples/images/kitten-playing.png',
    artist: '',
    album: '',
    artwork: '',
    title: '',
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

const AmpVideoWithControls = ({ariaLabel, i, sources, ...args}) => {
  const group = i ? `Player ${i + 1}` : undefined;

  return (
    <amp-video aria-label={ariaLabel} layout="responsive" id={group} {...args}>
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

export const Default = ({
  amount,
  spaceAbove,
  spaceBelow,
  spacerHeight,
  ...args
}) => {
  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<AmpVideoWithControls key={i} i={i} {...args} />);
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

Default.args = {
  amount: 1,
  spacerHeight: '80vh',
  spacerAbove: false,
  spacerBelow: false,
};

export const Actions = ({...args}) => {
  const id = 'player';
  return (
    <VideoElementWithActions id={id}>
      <AmpVideoWithControls id={id} {...args} />
    </VideoElementWithActions>
  );
};

export const InsideAccordion = ({...args}) => {
  return (
    <amp-accordion expand-single-section>
      <section expanded>
        <h2>Video</h2>
        <div>
          <amp-video controls loop {...args}>
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

InsideAccordion.args = {
  width: 320,
  height: 180,
  autoplay: false,
};

export const InsideDetails = ({...args}) => {
  return (
    <details open>
      <summary>Video</summary>
      <amp-video controls loop {...args}>
        <source
          type="video/mp4"
          src="https://amp.dev/static/inline-examples/videos/kitten-playing.mp4"
        ></source>
      </amp-video>
    </details>
  );
};

InsideDetails.args = {
  width: 320,
  height: 180,
  autoplay: false,
};
