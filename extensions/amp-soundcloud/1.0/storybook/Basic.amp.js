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

import * as Preact from '../../../../src/preact';
import {boolean, color, text, withKnobs} from '@storybook/addon-knobs';
import {rgba2hex} from '../converter';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-soundcloud-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-soundcloud', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const TrackId = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const height = text('Height', '180');
  const width = text('Width', 'auto');
  const trackid = text('Track ID', '864765493');
  const layout = text('Layout', 'fixed-height');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <amp-soundcloud
      color={hex}
      width="400"
      height="300"
      layout="responsive"
      sizes="(min-width: 600px) 320px, 100vw"
      data-trackid={trackid}
      data-visual={'"' + visual + '"'}
    />
  );
};

export const PlaylistId = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const height = text('Height', '180');
  const playlistId = text('Playlist ID', '151584683');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Bento Component
  return (
    <amp-soundcloud
      data-color={hex}
      data-playlistid={playlistId}
      data-visual={visual}
      height={height}
      layout="fixed-height"
    />
  );
};
