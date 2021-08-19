import {withAmp} from '@ampproject/storybook-addon';
import {date, number, text, withKnobs} from '@storybook/addon-knobs';

import * as Preact from '#preact';

export default {
  title: 'amp-timeago-1_0',
  decorators: [withKnobs, withAmp],

  parameters: {
    extensions: [{name: 'amp-timeago', version: '1.0'}],
    experiments: ['bento'],
  },
};

export const Responsive = () => {
  const datetime = date('Date/Time', new Date());
  const cutoff = number('Cutoff (seconds)', 0);
  const placeholder = text('Cutoff placeholder', 'Time passed!');
  return (
    <amp-timeago
      layout="responsive"
      width="100"
      height="40"
      datetime={new Date(datetime).toISOString()}
      cutoff={cutoff}
      locale="en"
    >
      {placeholder}
    </amp-timeago>
  );
};

Responsive.storyName = 'responsive';
