import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-video-iframe-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-video-iframe', version: '1.0'}],
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
    src: 'https://amp.dev/static/samples/files/amp-video-iframe-videojs.html',
  },
};

const AmpVideoIframeWithControls = ({
  ariaLabel,
  i,
  withPlaceholder,
  ...args
}) => {
  const group = i ? `Player ${i + 1}` : undefined;
  const placeholderAndFallback = withPlaceholder ? (
    <>
      <div placeholder style="background:red">
        placeholder
      </div>
      <div fallback style="background:blue">
        fallback
      </div>
    </>
  ) : null;

  return (
    <amp-video-iframe
      id={group}
      aria-label={ariaLabel}
      layout="responsive"
      {...args}
    >
      {placeholderAndFallback}
    </amp-video-iframe>
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
    players.push(<AmpVideoIframeWithControls key={i} i={i} {...args} />);
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
  spaceAbove: false,
  spaceBelow: false,
};

const ActionButton = ({children, ...props}) => (
  <button style={{flex: 1, margin: '0 4px'}} {...props}>
    {children}
  </button>
);

export const Actions = ({...args}) => {
  return (
    <div style="max-width: 800px">
      <AmpVideoIframeWithControls id="player" {...args} />
      <div
        style={{
          margin: '12px 0',
          display: 'flex',
        }}
      >
        <ActionButton on="tap:player.play">Play</ActionButton>
        <ActionButton on="tap:player.pause">Pause</ActionButton>
        <ActionButton on="tap:player.mute">Mute</ActionButton>
        <ActionButton on="tap:player.unmute">Unmute</ActionButton>
        <ActionButton on="tap:player.fullscreen">Fullscreen</ActionButton>
      </div>
    </div>
  );
};

export const WithPlaceholderAndFallback = ({
  amount,
  spaceAbove,
  spaceBelow,
  spacerHeight,
  ...args
}) => {
  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(
      <AmpVideoIframeWithControls key={i} i={i} placeholder={true} {...args} />
    );
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

WithPlaceholderAndFallback.args = {
  amount: 1,
  spacerHeight: '80vh',
  spaceAbove: false,
  spaceBelow: false,
};
