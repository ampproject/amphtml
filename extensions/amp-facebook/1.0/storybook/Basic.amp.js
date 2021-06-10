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

import * as Preact from '#preact/index';
import {boolean, select, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-facebook-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-facebook', version: '1.0'}],
    experiments: ['bento'],
  },
};

const SAMPLE_HREFS = {
  'post':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/',
  'video': 'https://www.facebook.com/NASA/videos/846648316199961/',
  'comment':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/?comment_id=10159193676606772',
};

export const Default = () => {
  const embedAs = select('embed type', ['post', 'video', 'comment'], 'post');
  const href = SAMPLE_HREFS[embedAs];
  const allowFullScreen = boolean('allowfullscreen', false);
  const locale = boolean('french locale') ? 'fr_FR' : undefined;
  const showText = boolean('show text (video only)', false);
  const includeCommentParent = boolean(
    'include comment parent (comment only)',
    false
  );
  return (
    <amp-facebook
      data-allowfullscreen={allowFullScreen}
      data-embed-as={embedAs}
      data-href={href}
      data-include-comment-parent={includeCommentParent}
      data-locale={locale}
      data-show-text={showText}
      width="300"
      height="200"
      layout="responsive"
    >
      <div placeholder>Loading...</div>
    </amp-facebook>
  );
};
