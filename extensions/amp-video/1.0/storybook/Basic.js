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
import {VideoWrapper} from '../video-wrapper';
import {boolean, number, object, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Video Wrapper',
  component: VideoWrapper,
  decorators: [withA11y, withKnobs],
};

const VideoTagPlayer = ({i}) => {
  const group = `Player ${i + 1}`;

  const width = text('width', '640px', group);
  const height = text('height', '360px', group);

  const ariaLabel = text('aria-label', 'Video Player', group);
  const autoplay = boolean('autoplay', true, group);
  const controls = boolean('controls', true, group);
  const mediasession = boolean('mediasession', true, group);
  const noaudio = boolean('noaudio', false, group);
  const loop = boolean('loop', false, group);
  const poster = text(
    'poster',
    'https://amp.dev/static/inline-examples/images/kitten-playing.png',
    group
  );

  const artist = text('artist', '', group);
  const album = text('album', '', group);
  const artwork = text('artwork', '', group);
  const title = text('title', '', group);

  const sources = object(
    'sources',
    [
      {
        src:
          'https://amp.dev/static/inline-examples/videos/kitten-playing.webm',
        type: 'video/webm',
      },
      {
        src: 'https://amp.dev/static/inline-examples/videos/kitten-playing.mp4',
        type: 'video/mp4',
      },
    ],
    group
  );

  return (
    <div style={{width, height}}>
      <VideoWrapper
        component="video"
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
      >
        {sources.map((props) => (
          <source {...props}></source>
        ))}
      </VideoWrapper>
    </div>
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

  return (
    <>
      {spaceAbove && <Spacer height={spacerHeight} />}
      {new Array(amount).fill(null).map((_, i) => (
        <>
          <VideoTagPlayer key={i} i={i} />
          {i < amount - 1 && <Spacer height={spacerHeight} />}
        </>
      ))}
      {spaceBelow && <Spacer height={spacerHeight} />}
    </>
  );
};
