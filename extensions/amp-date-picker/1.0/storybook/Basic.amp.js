import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

import {getFormattedDate} from '../date-helpers';

const today = new Date();

export default {
  title: 'amp-date-picker-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-date-picker', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    'type': 'single',
    'layout': 'fixed-height',
    'height': '360',
    'initial-visible-month': getFormattedDate(today),
    'locale': 'en-us',
    'mode': 'static',
  },
};

export const _default = (args) => {
  return (
    <amp-date-picker {...args}>
      <input id="date" placeholder="Pick a date" />
      This text is inside.
    </amp-date-picker>
  );
};
