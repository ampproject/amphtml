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
import {Dock} from '../dock';
import {Dockable} from '../dockable';
import {VideoWrapper} from '../../../amp-video/1.0/video-wrapper';
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'Video Dock',
  component: Dock,
  decorators: [withA11y, withKnobs],
};

const Spacer = () => <div style={{height: '100vh'}}></div>;

const renderPlain = (isDocked, dockedStyle) => {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        background: 'blue',
        ...dockedStyle,
      }}
    ></div>
  );
};

export const Plain = () => {
  return (
    <Dock>
      <Spacer />
      <Dockable
        docks
        style={{width: 600, height: 400, background: 'gray'}}
        render={renderPlain}
      />
      <Spacer />
    </Dock>
  );
};

const VideoSingle = (props) => {
  const group = 'VideoWrapper';

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
    <VideoWrapper
      component="video"
      ariaLabel={ariaLabel}
      autoplay={autoplay}
      controls={controls}
      mediasession={mediasession}
      noaudio={noaudio}
      loop={loop}
      poster={poster}
      style={{width, height}}
      sources={sources.map((props) => (
        <source {...props}></source>
      ))}
      {...props}
    />
  );
};

export const Video = () => {
  return (
    <Dock>
      <Spacer />
      <VideoSingle dock />
      <Spacer />
    </Dock>
  );
};
