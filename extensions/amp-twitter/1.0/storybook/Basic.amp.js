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
import {boolean, number, select, withKnobs} from '@storybook/addon-knobs';
import {withAmp} from '@ampproject/storybook-addon';

export default {
  title: 'amp-twitter-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [
      {
        name: 'amp-twitter',
        version: '1.0',
      },
    ],
    experiments: ['bento'],
  },
};

export const Default = () => {
  const tweetId = select(
    'tweet id',
    ['1356304203044499462', '495719809695621121', '463440424141459456'],
    '1356304203044499462'
  );
  const cards = boolean('show cards', true) ? undefined : 'hidden';
  const conversation = boolean('show conversation', false) ? undefined : 'none';
  return (
    <amp-twitter
      width="300"
      height="200"
      data-tweetid={tweetId}
      data-cards={cards}
      data-conversation={conversation}
    />
  );
};

export const moments = () => {
  const limit = number('limit to', 2);
  return (
    <amp-twitter
      data-limit={limit}
      data-momentid="1009149991452135424"
      width="300"
      height="200"
    />
  );
};

export const timelines = () => {
  const tweetLimit = number('limit to', 5);
  const timelineSourceType = select(
    'source type',
    ['profile', 'likes', 'list', 'source', 'collection', 'url', 'widget'],
    'profile'
  );
  const timelineScreenName = 'amphtml';
  const timelineUserId = '3450662892';
  return (
    <amp-twitter
      data-tweet-limit={tweetLimit}
      data-timeline-source-type={timelineSourceType}
      data-timeline-scree-name={timelineScreenName}
      data-timeline-user-id={timelineUserId}
      width="300"
      height="200"
    />
  );
};
