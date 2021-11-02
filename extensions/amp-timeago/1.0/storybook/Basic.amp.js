import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-timeago-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-timeago', version: '1.0'}],
    experiments: ['bento'],
  },
  argTypes: {
    datetime: {control: {type: 'date'}},
  },
  args: {
    datetime: new Date(),
    cutoff: 0,
    placeholder: 'Time passed!',
  },
};

export const Responsive = ({datetime, placeholder, ...args}) => {
  return (
    <amp-timeago
      layout="responsive"
      width="100"
      height="40"
      datetime={new Date(datetime).toISOString()}
      locale="en"
      {...args}
    >
      {placeholder}
    </amp-timeago>
  );
};

Responsive.storyName = 'responsive';
