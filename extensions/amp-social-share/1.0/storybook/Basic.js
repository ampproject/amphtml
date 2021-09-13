import * as Preact from '#preact';

import {SocialShare} from '../component';

const types = [
  'email',
  'facebook',
  'linkedin',
  'pinterest',
  'tumblr',
  'twitter',
  'whatsapp',
  'line',
  'sms',
  'system',
  'custom',
  undefined,
];

export default {
  title: 'SocialShare',
  component: SocialShare,
  argTypes: {
    type: {control: {type: 'select'}, options: types},
    color: {control: {type: 'color'}},
    background: {control: {type: 'color'}},
  },
  args: {
    type: types[0],
    endpoint: '',
    params: {'subject': 'test'},
    target: '',
    width: '',
    height: '',
    children: '',
    color: '',
    background: '',
  },
};

export const _default = (args) => {
  return <SocialShare {...args} />;
};
