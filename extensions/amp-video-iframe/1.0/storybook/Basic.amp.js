import {withAmp} from '@ampproject/storybook-addon';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-video-iframe-1_0',
  decorators: [withKnobs, withAmp],
  parameters: {
    extensions: [{name: 'amp-video-iframe', version: '1.0'}],
    experiments: ['bento'],
  },
};

const AmpVideoIframeWithKnobs = ({i, withPlaceholder, ...rest}) => {
  const group = i ? `Player ${i + 1}` : undefined;

  const width = text('width', '640px', group);
  const height = text('height', '360px', group);

  const ariaLabel = text('aria-label', 'Video Player');
  const autoplay = boolean('autoplay', true);
  const controls = boolean('controls', true);
  const mediasession = boolean('mediasession', true);
  const noaudio = boolean('noaudio', false);
  const loop = boolean('loop', false);
  const poster = text(
    'poster',
    'https://amp.dev/static/samples/img/amp-video-iframe-sample-placeholder.jpg'
  );

  const artist = text('artist', '');
  const album = text('album', '');
  const artwork = text('artwork', '');
  const title = text('title', '');

  const src = text(
    'src',
    'https://amp.dev/static/samples/files/amp-video-iframe-videojs.html'
  );

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
      {...rest}
      ariaLabel={ariaLabel}
      autoplay={autoplay}
      controls={controls}
      mediasession={mediasession}
      noaudio={noaudio}
      loop={loop}
      poster={poster}
      artist={artist}
      album={album}
      artwork={artwork}
      title={title}
      layout="responsive"
      width={width}
      height={height}
      src={src}
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

export const Default = () => {
  const amount = number('Amount', 1, {}, 'Page');
  const spacerHeight = text('Space', '80vh', 'Page');
  const spaceAbove = boolean('Space above', false, 'Page');
  const spaceBelow = boolean('Space below', false, 'Page');

  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<AmpVideoIframeWithKnobs key={i} i={i} />);
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

const ActionButton = ({children, ...props}) => (
  <button style={{flex: 1, margin: '0 4px'}} {...props}>
    {children}
  </button>
);

export const Actions = () => {
  return (
    <div style="max-width: 800px">
      <AmpVideoIframeWithKnobs id="player" />
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

export const WithPlaceholderAndFallback = () => {
  const amount = number('Amount', 1, {}, 'Page');
  const spacerHeight = text('Space', '80vh', 'Page');
  const spaceAbove = boolean('Space above', false, 'Page');
  const spaceBelow = boolean('Space below', false, 'Page');

  const players = [];
  for (let i = 0; i < amount; i++) {
    players.push(<AmpVideoIframeWithKnobs key={i} i={i} placeholder={true} />);
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
