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
import {
  BentoAccordion,
  BentoAccordionContent,
  BentoAccordionHeader,
  BentoAccordionSection,
} from '#bento/components/bento-accordion/1.0/component';
import {VideoIframe} from '#bento/components/bento-video/1.0/video-iframe';

import * as Preact from '#preact';
import {useCallback} from '#preact';

import {createCustomEvent} from '#utils/event-helper';

export default {
  title: 'VideoIframe',
  component: VideoIframe,
};

const AmpVideoIframeLike = ({unloadOnPause, ...rest}) => {
  const onMessage = useCallback((e) => {
    // Expect HTMLMediaElement events from document in `src` as
    // `{event: 'playing'}`
    // (video-iframe-integration-v0.js talks similarly to HTMLMediaElement,
    // so amp-video-iframe samples already mostly work).
    if (e.data?.event) {
      e.currentTarget.dispatchEvent(
        createCustomEvent(window, e.data.event, /* detail */ null, {
          bubbles: true,
          cancelable: true,
        })
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
    <VideoIframe
      {...rest}
      unloadOnPause={unloadOnPause}
      allow="autoplay" // this is not safe for a generic frame
      onMessage={onMessage}
      makeMethodMessage={makeMethodMessage}
    />
  );
};

export const UsingVideoIframe = ({height, width, ...args}) => {
  return <AmpVideoIframeLike style={{width, height}} {...args} />;
};

UsingVideoIframe.args = {
  width: '640px',
  height: '360px',
  autoplay: true,
  controls: true,
  noaudio: false,
  loop: false,
  'aria-label': 'Video Player',
  poster:
    'https://amp.dev/static/samples/img/amp-video-iframe-sample-placeholder.jpg',
  src: 'https://amp.dev/static/samples/files/amp-video-iframe-videojs.html',
  mediasession: true,
  artist: '',
  album: '',
  artwork: '',
  title: '',
};

export const InsideAccordion = ({height, width, ...args}) => {
  return (
    <BentoAccordion expandSingleSection>
      <BentoAccordionSection key={1} expanded>
        <BentoAccordionHeader>
          <h2>Controls</h2>
        </BentoAccordionHeader>
        <BentoAccordionContent>
          <AmpVideoIframeLike loop={true} style={{width, height}} {...args} />
        </BentoAccordionContent>
      </BentoAccordionSection>
    </BentoAccordion>
  );
};

InsideAccordion.args = {
  width: '640px',
  height: '360px',
  autoplay: true,
  controls: true,
  src: 'https://amp.dev/static/samples/files/amp-video-iframe-videojs.html',
  unloadOnPause: false,
};
