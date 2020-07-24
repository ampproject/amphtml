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
import {boolean, object, text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';

const {forwardRef, useRef, useImperativeHandle} = Preact;

export default {
  title: 'Video Wrapper',
  component: VideoWrapper,
  decorators: [withA11y, withKnobs],
};

const VideoTagPlayer = forwardRef((props, ref) => {
  const {
    children,

    src,
    muted,
    loop,
    controls,
    poster,

    'aria-label': ariaLabel,
    album,
    artist,
    artwork,
    title,

    onLoad,
    onLoadedMetadata,
    onPause,
    onPlaying,
  } = props;

  const videoNodeRef = useRef();

  useImperativeHandle(ref, () => ({
    play: () => videoNodeRef.current.play(),
    pause: () => videoNodeRef.current.pause(),
    getMetadata: () => ({
      title: title || '',
      artist: artist || '',
      album: album || '',
      artwork: [{src: artwork || poster || ''}],
    }),
  }));

  return (
    <video
      ref={videoNodeRef}
      aria-label={ariaLabel}
      src={src}
      muted={muted}
      loop={loop}
      controls={controls}
      onPlaying={onPlaying}
      onPause={onPause}
      poster={poster}
      style={{position: 'relative', width: '100%', height: '100%'}}
      onLoadedMetadata={() => {
        onLoad();
        onLoadedMetadata();
      }}
    >
      {children}
    </video>
  );
});

/**
 * @return {PreactDef.Renderable}
 */
function ScrollSpacer() {
  return (
    <div
      style={{
        height: '100vh',
        background: `linear-gradient(to bottom, #bbb, #bbb 10%, #fff 10%, #fff)`,
        backgroundSize: '100% 10px',
      }}
    ></div>
  );
}

export const _default = () => {
  const componentGroup = 'Component';

  const ariaLabel = text('aria-label', 'Video Player', componentGroup);
  const autoplay = boolean('autoplay', true, componentGroup);
  const controls = boolean('controls', true, componentGroup);
  const mediasession = boolean('mediasession', true, componentGroup);
  const loop = boolean('loop', false, componentGroup);
  const sources = object(
    'sources',
    [
      {
        src:
          'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
        type: 'video/mp4',
      },
    ],
    componentGroup
  );

  const containerGroup = 'Container';

  const width = text('Width', '640px', containerGroup);
  const height = text('Height', '360px', containerGroup);
  const scrollSpacers = boolean('Scroll spacers', false, containerGroup);

  return (
    <div style={{width, height}}>
      {scrollSpacers && <ScrollSpacer />}
      <VideoWrapper
        component={VideoTagPlayer}
        autoplay={autoplay}
        controls={controls}
        loop={loop}
        mediasession={mediasession}
        aria-label={ariaLabel}
      >
        {sources.map((props) => (
          <source {...props}></source>
        ))}
      </VideoWrapper>
      {scrollSpacers && <ScrollSpacer />}
    </div>
  );
};
