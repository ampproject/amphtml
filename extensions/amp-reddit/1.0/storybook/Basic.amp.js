import {withAmp} from '@ampproject/storybook-addon';
import {boolean, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

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
