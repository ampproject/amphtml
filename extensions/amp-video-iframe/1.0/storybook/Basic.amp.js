/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import * as Preact from '../../../../src/preact';
import {boolean, number, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-video-iframe-1_0',
  decorators: [withA11y, withKnobs, withAmp],
  parameters: {extensions: [{name: 'amp-video-iframe', version: '1.0'}]},
};

const AmpVideoIframeWithKnobs = ({i, ...rest}) => {
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
    ></amp-video-iframe>
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
