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
import {boolean, text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'amp-reddit-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-reddit', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Default = () => {
  const redditSrc = text(
    'redditSrc',
    'https://www.reddit.com/r/me_irl/comments/52rmir/me_irl/?ref=share&amp;ref_source=embed'
  );
  const embedType = text('embedType', 'post');
  return (
    <amp-reddit
      width="300"
      height="200"
      data-src={redditSrc}
      data-embedType={embedType}
    ></amp-reddit>
  );
};
