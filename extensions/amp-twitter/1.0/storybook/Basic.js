import * as Preact from '#preact';
import {Twitter} from '../component';
import {boolean, number, select, withKnobs} from '@storybook/addon-knobs';

export default {
  title: 'Twitter',
  component: Twitter,
  decorators: [withKnobs],
};

export const _default = () => {
  const tweetId = select(
    'tweet id',
    ['1356304203044499462', '495719809695621121', '463440424141459456'],
    '1356304203044499462'
  );
  const cards = boolean('show cards', true) ? undefined : 'hidden';
  const conversation = boolean('show conversation', false) ? undefined : 'none';
  return (
    <Twitter
      cards={cards}
      conversation={conversation}
      tweetid={tweetId}
      style={{width: '300px', height: '200px'}}
    />
  );
};

export const moments = () => {
  const limit = number('limit to', 2);
  return (
    <Twitter
      limit={limit}
      momentid="1009149991452135424"
      style={{width: '300px', height: '200px'}}
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
    <Twitter
      tweetLimit={tweetLimit}
      timelineSourceType={timelineSourceType}
      timelineScreenName={timelineScreenName}
      timelineUserId={timelineUserId}
      style={{width: '300px', height: '200px'}}
    />
  );
};
