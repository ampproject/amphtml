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

import * as Preact from '#preact';
import {withAmp} from '@ampproject/storybook-addon';
import {withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-brightcove-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-brightcove', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Default = () => {
  return (
    <amp-brightcove
      id="myPlayer"
      data-referrer="EXTERNAL_REFERRER"
      data-account="1290862519001"
      data-video-id="ref:amp-docs-sample"
      data-player-id="SyIOV8yWM"
      layout="responsive"
      width="480"
      height="270"
    ></amp-brightcove>
  );
};

export const Actions = () => {
  return (
    <>
      <button on="tap:myPlayer.play">Play</button>
      <button on="tap:myPlayer.pause">Pause</button>
      <button on="tap:myPlayer.mute">Mute</button>
      <button on="tap:myPlayer.unmute">Unmute</button>
      <button on="tap:myPlayer.fullscreen">Fullscreen</button>

      <p>Autoplay</p>
      <amp-brightcove
        id="myPlayer"
        autoplay
        data-account="1290862519001"
        data-video-id="ref:amp-docs-sample"
        data-player-id="SyIOV8yWM"
        layout="responsive"
        width="480"
        height="270"
      ></amp-brightcove>
    </>
  );
};
