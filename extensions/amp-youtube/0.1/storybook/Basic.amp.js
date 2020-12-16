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
import {text, withKnobs} from '@storybook/addon-knobs';
import {withA11y} from '@storybook/addon-a11y';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-youtube-0_1',
  decorators: [withKnobs, withA11y, withAmp],

  parameters: {
    extensions: [{name: 'amp-youtube', version: 0.1}],
  },
};

export const Default = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="fixed"
      width="480"
      height="270"
    ></amp-youtube>
  );
};

Default.story = {
  name: 'default',
};

export const Responsive = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="responsive"
      width="480"
      height="270"
    ></amp-youtube>
  );
};

Responsive.story = {
  name: 'responsive',
};

export const Autoplay = () => {
  const videoId = text('Video ID', 'mGENRKrdoGY');
  return (
    <amp-youtube
      data-videoid={videoId}
      layout="fixed"
      width="480"
      height="270"
      autoplay
    ></amp-youtube>
  );
};

Autoplay.story = {
  name: 'autoplay',
};
