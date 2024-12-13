import {withAmp} from '@ampproject/storybook-addon';

import * as Preact from '#preact';

export default {
  title: 'amp-dailymotion-1_0',
  decorators: [withAmp],
  parameters: {
    extensions: [{name: 'amp-dailymotion', version: '1.0'}],
    experiments: ['bento'],
  },
  args: {
    width: 300,
    height: 200,
    'data-videoid': 'x3rdtfy',
  },
};

const Template = ({...args}) => <amp-dailymotion {...args}></amp-dailymotion>;

export const _default = (args) => <Template {...args} />;

export const _customSettings = (args) => <Template {...args} />;

_customSettings.args = {
  'data-endscreen-enable': false,
  'data-sharing-enable': false,
  'data-ui-highlight': '444444',
  'data-ui-logo': false,
  'data-info': false,
};

export const _autoplay = (args) => <Template {...args} />;

_autoplay.args = {
  autoplay: true,
};
