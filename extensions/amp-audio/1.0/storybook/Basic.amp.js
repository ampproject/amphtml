/**
 * Copyright 2021 The AMP HTML Authors. All Rights Reserved.
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

import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-audio-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-audio', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const _default = () => {
  return (
    <amp-audio
      src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="75"
      width="auto"
      layout="fixed-height"
      controls
    >
      <div>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};

export const LoadAudioThroughSources = () => {
  return (
    <amp-audio
      artwork="https://storage.googleapis.com/media-session/sintel/artwork-512.png"
      title="Snow Fight"
      album="Jan Morgenstern"
      artist="Sintel"
      height="75"
      width="auto"
      layout="fixed-height"
      controls
    >
      <source
        src="https://storage.googleapis.com/media-session/sintel/snow-fight.mp3"
        type="audio/mpeg"
      />
      <div fallback>Your browser doesn’t support HTML5 audio</div>
    </amp-audio>
  );
};
