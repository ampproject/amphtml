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
import {Soundcloud} from '../component';
import {boolean, color, text, withKnobs} from '@storybook/addon-knobs';
import {rgba2hex} from '../converter';

export default {
  title: 'Soundcloud',
  component: Soundcloud,
  decorators: [withKnobs],
};

export const track = () => {
  // Knobs
  const componentColor = color('Color', 'RGBA(255, 85, 0, 1)');
  const trackid = text('Track ID', '864765493');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <Soundcloud
      color={hex}
      height="240"
      layout="fixed-height"
      trackId={trackid}
      visual={visual ? 'true' : 'false'}
    />
  );
};

export const playlist = () => {
  // Knobs
  const componentColor = color('color', 'RGBA(255, 85, 0, 1)');
  const playlistid = text('Playlist ID', '151584683');
  const visual = boolean('Visual', true);

  // Convert RGBA to HEX (without Alpha Channel)
  const hex = rgba2hex(componentColor);

  // Render Preact Component
  return (
    <Soundcloud
      color={hex}
      height="240"
      layout="fixed-height"
      playlistId={playlistid}
      visual={visual ? 'true' : 'false'}
    />
  );
};
