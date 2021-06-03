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
import {Facebook} from '../component';
import {boolean, select, text, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Facebook',
  component: Facebook,
  decorators: [withKnobs],
};

const SAMPLE_HREFS = {
  'post':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/',
  'video': 'https://www.facebook.com/NASA/videos/846648316199961/',
  'comment':
    'https://www.facebook.com/NASA/photos/a.67899501771/10159193669016772/?comment_id=10159193676606772',
};

export const _default = () => {
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
    <Facebook
      allowFullScreen={allowFullScreen}
      bootstrap="./vendor/facebook.max.js"
      embedAs={embedAs}
      href={href}
      includeCommentParent={includeCommentParent}
      locale={locale}
      showText={showText}
      src="http://ads.localhost:9001/dist.3p/current/frame.max.html"
      style={{width: '400px', height: '400px'}}
    >
      This text is inside.
    </Facebook>
  );
};

export const Comments = () => {
  const href = text(
    'href',
    'http://www.directlyrics.com/adele-25-complete-album-lyrics-news.html'
  );
  const numPosts = boolean('show 5 comments max') ? 5 : undefined;
  const orderBy = boolean('order by time') ? 'time' : undefined;
  const locale = boolean('french locale') ? 'fr_FR' : undefined;
  return (
    <Facebook
      bootstrap="./vendor/facebook.max.js"
      embedAs="comments"
      href={href}
      locale={locale}
      numPosts={numPosts}
      orderBy={orderBy}
      src="http://ads.localhost:9001/dist.3p/current/frame.max.html"
      style={{width: '400px', height: '400px'}}
    ></Facebook>
  );
};
