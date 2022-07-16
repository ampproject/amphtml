import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-twitter-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [
      {
        name: 'amp-twitter',
        version: '1.0',
      },
      {
        name: 'amp-bind',
        version: '0.1',
      },
    ],
    experiments: ['bento'],
  },
};

export const Default = ({showCards, showConverstion, ...args}) => {
  const cards = showCards ? undefined : 'hidden';
  const conversation = showConverstion ? undefined : 'none';
  return (
    <amp-twitter
      width="300"
      height="200"
      data-cards={cards}
      data-conversation={conversation}
      {...args}
    />
  );
};

Default.argTypes = {
  'data-tweetid': {
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

export const Moments = (args) => {
  return (
    <amp-twitter
      {...args}
      data-momentid="1009149991452135424"
      width="300"
      height="200"
    />
  );
};

Moments.args = {
  'data-limit': 2,
};

export const Timelines = (args) => {
  return <amp-twitter {...args} width="300" height="200" />;
};

Timelines.args = {
  'data-tweet-limit': 5,
  'data-timeline-screen-name': 'amphtml',
  'data-timeline-user-id': '3450662892',
};

Timelines.argTypes = {
  'data-timeline-source-type': {
    name: 'data-timeline-source-type',
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

export const DeletedTweet = ({withFallback}) => {
  return (
    <amp-twitter
      width="390"
      height="330"
      layout="fixed"
      data-tweetid="882818033403789316"
      data-cards="hidden"
    >
      <blockquote placeholder>
        <p lang="en" dir="ltr">
          In case you missed it last week, check out our recap of AMP in 2020
          ⚡🙌
        </p>
        <p>
          Watch here ➡️
          <br />
          <a href="https://t.co/eaxT3MuSAK">https://t.co/eaxT3MuSAK</a>
        </p>
      </blockquote>
      {withFallback && (
        <div fallback>
          An error occurred while retrieving the tweet. It might have been
          deleted.
        </div>
      )}
    </amp-twitter>
  );
};

DeletedTweet.args = {
  withFallback: true,
};

export const InvalidTweet = () => {
  return (
    <amp-twitter
      width="390"
      height="330"
      layout="fixed"
      data-tweetid="1111111111111641653602164060160"
      data-cards="hidden"
    >
      <blockquote placeholder class="twitter-tweet" data-lang="en">
        <p>
          This placeholder should never change because given tweet-id is
          invalid.
        </p>
      </blockquote>
    </amp-twitter>
  );
};

export const MutatedTweetId = () => {
  return (
    <>
      <button on="tap:AMP.setState({tweetid: '495719809695621121'})">
        Change tweet
      </button>
      <amp-state id="tweetid">
        <script type="application/json">1356304203044499462</script>
      </amp-state>
      <amp-twitter
        width="375"
        height="472"
        layout="responsive"
        data-tweetid="1356304203044499462"
        data-amp-bind-data-tweetid="tweetid"
      ></amp-twitter>
    </>
  );
};

export const SwapPlaceholder = () => {
  return (
    <>
      <button on="tap:AMP.setState({tweetid: '495719809695621121'})">
        Load tweet
      </button>
      <amp-state id="tweetid">
        <script type="application/json">1356304203044499462</script>
      </amp-state>
      <amp-twitter
        width="375"
        height="472"
        layout="responsive"
        data-amp-bind-data-tweetid="tweetid"
      >
        <blockquote placeholder class="twitter-tweet" data-lang="en">
          <p>Placeholder is shown until the tweet is loaded.</p>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
            eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
            ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
            aliquip ex ea commodo consequat. Duis aute irure dolor in
            reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla
            pariatur. Excepteur sint occaecat cupidatat non proident, sunt in
            culpa qui officia deserunt mollit anim id est laborum.
          </p>
        </blockquote>
      </amp-twitter>
    </>
  );
};
