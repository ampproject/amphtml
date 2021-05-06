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
import {VideoElementWithActions} from '../../../amp-video/1.0/storybook/_helpers';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-vimeo-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-vimeo', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Default = ({id}) => {
  const videoid = text('videoid', '27246366');
  const autoplay = boolean('autoplay', true);
  const doNotTrack = boolean('do-not-track', false);
  return (
    <amp-vimeo
      id={id}
      width="16"
      height="9"
      layout="responsive"
      autoplay={autoplay}
      data-videoid={videoid}
      do-not-track={doNotTrack}
    />
  );
};

export const Actions = () => {
  const id = 'my-vimeo';
  return (
    <VideoElementWithActions id={id}>
      <Default id={id} />
    </VideoElementWithActions>
  );
};
