import {BentoTwitter} from '#bento/components/bento-twitter/1.0/component';

import * as Preact from '#preact';

export default {
  title: 'Twitter',
  component: BentoTwitter,
};

export const _default = ({showCards, showConversation, ...args}) => {
  const cards = showCards ? undefined : 'hidden';
  const conversation = showConversation ? undefined : 'none';
  return (
    <BentoTwitter
      cards={cards}
      conversation={conversation}
      style={{width: '300px', height: '200px'}}
      {...args}
    />
  );
};

_default.argTypes = {
  tweetId: {
    name: 'tweetId',
    defaultValue: '1356304203044499462',
    options: [
      '1356304203044499462',
      '495719809695621121',
      '463440424141459456',
    ],
    control: {type: 'select'},
  },
  showCards: {
    name: 'show cards?',
    defaultValue: true,
    control: {type: 'boolean'},
  },
  showConversation: {
    name: 'show conversation?',
    defaultValue: false,
    control: {type: 'boolean'},
  },
};

export const moments = (args) => {
  return (
    <BentoTwitter
      {...args}
      momentid="1009149991452135424"
      style={{width: '300px', height: '200px'}}
    />
  );
};

moments.args = {
  limit: 2,
};

export const timelines = (args) => {
  return <BentoTwitter {...args} style={{width: '300px', height: '200px'}} />;
};

timelines.args = {
  tweetLimit: 5,
  timelineScreenName: 'amphtml',
  timelineUserId: '3450662892',
};

timelines.argTypes = {
  timelineSourceType: {
    name: 'timelineSourceType',
    defaultValue: 'profile',
    options: [
      'profile',
      'likes',
      'list',
      'source',
      'collection',
      'url',
      'widget',
    ],
    control: {type: 'select'},
  },
};
