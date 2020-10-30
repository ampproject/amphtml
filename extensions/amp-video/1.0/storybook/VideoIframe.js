/**
 * Copyright 2020 The AMP HTML Authors. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS-IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import * as Preact from '../../../../src/preact';
import {VideoIframe} from '../video-iframe';
import {VideoWrapper} from '../video-wrapper';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {useCallback} from '../../../../src/preact';
import {withA11y} from '@storybook/addon-a11y';

export default {
  title: 'VideoIframe',
  component: VideoIframe,
  decorators: [withA11y, withKnobs],
};

const AmpVideoIframeLike = (props) => {
  const onMessage = useCallback((e) => {
    // Expect HTMLMediaElement events from document in `src` as
    // `{event: 'playing'}`
    // (video-iframe-integration-v0.js talks similarly to HTMLMediaElement,
    // so amp-video-iframe samples already mostly work).
    if (e.data?.event) {
      e.currentTarget.dispatchEvent(
        new CustomEvent(e.data.event, {bubbles: true, cancelable: true})
      );
    }
  }, []);

  const makeMethodMessage = useCallback(
    (method) =>
      JSON.stringify({
        // Like amp-video-iframe
        'event': 'method',
        'method': method.toLowerCase(),
      }),
    []
  );

  return (
    <VideoWrapper
      {...props}
      component={VideoIframe}
      allow="autoplay" // this is not safe for a generic frame
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
    />
  );
};

export const UsingVideoIframe = () => {
  const width = text('width', '640px');
  const height = text('height', '360px');

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
    <AmpVideoIframeLike
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
      style={{width, height}}
      src={src}
    />
  );
};
